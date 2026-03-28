import { useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import styled from 'styled-components';
import { Upload, Table2, Link2 } from 'lucide-react';
import { Button, Card } from '../ui';
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

const Wrapper = styled.div`
  margin: 16px 0;
  padding: 0 16px;
`;

const ImportCard = styled(Card)`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  align-items: flex-start;
  flex-direction: column;
  gap: 0.75rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Row = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 0.5rem 0.75rem;
  width: 100%;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const Select = styled.select`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.5rem 0.65rem;
  font-size: 0.85rem;
  background: ${({ theme }) => theme.colors.surface};
`;

const Hint = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
`;

const ErrorText = styled.p`
  margin: 0;
  color: #b91c1c;
  font-size: 0.82rem;
`;

const Badge = styled.span`
  font-size: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.2rem 0.45rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #f8fafc;
`;

function normalize(value: string): string {
  return value.toLowerCase().replaceAll(/[^a-z0-9]/g, '');
}

function autoDetectHeaders(headers: string[]): Record<LeaseFieldKey, string> {
  const normalized = headers.map(header => ({ raw: header, normalized: normalize(header) }));
  const next = {} as Record<LeaseFieldKey, string>;

  FIELDS.forEach(({ key }) => {
    const match = normalized.find(item =>
      ALIASES[key].some(alias => normalize(alias) === item.normalized),
    );
    next[key] = match?.raw ?? '';
  });

  return next;
}

function formatExpirationDate(isoDateStr: string): string {
  const datePart = isoDateStr.slice(0, 10); // "2026-03-15"
  const parts = datePart.split('-');
  if (parts.length !== 3) return datePart;
  const [year, month, day] = parts;
  return `${month}/${day}/${year}`;
}

function convertBackendLeasesToUi(rows: BackendLease[]): Lease[] {
  return rows.map(item => {
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
      size: '-',
      note: item.notes || item.misc_data || undefined,
    };
  });
}

function getFileName(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] || path;
}

function getErrorMessage(error: unknown, fallback: string): string {
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
}

export default function WorkbookImportFlow({ onImported }: Readonly<WorkbookImportFlowProps>) {
  const [workbookPath, setWorkbookPath] = useState('');
  const [workbookName, setWorkbookName] = useState('');
  const [spreadsheet, setSpreadsheet] = useState<ParsedSpreadsheet | null>(null);
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [mappingByKey, setMappingByKey] = useState<Record<LeaseFieldKey, string> | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const selectedSheet = useMemo(() => {
    if (!spreadsheet || !selectedSheetName) return null;
    return spreadsheet.sheets.find(sheet => sheet.name === selectedSheetName) ?? null;
  }, [spreadsheet, selectedSheetName]);

  async function handleUpload() {
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
  }

  function handleSheetChange(nextSheetName: string) {
    setSelectedSheetName(nextSheetName);
    const sheet = spreadsheet?.sheets.find(entry => entry.name === nextSheetName);
    if (sheet) {
      setMappingByKey(autoDetectHeaders(sheet.headers));
    }
  }

  function handleMappingChange(fieldKey: LeaseFieldKey, header: string) {
    setMappingByKey(current => {
      if (!current) return current;
      return {
        ...current,
        [fieldKey]: header,
      };
    });
  }

  async function handleImport() {
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

      onImported(convertBackendLeasesToUi(imported));
    } catch (importError) {
      setError(getErrorMessage(importError, 'Failed to import leases.'));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Wrapper>
      <ImportCard>
        <Title>Workbook Import</Title>
        <Hint>Upload workbook, select a sheet, confirm column mapping, and import.</Hint>

        <Row>
          <Label>Workbook File</Label>
          <Button onClick={handleUpload} $variant="outline" disabled={isBusy}>
            <Upload size={15} />
            {isBusy ? 'Working...' : 'Upload Workbook'}
          </Button>
          {workbookName ? <Badge>{workbookName}</Badge> : null}
        </Row>

        {spreadsheet ? (
          <Row>
            <Label htmlFor="sheet-select">Sheet</Label>
            <Select
              id="sheet-select"
              value={selectedSheetName}
              onChange={event => handleSheetChange(event.target.value)}
            >
              {spreadsheet.sheets.map(sheet => (
                <option key={sheet.name} value={sheet.name}>
                  {sheet.name}
                </option>
              ))}
            </Select>
            <Badge>
              <Table2 size={12} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
              {spreadsheet.sheets.length} sheets
            </Badge>
          </Row>
        ) : null}

        {selectedSheet && mappingByKey ? (
          <>
            <Row>
              <Link2 size={14} />
              <Hint>
                Auto-detected mapping is prefilled. Change any selection before importing.
              </Hint>
            </Row>
            <FieldGrid>
              {FIELDS.map(field => (
                <div key={field.key} style={{ display: 'contents' }}>
                  <Label htmlFor={`mapping-${field.key}`}>{field.label}</Label>
                  <Select
                    id={`mapping-${field.key}`}
                    value={mappingByKey[field.key]}
                    onChange={event => handleMappingChange(field.key, event.target.value)}
                  >
                    <option value="">Not mapped</option>
                    {selectedSheet.headers.map(header => (
                      <option key={`${field.key}-${header}`} value={header}>
                        {header}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
            </FieldGrid>

            <Row>
              <Button onClick={handleImport} disabled={isBusy}>
                {isBusy ? 'Importing...' : 'Import Selected Sheet'}
              </Button>
            </Row>
          </>
        ) : null}

        {error ? <ErrorText>{error}</ErrorText> : null}
      </ImportCard>
    </Wrapper>
  );
}
