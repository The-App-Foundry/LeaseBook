import React, { useCallback, useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { confirm } from '@tauri-apps/plugin-dialog';
import DOMPurify from 'dompurify';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import type { Lease, Manager } from '../../types/lease';
import './PropertyDetail.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PropertyDetailProps {
  lease: Lease;
  onBack: () => void;
  onSaved: (updated: Lease) => void;
  onDelete?: () => void;
  initialEditMode?: boolean;
}

interface EditFields {
  name: string;
  address: string;
  stage: string;
  leaseExpiration: string;
  propertySize: string;
  decisionMakerName: string;
  decisionEmail: string;
  decisionPhone: string;
}

interface DbLeaseResult {
  id: number;
  name: string;
  address: string | null;
  size: number | null;
  expiration_date: number | null;
  notes: string | null;
  misc_data: string | null;
  created_on: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STAGE_OPTIONS = ['New', 'Contacted', 'Qualified', 'Negotiating', 'Won', 'Lost'];

const STAGE_COLORS: Record<string, { bg: string; abbr: string }> = {
  New:         { bg: '#94A3B8', abbr: 'NW' },
  Contacted:   { bg: '#3B82F6', abbr: 'CN' },
  Qualified:   { bg: '#10B981', abbr: 'QL' },
  Negotiating: { bg: '#F59E0B', abbr: 'NG' },
  Won:         { bg: '#0D9488', abbr: 'WN' },
  Lost:        { bg: '#94A3B8', abbr: 'LT' },
};

const getStageInfo = (status: string) => {
  const v = status.toLowerCase();
  if (v.includes('qualified')) return STAGE_COLORS['Qualified'];
  if (v.includes('prospect') || v.includes('contact')) return STAGE_COLORS['Contacted'];
  if (v.includes('negotiating')) return STAGE_COLORS['Negotiating'];
  if (v.includes('won')) return STAGE_COLORS['Won'];
  if (v.includes('lost')) return STAGE_COLORS['Lost'];
  return STAGE_COLORS['New'];
};

// Detect if a string looks like plain text (no HTML tags) so we can render
// it with white-space:pre-wrap instead of dangerouslySetInnerHTML.
const looksLikePlainText = (str: string) => !/<[a-z][\s\S]*>/i.test(str);

// Normalise a date string for a <input type="date"> (YYYY-MM-DD)
const normaliseDate = (raw: string): string => {
  if (!raw || raw === '-') return '';
  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const dateToUnix = (iso: string): number | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const ms = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  return isNaN(ms) ? null : Math.floor(ms / 1000);
};

const unixToIso = (ts: number): string => {
  const d = new Date(ts * 1000);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
};

// ---------------------------------------------------------------------------
// RTF Toolbar
// ---------------------------------------------------------------------------
interface RtfToolbarProps {
  editor: ReturnType<typeof useEditor>;
}

const RtfToolbar = ({ editor }: RtfToolbarProps) => {
  if (!editor) return null;

  return (
    <div className="lb-rtf-toolbar">
      <button
        type="button"
        title="Bold"
        className={`lb-rtf-tool-btn${editor.isActive('bold') ? ' active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        title="Italic"
        className={`lb-rtf-tool-btn${editor.isActive('italic') ? ' active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
      >
        <em>I</em>
      </button>
      <button
        type="button"
        title="Underline"
        className={`lb-rtf-tool-btn${editor.isActive('underline') ? ' active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
      >
        <u>U</u>
      </button>
      <div className="lb-rtf-separator" />
      <button
        type="button"
        title="Bullet List"
        className={`lb-rtf-tool-btn${editor.isActive('bulletList') ? ' active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
      >
        ≡
      </button>
      <button
        type="button"
        title="Numbered List"
        className={`lb-rtf-tool-btn${editor.isActive('orderedList') ? ' active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
      >
        1.
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const PropertyDetail = ({ lease, onBack, onSaved, onDelete, initialEditMode }: Readonly<PropertyDetailProps>) => {
  const { status, name, businessAddr, leaseExpiration, managers = [], size, note } = lease;

  const stageInfo = getStageInfo(status);
  const primaryManager = managers.length > 0 ? managers[0] : null;

  // ------------------------------------------------------------------
  // Edit state
  // ------------------------------------------------------------------
  const [isEditing, setIsEditing] = useState(initialEditMode ?? false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<EditFields>({
    name: '',
    address: '',
    stage: 'Qualified',
    leaseExpiration: '',
    propertySize: '',
    decisionMakerName: '',
    decisionEmail: '',
    decisionPhone: '',
  });

  // Tiptap editor — always mounted but only visible/active in edit mode
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: '',
    editorProps: {
      attributes: { class: 'tiptap' },
    },
  });

  // ------------------------------------------------------------------
  // Edit actions
  // ------------------------------------------------------------------
  const startEdit = useCallback(() => {
    // Seed edit fields from current lease data
    const expIso = normaliseDate(leaseExpiration ?? '');
    const stageLabel = (() => {
      const v = status.toLowerCase();
      if (v.includes('qualified')) return 'Qualified';
      if (v.includes('prospect') || v.includes('contact')) return 'Contacted';
      if (v.includes('negotiating')) return 'Negotiating';
      if (v.includes('won')) return 'Won';
      if (v.includes('lost')) return 'Lost';
      return 'New';
    })();

    setEditFields({
      name: name ?? '',
      address: businessAddr ?? '',
      stage: stageLabel,
      leaseExpiration: expIso,
      propertySize: size ?? '',
      decisionMakerName: primaryManager?.name ?? lease.leaseManager ?? '',
      decisionEmail: primaryManager?.email ?? '',
      decisionPhone: primaryManager?.phoneNumbers?.[0] ?? '',
    });

    // Seed the RTF editor with existing note content.
    // If the note looks like plain text, wrap in a <p> so Tiptap handles it.
    if (editor) {
      const rawNote = note ?? '';
      const initialHtml = looksLikePlainText(rawNote) && rawNote
        ? `<p>${rawNote.replace(/\n/g, '</p><p>')}</p>`
        : rawNote;
      editor.commands.setContent(initialHtml, { emitUpdate: false });
    }

    setSaveError(null);
    setIsEditing(true);
  }, [lease, name, businessAddr, status, leaseExpiration, size, primaryManager, note, editor]);

  const initializedRef = useRef(false);
  useEffect(() => {
    if (initialEditMode && editor && !initializedRef.current) {
      initializedRef.current = true;
      startEdit();
    }
  }, [initialEditMode, editor, startEdit]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setSaveError(null);
  }, []);

  const saveEdit = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);

    try {
      // Unix seconds — the DB column is i32, so ms would overflow.
      const nowSecs = Math.floor(Date.now() / 1000);

      // Expiration date as Unix seconds
      const expTs = editFields.leaseExpiration
        ? dateToUnix(editFields.leaseExpiration)
        : null;

      // Parse size: strip non-numeric chars, keep only the leading integer
      const sizeRaw = editFields.propertySize.replace(/[^0-9]/g, '');
      const sizeParsed: number | null = sizeRaw ? parseInt(sizeRaw, 10) : null;

      // Notes HTML from the RTF editor
      const notesHtml = editor ? editor.getHTML() : (note ?? null);
      // Treat a completely empty Tiptap doc as null
      const notesValue: string | null =
        notesHtml === '<p></p>' || notesHtml === '' ? null : (notesHtml ?? null);

      // ----------------------------------------------------------------
      // 1. Persist lease fields
      //    Shape must match UpdateLeaseInput in models.rs (snake_case)
      // ----------------------------------------------------------------
      const updatedDbLease = await invoke<DbLeaseResult>('edit_lease', {
        leaseId: lease.id,
        changes: {
          name: editFields.name.trim() || null,
          address: editFields.address.trim() || null,
          size: sizeParsed,
          expiration_date: expTs,
          notes: notesValue,
          misc_data: null,
          last_modified: nowSecs,
        },
      });

      // ----------------------------------------------------------------
      // 2. Persist primary manager fields (if one exists)
      //    Shape must match UpdateManagerInput in models.rs (snake_case)
      // ----------------------------------------------------------------
      if (primaryManager) {
        await invoke('edit_manager', {
          managerId: primaryManager.id,
          changes: {
            name: editFields.decisionMakerName.trim() || null,
            email: editFields.decisionEmail.trim() || null,
            phone_numbers: editFields.decisionPhone.trim() || null,
            last_modified: nowSecs,
          },
        });
      }

      // ----------------------------------------------------------------
      // 3. Build the optimistic updated Lease for the UI
      // ----------------------------------------------------------------
      const updatedManagerName =
        editFields.decisionMakerName.trim() || (primaryManager?.name ?? lease.leaseManager ?? '');

      const updatedManagers: Manager[] = primaryManager
        ? [
            {
              ...primaryManager,
              name: editFields.decisionMakerName.trim() || primaryManager.name,
              email: editFields.decisionEmail.trim() || undefined,
              phoneNumbers: editFields.decisionPhone.trim()
                ? [editFields.decisionPhone.trim()]
                : primaryManager.phoneNumbers,
            },
          ]
        : managers;

      // Map DB stage field → UI status
      const updatedStatus: 'qualified' | 'prospect' =
        editFields.stage === 'Lost' ? 'prospect' : 'qualified';

      // Prefer the size string the user typed so "12,500 sq ft" is preserved;
      // fall back to the integer the DB echoes back.
      const displaySize =
        editFields.propertySize.trim() ||
        (updatedDbLease.size != null ? String(updatedDbLease.size) : '');

      const updatedLease: Lease = {
        ...lease,
        name: updatedDbLease.name,
        businessAddr: updatedDbLease.address ?? undefined,
        size: displaySize,
        leaseExpiration: updatedDbLease.expiration_date
          ? unixToIso(updatedDbLease.expiration_date)
          : editFields.leaseExpiration || '-',
        status: updatedStatus,
        leaseManager: updatedManagerName,
        managers: updatedManagers,
        note: notesValue ?? undefined,
      };

      onSaved(updatedLease);
      setIsEditing(false);
    } catch (err) {
      console.error('[PropertyDetail] saveEdit failed:', err);
      setSaveError(typeof err === 'string' ? err : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [saving, editFields, editor, note, lease, primaryManager, managers, onSaved]);

  const setField = useCallback(
    <K extends keyof EditFields>(key: K, value: EditFields[K]) => {
      setEditFields(prev => ({ ...prev, [key]: value }));
    },
    [],
  );

  // ------------------------------------------------------------------
  // Read-mode expiration banner
  // ------------------------------------------------------------------
  const isExpired = status === 'prospect';
  const expirationBadgeBg = isExpired ? '#FDECEC' : '#ECFDF5';
  const expirationBadgeBorder = isExpired ? '#F7C9C9' : '#A7F3D0';
  const expirationDateColor = isExpired ? '#C22B2B' : '#0F7A55';
  const expirationLabelColor = isExpired ? '#C22B2B' : '#0F7A55';
  const expirationTagBg = isExpired ? '#D64545' : '#FFFFFF';
  const expirationTagColor = isExpired ? '#FFFFFF' : '#0F7A55';
  const expirationBadgeText = isExpired ? 'EXPIRED' : 'ACTIVE';

  // ------------------------------------------------------------------
  // Note rendering helpers
  // ------------------------------------------------------------------
  const renderNote = () => {
    const rawNote = note ?? '';
    if (!rawNote) {
      return (
        <div className="lb-detail-notes-text">
          No notes available for this property.
        </div>
      );
    }
    if (looksLikePlainText(rawNote)) {
      return <div className="lb-detail-notes-text">{rawNote}</div>;
    }
    // RTF/HTML note — sanitize before rendering
    const clean = DOMPurify.sanitize(rawNote, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'br'],
      ALLOWED_ATTR: [],
    });
    return (
      <div
        className="lb-detail-notes-html"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="lb-detail-outer">
      <button className="lb-detail-back-btn" onClick={onBack}>
        ← Back to Properties
      </button>

      <div className="lb-detail-card">

        {/* ===================== EDIT MODE ===================== */}
        {isEditing && (
          <>
            {/* Header row: avatar + fields + Cancel/Save */}
            <div className="lb-edit-header">
              <div className="lb-edit-header-left">
                <div
                  className="lb-detail-avatar"
                  style={{ backgroundColor: stageInfo.bg }}
                >
                  {stageInfo.abbr}
                </div>
                <div className="lb-edit-header-fields">
                  <input
                    className="lb-edit-name-input"
                    value={editFields.name}
                    onChange={e => setField('name', e.target.value)}
                    placeholder="Company Name"
                    id="edit-name"
                  />
                  <input
                    className="lb-edit-input"
                    value={editFields.address}
                    onChange={e => setField('address', e.target.value)}
                    placeholder="Address"
                    id="edit-address"
                  />
                  <select
                    className="lb-edit-select"
                    value={editFields.stage}
                    onChange={e => setField('stage', e.target.value)}
                    id="edit-stage"
                  >
                    {STAGE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="lb-edit-header-actions">
                <button
                  type="button"
                  className="lb-edit-cancel-btn"
                  onClick={cancelEdit}
                  disabled={saving}
                  id="edit-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="lb-edit-save-btn"
                  onClick={saveEdit}
                  disabled={saving}
                  id="edit-save-btn"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            {/* Row 1: Lease Expiration | Property Size */}
            <div className="lb-edit-grid">
              <div>
                <label className="lb-edit-label" htmlFor="edit-exp">
                  LEASE EXPIRATION
                </label>
                <input
                  id="edit-exp"
                  type="date"
                  className="lb-edit-input"
                  value={editFields.leaseExpiration}
                  onChange={e => {
                    setField('leaseExpiration', e.target.value);
                    if (e.target.value) e.currentTarget.blur();
                  }}
                />
              </div>
              <div>
                <label className="lb-edit-label" htmlFor="edit-size">
                  PROPERTY SIZE
                </label>
                <input
                  id="edit-size"
                  className="lb-edit-input"
                  placeholder="e.g. 12,500 sq ft"
                  value={editFields.propertySize}
                  onChange={e => setField('propertySize', e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Decision Maker — 3 cols across full width */}
            <div className="lb-edit-dm-row">
              <div>
                <label className="lb-edit-label" htmlFor="edit-dm-name">DECISION MAKER</label>
                <input
                  className="lb-edit-input"
                  placeholder="Name"
                  value={editFields.decisionMakerName}
                  onChange={e => setField('decisionMakerName', e.target.value)}
                  id="edit-dm-name"
                />
              </div>
              <div>
                <label className="lb-edit-label" htmlFor="edit-dm-email">EMAIL</label>
                <input
                  className="lb-edit-input"
                  placeholder="Email"
                  type="email"
                  value={editFields.decisionEmail}
                  onChange={e => setField('decisionEmail', e.target.value)}
                  id="edit-dm-email"
                />
              </div>
              <div>
                <label className="lb-edit-label" htmlFor="edit-dm-phone">PHONE</label>
                <input
                  className="lb-edit-input"
                  placeholder="Phone"
                  type="tel"
                  value={editFields.decisionPhone}
                  onChange={e => setField('decisionPhone', e.target.value)}
                  id="edit-dm-phone"
                />
              </div>
            </div>


            {/* Row 3: Notes — full width */}
            <div className="lb-detail-notes-edit-wrapper">
              <label className="lb-edit-label">NOTES</label>
              <div className="lb-rtf-wrapper">
                <RtfToolbar editor={editor} />
                <div className="lb-rtf-editor">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>

            {saveError && (
              <p className="lb-detail-save-error">
                {saveError}
              </p>
            )}

          </>
        )}

        {/* ===================== READ MODE ===================== */}
        {!isEditing && (
          <>
            {/* Header */}
            <div className="lb-detail-header">
              <div className="lb-detail-header-left">
                <div
                  className="lb-detail-avatar"
                  style={{ backgroundColor: stageInfo.bg }}
                >
                  {stageInfo.abbr}
                </div>
                <div>
                  <div className="lb-detail-title">{name}</div>
                  <div className="lb-detail-address">
                    <span>📍</span> {businessAddr || '-'}
                  </div>
                  <div className="lb-detail-stage">
                    {status.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="lb-detail-actions">
                <button
                  className="lb-detail-edit-btn"
                  onClick={startEdit}
                  id="detail-edit-btn"
                >
                  Edit
                </button>
                {onDelete && (
                  <button
                    className="lb-detail-delete-btn"
                    onClick={async () => {
                      const yes = await confirm('Are you sure you want to delete this property?', {
                        title: 'Delete Property',
                        kind: 'warning',
                      });
                      if (yes) {
                        onDelete();
                      }
                    }}
                    id="detail-delete-btn"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Expiration Banner */}
            <div
              className="lb-detail-exp-banner"
              style={{
                backgroundColor: expirationBadgeBg,
                borderColor: expirationBadgeBorder,
              }}
            >
              <div className="lb-detail-exp-info">
                <span className="lb-detail-emoji">📅</span>
                <div>
                  <div className="lb-detail-exp-label" style={{ color: expirationLabelColor }}>
                    Lease Expiration
                  </div>
                  <div className="lb-detail-exp-date" style={{ color: expirationDateColor }}>
                    {leaseExpiration}
                  </div>
                </div>
              </div>
              <div
                className="lb-detail-exp-tag"
                style={{
                  backgroundColor: expirationTagBg,
                  color: expirationTagColor,
                }}
              >
                {expirationBadgeText}
              </div>
            </div>

            {/* Details Grid */}
            <div className="lb-detail-grid">
              <div className="lb-detail-box">
                <div className="lb-detail-box-label">DECISION MAKER</div>
                <div className="lb-detail-box-value">{lease.leaseManager}</div>
                {primaryManager?.email && (
                  <div className="lb-detail-box-sub">✉ {primaryManager.email}</div>
                )}
                {primaryManager?.phoneNumbers && primaryManager.phoneNumbers.length > 0 && (
                  <div className="lb-detail-box-sub lb-detail-dm-phone">
                    ☎ {primaryManager.phoneNumbers.join(', ')}
                  </div>
                )}
                {!primaryManager?.email &&
                  (!primaryManager?.phoneNumbers || primaryManager.phoneNumbers.length === 0) && (
                    <div className="lb-detail-box-sub">No contact information provided.</div>
                  )}
              </div>

              <div className="lb-detail-box">
                <div className="lb-detail-box-label">PROPERTY SIZE</div>
                <div className="lb-detail-box-value-large">
                  {size ? `${size} sq ft` : '-'}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="lb-detail-notes">
              <div className="lb-detail-box-label">NOTES</div>
              {renderNote()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(PropertyDetail);
