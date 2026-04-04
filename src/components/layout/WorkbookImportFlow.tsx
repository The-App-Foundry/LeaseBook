import { useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { ChevronLeft, Upload, Table2, Link2 } from 'lucide-react';
import { Button } from '../ui';
import type { Lease } from '../../types/lease';
import { detectManagers } from '../../utils/managerDetect';

type LeaseFieldKey =
  | 'name'
  | 'address'
  | 'manager'
  | 'manager_email'
  | 'manager_phone_number'
  | 'expiration_date'
  | 'days_to_expire'
  | 'expired'
  | 'notes';

interface WorkbookImportFlowProps {
  onImported: (leases: Lease[]) => void;
  onCancel?: () => void;
  autoOpen?: boolean;
}

interface ParsedSheet {
  name: string;
  headers: string[];
}

interface ParsedSpreadsheet {
  sheets: ParsedSheet[];
}

interface BackendLeaseManager {
  name: string;
  email: string;
  phone_number: string;
}

interface BackendLease {
  name: string;
  address: string;
  lease_manager: BackendLeaseManager;
  expiration_date: string | null;
  days_to_expire: number | null;
  expired: boolean | null;
  notes: string;
  misc_data: string;
}

const FIELDS: Array<{ key: LeaseFieldKey; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'manager', label: 'Manager' },
  { key: 'manager_email', label: 'Manager Email' },
  { key: 'manager_phone_number', label: 'Manager Phone' },
  { key: 'expiration_date', label: 'Expiration Date' },
  { key: 'days_to_expire', label: 'Days To Expire' },
  { key: 'expired', label: 'Expired' },
  { key: 'notes', label: 'Notes' },
];

const ALIASES: Record<LeaseFieldKey, string[]> = {
  name: ['name', 'property', 'property name', 'company name'],
  address: ['address', 'location', 'business address', 'business addr'],
  manager: ['manager', 'decision maker', 'lease manager', 'contact'],
  manager_email: ['manager email', 'email'],
  manager_phone_number: ['manager phone', 'phone', 'phone number'],
  expiration_date: ['expiration date', 'lease expiration', 'expiry date'],
  days_to_expire: ['days to expire', 'days until expiry'],
  expired: ['expired', 'is expired'],
  notes: ['notes', 'note', 'comments'],
};

const normalize = (value: string): string => value.toLowerCase().replaceAll(/[^a-z0-9]/g, '');

const autoDetectHeaders = (headers: string[]): Record<LeaseFieldKey, string> => {
  const normalized = headers.map(header => ({ raw: header, normalized: normalize(header) }));
  const next = {} as Record<LeaseFieldKey, string>;

  FIELDS.forEach(({ key }) => {
    const match = normalized.find(item =>
      ALIASES[key].some(alias => normalize(alias) === item.normalized),
    );
    next[key] = match?.raw ?? '';
  });

  return next;
};

const formatExpirationDate = (isoDateStr: string): string => {
  const datePart = isoDateStr.slice(0, 10); // "2026-03-15"
  const parts = datePart.split('-');
  if (parts.length !== 3) return datePart;
  const [year, month, day] = parts;
  return `${month}/${day}/${year}`;
};

const convertBackendLeasesToUi = (rows: BackendLease[]): Lease[] =>
  rows.map(item => {
    // Build a raw string from all available manager fields for auto-detection
    const rawParts = [
      item.lease_manager?.name,
      item.lease_manager?.phone_number,
      item.lease_manager?.email,
    ].filter(Boolean);
    const rawManagerStr = rawParts.join(' ');

    const { managers } = detectManagers(rawManagerStr);
    const displayName = managers.map(m => m.name).join(', ') || '-';

    // If no managers were detected but backend had a name, create an unverified entry
    const finalManagers =
      managers.length === 0 && item.lease_manager?.name
        ? [{ id: `mgr-${Date.now()}-fallback`, name: item.lease_manager.name, verified: false }]
        : managers;

    return {
      status: item.expired ? 'prospect' : 'qualified',
      name: item.name || 'Unnamed',
      businessAddr: item.address || '-',
      leaseExpiration: item.expiration_date ? formatExpirationDate(item.expiration_date) : '-',
      leaseManager: displayName,
      managers: finalManagers,
      note: item.notes || item.misc_data || undefined,
    };
  });

const getFileName = (path: string): string => {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] || path;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
};

const WorkbookImportFlow = ({
  onImported,
  onCancel,
  autoOpen,
}: Readonly<WorkbookImportFlowProps>) => {
  const [workbookPath, setWorkbookPath] = useState('');
  const [workbookName, setWorkbookName] = useState('');
  const [spreadsheet, setSpreadsheet] = useState<ParsedSpreadsheet | null>(null);
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [mappingByKey, setMappingByKey] = useState<Record<LeaseFieldKey, string> | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const autoOpenFired = useRef(false);

  useEffect(() => {
    if (autoOpen && !autoOpenFired.current) {
      autoOpenFired.current = true;
      void handleUpload();
    }
  }, []); // autoOpen is intentionally read only on mount

  const selectedSheet = useMemo(() => {
    if (!spreadsheet || !selectedSheetName) return null;
    return spreadsheet.sheets.find(sheet => sheet.name === selectedSheetName) ?? null;
  }, [spreadsheet, selectedSheetName]);

  const handleUpload = async (): Promise<void> => {
    setError('');
    setIsBusy(true);

    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: 'Spreadsheet',
            extensions: ['xlsx', 'xls', 'csv', 'ods'],
          },
        ],
      });

      if (!selected || Array.isArray(selected)) {
        return;
      }

      const path = selected;

      const parsed = await invoke<ParsedSpreadsheet>('parse_spreadsheet', { path });
      const firstSheet = parsed.sheets[0];

      setWorkbookPath(path);
      setWorkbookName(getFileName(path));
      setSpreadsheet(parsed);
      setSelectedSheetName(firstSheet?.name ?? '');
      setMappingByKey(firstSheet ? autoDetectHeaders(firstSheet.headers) : null);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError, 'Failed to parse workbook.'));
      setWorkbookPath('');
      setWorkbookName('');
      setSpreadsheet(null);
      setSelectedSheetName('');
      setMappingByKey(null);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSheetChange = (nextSheetName: string): void => {
    setSelectedSheetName(nextSheetName);
    const sheet = spreadsheet?.sheets.find(entry => entry.name === nextSheetName);
    if (sheet) {
      setMappingByKey(autoDetectHeaders(sheet.headers));
    }
  };

  const handleMappingChange = (fieldKey: LeaseFieldKey, header: string): void => {
    setMappingByKey(current => {
      if (!current) return current;
      return {
        ...current,
        [fieldKey]: header,
      };
    });
  };

  const handleImport = async (): Promise<void> => {
    if (!workbookPath || !selectedSheetName || !mappingByKey) {
      return;
    }

    const columnMapping = Object.entries(mappingByKey).reduce<Record<string, string>>(
      (acc, [key, header]) => {
        if (header.trim()) {
          acc[header] = key;
        }
        return acc;
      },
      {},
    );

    setIsBusy(true);
    setError('');

    try {
      const imported = await invoke<BackendLease[]>('parse_spreadsheet_to_leases', {
        path: workbookPath,
        columnMapping,
        sheetName: selectedSheetName,
      });

      // Persist all parsed leases to the database
      await invoke('import_parsed_leases', { leases: imported });

      onImported(convertBackendLeasesToUi(imported));
      // Reset form state so the mapping UI collapses after a successful import
      setWorkbookPath('');
      setWorkbookName('');
      setSpreadsheet(null);
      setSelectedSheetName('');
      setMappingByKey(null);
    } catch (importError) {
      setError(getErrorMessage(importError, 'Failed to import leases.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="lb-workbook-wrapper">
      <div className="lb-card lb-workbook-card">
        {onCancel && (
          <Button
            $variant="ghost"
            onClick={onCancel}
            style={{ marginRight: 0, paddingLeft: '0.25rem' }}
          >
            <ChevronLeft size={14} />
            Back
          </Button>
        )}

        <h2 style={{ margin: 0, fontSize: '1rem' }}>Workbook Import</h2>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
          Upload workbook, select a sheet, confirm column mapping, and import.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Workbook File</label>
          <Button onClick={handleUpload} $variant="outline" disabled={isBusy}>
            <Upload size={15} />
            {isBusy ? 'Working...' : 'Upload Workbook'}
          </Button>
          {workbookName ? (
            <span
              style={{
                fontSize: '0.75rem',
                borderRadius: 'var(--lb-radius-sm)',
                padding: '0.2rem 0.45rem',
                border: '1px solid var(--lb-border)',
                background: '#f8fafc',
              }}
            >
              {workbookName}
            </span>
          ) : null}
        </div>

        {spreadsheet ? (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label htmlFor="sheet-select" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Sheet
            </label>
            <select
              id="sheet-select"
              className="lb-form-select"
              style={{ width: 'auto' }}
              value={selectedSheetName}
              onChange={event => handleSheetChange(event.target.value)}
            >
              {spreadsheet.sheets.map(sheet => (
                <option key={sheet.name} value={sheet.name}>
                  {sheet.name}
                </option>
              ))}
            </select>
            <span
              style={{
                fontSize: '0.75rem',
                borderRadius: 'var(--lb-radius-sm)',
                padding: '0.2rem 0.45rem',
                border: '1px solid var(--lb-border)',
                background: '#f8fafc',
              }}
            >
              <Table2 size={12} style={{ marginRight: 6, verticalAlign: 'text-bottom', display: 'inline' }} />
              {spreadsheet.sheets.length} sheets
            </span>
          </div>
        ) : null}

        {selectedSheet && mappingByKey ? (
          <>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link2 size={14} />
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                Auto-detected mapping is prefilled. Change any selection before importing.
              </p>
            </div>

            <div className="lb-field-grid">
              {FIELDS.map(field => (
                <div key={field.key} style={{ display: 'contents' }}>
                  <label
                    htmlFor={`mapping-${field.key}`}
                    style={{ fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    {field.label}
                  </label>
                  <select
                    id={`mapping-${field.key}`}
                    className="lb-form-select"
                    value={mappingByKey[field.key]}
                    onChange={event => handleMappingChange(field.key, event.target.value)}
                  >
                    <option value="">Not mapped</option>
                    {selectedSheet.headers.map(header => (
                      <option key={`${field.key}-${header}`} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button onClick={handleImport} disabled={isBusy}>
                {isBusy ? 'Importing...' : 'Import Selected Sheet'}
              </Button>
            </div>
          </>
        ) : null}

        {error ? (
          <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.82rem' }}>{error}</p>
        ) : null}
      </div>
    </div>
  );
};

export default WorkbookImportFlow;
