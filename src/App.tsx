import React, { useState, useCallback, useMemo, useContext, useEffect, FormEvent } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  Upload,
  Plus,
  Loader2,
  Lock,
  KeyRound,
  ShieldCheck,
  Pencil,
  ShieldOff,
} from 'lucide-react';
import {
  Header,
  FilterBar,
  WorkbookImportFlow,
  PropertyForm,
  TabBar,
  PropertyDetail,
} from './components/layout';
import type { Tab } from './components/layout/TabBar';
import GridContainer from './components/layout/GridContainer';
import { Button } from './components/ui';
import type { Lease } from './types/lease';
import { FilterGridContext, FilterGridProvider, SearchProvider } from './context';
import { getErrorMessage } from './utils/errors';
import logo from './assets/leasebook.webp';

type Page = 'list' | 'new-property' | 'import' | 'detail';

interface AuthStatus {
  password_enabled: boolean;
  passkey_enabled: boolean;
  authenticated: boolean;
  next_factor?: 'password' | 'passkey' | null;
}

interface AuthenticatedAppProps {
  authStatus: AuthStatus;
  onCreatePassword: (password: string) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onDisablePassword: (currentPassword: string) => Promise<void>;
  onCreatePasskey: () => Promise<void>;
  onDisablePasskeys: (currentPassword?: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

interface ListPageProps {
  loading: boolean;
  hasLeases: boolean;
  onPropertyClick: (id: number) => void;
  onPropertyEdit: (id: number) => void;
  onPropertyDelete: (id: number) => void;
  onNewProperty: () => void;
  onShowImport: () => void;
}

const ListPageContent = React.memo(function ListPageContent({
  loading,
  hasLeases,
  onPropertyClick,
  onPropertyEdit,
  onPropertyDelete,
  onNewProperty,
  onShowImport,
}: ListPageProps) {
  if (loading) {
    return (
      <div className="lb-loading-container">
        <Loader2 size={48} className="lb-spin" />
        <p className="lb-pulse lb-loading-text">Loading properties…</p>
      </div>
    );
  }
  if (hasLeases) {
    return (
      <>
        <FilterBar />
        <GridContainer
          onPropertyClick={onPropertyClick}
          onPropertyEdit={onPropertyEdit}
          onPropertyDelete={onPropertyDelete}
          onNewProperty={onNewProperty}
        />
      </>
    );
  }
  return (
    <div className="lb-empty-state-container">
      <h2 className="lb-empty-state-title">No leases yet</h2>
      <p className="lb-empty-state-text">Import a workbook or create a new lease to get started.</p>
      <div className="lb-empty-state-btn-container">
        <Button onClick={onNewProperty}>
          <Plus size={15} />
          Create New Lease
        </Button>
        <Button onClick={onShowImport}>
          <Upload size={15} />
          Import Workbook
        </Button>
      </div>
    </div>
  );
});

interface PasswordFormProps {
  submitLabel: string;
  onSubmit: (password: string) => Promise<void>;
  autoComplete?: string;
}

const PasswordForm = ({
  submitLabel,
  onSubmit,
  autoComplete = 'current-password',
}: Readonly<PasswordFormProps>) => {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitting(true);
      setError(null);

      try {
        await onSubmit(password);
        setPassword('');
      } catch (err) {
        setError(getErrorMessage(err, 'Authentication failed. Please try again.'));
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmit, password],
  );

  return (
    <form className="lb-auth-form" onSubmit={handleSubmit}>
      <label className="lb-auth-field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          autoComplete={autoComplete}
          minLength={8}
          required
        />
      </label>
      {error && <div className="lb-auth-error">{error}</div>}
      <Button type="submit" disabled={submitting}>
        {submitLabel}
      </Button>
    </form>
  );
};

interface ChangePasswordFormProps {
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}

const ChangePasswordForm = ({ onSubmit }: Readonly<ChangePasswordFormProps>) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitting(true);
      setError(null);

      try {
        await onSubmit(currentPassword, newPassword);
        setCurrentPassword('');
        setNewPassword('');
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to change password. Please try again.'));
      } finally {
        setSubmitting(false);
      }
    },
    [currentPassword, newPassword, onSubmit],
  );

  return (
    <form className="lb-auth-form" onSubmit={handleSubmit}>
      <label className="lb-auth-field">
        <span>Current password</span>
        <input
          type="password"
          value={currentPassword}
          onChange={event => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          minLength={8}
          required
        />
      </label>
      <label className="lb-auth-field">
        <span>New password</span>
        <input
          type="password"
          value={newPassword}
          onChange={event => setNewPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      {error && <div className="lb-auth-error">{error}</div>}
      <Button type="submit" disabled={submitting}>
        Save new password
      </Button>
    </form>
  );
};

interface LockedScreenProps {
  nextFactor: 'password' | 'passkey';
  isMfaFlow: boolean;
  onLogin: (password: string) => Promise<void>;
  onPasskeyLogin: () => Promise<void>;
}

const LockedScreen = ({
  nextFactor,
  isMfaFlow,
  onLogin,
  onPasskeyLogin,
}: Readonly<LockedScreenProps>) => {
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeySubmitting, setPasskeySubmitting] = useState(false);
  const isPasskeyStep = nextFactor === 'passkey';

  const handlePasskeyLogin = useCallback(async () => {
    setPasskeySubmitting(true);
    setPasskeyError(null);

    try {
      await onPasskeyLogin();
    } catch (err) {
      setPasskeyError(getErrorMessage(err, 'Passkey login failed. Please try again.'));
    } finally {
      setPasskeySubmitting(false);
    }
  }, [onPasskeyLogin]);

  return (
    <main className={`lb-auth-screen${isPasskeyStep ? ' lb-auth-screen-passkey' : ''}`}>
      <div className={`lb-auth-panel${isPasskeyStep ? ' lb-auth-panel-passkey' : ''}`}>
        <div className="lb-auth-brand">
          <img className="lb-auth-logo" src={logo} alt="LeaseBook logo" />
        </div>
        {isPasskeyStep ? (
          <div className="lb-mfa-content">
            <div className="lb-mfa-icon" aria-hidden="true">
              <ShieldCheck size={28} />
            </div>
            <div className="lb-mfa-copy">
              <h1>{"Verify it's you"}</h1>
              <p>
                {isMfaFlow
                  ? 'Password accepted. Finish signing in with your passkey.'
                  : 'Finish signing in with your passkey.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="lb-mfa-content">
            <div className="lb-mfa-icon" aria-hidden="true">
              <Lock size={26} />
            </div>
            <div className="lb-mfa-copy">
              <h1>Sign in to LeaseBook</h1>
              <p>Enter your password to continue.</p>
            </div>
          </div>
        )}
        {isPasskeyStep && (
          <Button
            type="button"
            className="lb-mfa-passkey-button"
            onClick={handlePasskeyLogin}
            disabled={passkeySubmitting}
          >
            <KeyRound size={15} />
            {passkeySubmitting ? 'Waiting for passkey' : 'Use passkey'}
          </Button>
        )}
        {nextFactor === 'password' && <PasswordForm submitLabel="Log in" onSubmit={onLogin} />}
        {passkeyError && <div className="lb-auth-error">{passkeyError}</div>}
      </div>
    </main>
  );
};

interface SettingsPageProps {
  authStatus: AuthStatus;
  onCreatePassword: (password: string) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onDisablePassword: (currentPassword: string) => Promise<void>;
  onCreatePasskey: () => Promise<void>;
  onDisablePasskeys: (currentPassword?: string) => Promise<void>;
}

const SettingsPage = ({
  authStatus,
  onCreatePassword,
  onChangePassword,
  onDisablePassword,
  onCreatePasskey,
  onDisablePasskeys,
}: Readonly<SettingsPageProps>) => {
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDisablePassword, setShowDisablePassword] = useState(false);
  const [showDisablePasskeys, setShowDisablePasskeys] = useState(false);
  const [passkeySubmitting, setPasskeySubmitting] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  const handleCreatePassword = useCallback(
    async (password: string) => {
      await onCreatePassword(password);
      setShowCreatePassword(false);
    },
    [onCreatePassword],
  );

  const handleChangePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await onChangePassword(currentPassword, newPassword);
      setShowChangePassword(false);
    },
    [onChangePassword],
  );

  const handleDisablePassword = useCallback(
    async (currentPassword: string) => {
      await onDisablePassword(currentPassword);
      setShowDisablePassword(false);
      setShowChangePassword(false);
    },
    [onDisablePassword],
  );

  const handleCreatePasskey = useCallback(async () => {
    setPasskeySubmitting(true);
    setPasskeyError(null);

    try {
      await onCreatePasskey();
    } catch (err) {
      setPasskeyError(getErrorMessage(err, 'Unable to create passkey. Please try again.'));
    } finally {
      setPasskeySubmitting(false);
    }
  }, [onCreatePasskey]);

  const handleDisablePasskeys = useCallback(async (currentPassword?: string) => {
    setPasskeySubmitting(true);
    setPasskeyError(null);

    try {
      await onDisablePasskeys(currentPassword);
      setShowDisablePasskeys(false);
    } catch (err) {
      setPasskeyError(getErrorMessage(err, 'Unable to remove passkeys. Please try again.'));
    } finally {
      setPasskeySubmitting(false);
    }
  }, [onDisablePasskeys]);

  const handleRemovePasskeysClick = useCallback(() => {
    setPasskeyError(null);
    if (authStatus.password_enabled) {
      setShowDisablePasskeys(value => !value);
      return;
    }

    void handleDisablePasskeys();
  }, [authStatus.password_enabled, handleDisablePasskeys]);

  const authSummary =
    authStatus.password_enabled || authStatus.passkey_enabled
      ? 'Authentication is enabled.'
      : 'No auth setup';

  return (
    <section className="lb-settings-page">
      <div className="lb-settings-section">
        <div className="lb-settings-section-header">
          <div>
            <h2>Authentication</h2>
            <p>{authSummary}</p>
          </div>
          <ShieldCheck size={22} />
        </div>

        {!authStatus.password_enabled && !showCreatePassword && (
          <Button type="button" onClick={() => setShowCreatePassword(true)}>
            <Lock size={15} />
            Create password
          </Button>
        )}

        {!authStatus.password_enabled && showCreatePassword && (
          <PasswordForm
            submitLabel="Save"
            onSubmit={handleCreatePassword}
            autoComplete="new-password"
          />
        )}

        {authStatus.password_enabled && (
          <>
            <div className="lb-auth-enabled-row">
              <KeyRound size={16} />
              Password enabled
            </div>
            <div className="lb-settings-action-row">
              <Button type="button" onClick={() => setShowChangePassword(value => !value)}>
                <Pencil size={15} />
                Change password
              </Button>
              <Button type="button" onClick={() => setShowDisablePassword(value => !value)}>
                <ShieldOff size={15} />
                Remove password protection
              </Button>
            </div>
            {showChangePassword && <ChangePasswordForm onSubmit={handleChangePassword} />}
            {showDisablePassword && (
              <PasswordForm submitLabel="Remove protection" onSubmit={handleDisablePassword} />
            )}
          </>
        )}
      </div>

      <div className="lb-settings-section">
        <div className="lb-settings-section-header">
          <div>
            <h2>Alternate methods</h2>
            <p>
              {authStatus.passkey_enabled
                ? 'Passkey login is enabled.'
                : 'Add a passkey with your browser.'}
            </p>
          </div>
        </div>
        {authStatus.passkey_enabled && (
          <div className="lb-auth-enabled-row">
            <KeyRound size={16} />
            Passkey enabled
          </div>
        )}
        <div className="lb-auth-method-list">
          <button
            type="button"
            onClick={authStatus.passkey_enabled ? handleRemovePasskeysClick : handleCreatePasskey}
            disabled={passkeySubmitting}
          >
            {authStatus.passkey_enabled ? 'Remove passkeys' : 'Create passkey'}
          </button>
        </div>
        {authStatus.passkey_enabled && authStatus.password_enabled && showDisablePasskeys && (
          <PasswordForm
            submitLabel="Continue"
            onSubmit={handleDisablePasskeys}
            autoComplete="current-password"
          />
        )}
        {!authStatus.passkey_enabled && (
          <div className="lb-auth-note">A browser tab will open to finish setup.</div>
        )}
        {passkeyError && <div className="lb-auth-error">{passkeyError}</div>}
      </div>
    </section>
  );
};

const AuthenticatedApp = ({
  authStatus,
  onCreatePassword,
  onChangePassword,
  onDisablePassword,
  onCreatePasskey,
  onDisablePasskeys,
  onLogout,
}: Readonly<AuthenticatedAppProps>) => {
  const { leases, totalCount, loading, activeStage, removeLease, updateLease, refresh } =
    useContext(FilterGridContext);
  const [currentPage, setCurrentPage] = useState<Page>('list');
  const [activeTab, setActiveTab] = useState<Tab>('properties');
  const [selectedLeaseId, setSelectedLeaseId] = useState<number | null>(null);
  const [startInEditMode, setStartInEditMode] = useState(false);

  const handleImported = useCallback(() => {
    refresh();
    setCurrentPage('list');
  }, [refresh]);

  const handlePropertyCreated = useCallback(() => {
    refresh();
    setCurrentPage('list');
  }, [refresh]);

  const handlePropertyFormCancel = useCallback(() => {
    setCurrentPage('list');
  }, []);

  const hasLeases = useMemo(
    () => leases.length > 0 || totalCount > 0 || activeStage !== null,
    [activeStage, leases.length, totalCount],
  );

  const handleNewProperty = useCallback(() => {
    setCurrentPage('new-property');
  }, []);

  const handleShowImportFlow = useCallback(() => {
    setCurrentPage('import');
  }, []);

  const handlePropertyClick = useCallback((id: number) => {
    setSelectedLeaseId(id);
    setStartInEditMode(false);
    setCurrentPage('detail');
  }, []);

  const handlePropertyEdit = useCallback((id: number) => {
    setSelectedLeaseId(id);
    setStartInEditMode(true);
    setCurrentPage('detail');
  }, []);

  const handlePropertyDelete = useCallback(
    async (id: number) => {
      try {
        await invoke('remove_lease', { leaseId: id });
        removeLease(id);

        // If we're on the detail view, go back to list
        if (currentPage === 'detail' && selectedLeaseId === id) {
          setCurrentPage('list');
        }
      } catch (err) {
        console.error('[LeaseBook] Failed to delete lease:', err);
        alert(getErrorMessage(err, 'Failed to delete property. Please try again.'));
      }
    },
    [currentPage, selectedLeaseId, removeLease],
  );

  const handleBackToList = useCallback(() => {
    setCurrentPage('list');
    // We intentionally don't clear selectedLeaseId here so the unmount is smooth
  }, []);

  const handleLeaseSaved = useCallback(
    (updated: Lease) => {
      updateLease(updated);

      // If the edit was launched directly from the grid view, go back to the grid.
      if (startInEditMode) {
        setCurrentPage('list');
      }
    },
    [startInEditMode, updateLease],
  );

  const isListPage = currentPage === 'list';
  const showListContent = isListPage && activeTab === 'properties';

  return (
    <main>
      {isListPage && (
        <>
          <Header
            onNewProperty={handleNewProperty}
            showLogout={authStatus.password_enabled || authStatus.passkey_enabled}
            onLogout={onLogout}
          />
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}

      {/* List page — always mounted; hidden via CSS so no layout recalculation on show */}
      <div className={`lb-app-content${showListContent ? '' : ' lb-page-hidden'}`}>
        <ListPageContent
          loading={loading}
          hasLeases={hasLeases}
          onPropertyClick={handlePropertyClick}
          onPropertyEdit={handlePropertyEdit}
          onPropertyDelete={handlePropertyDelete}
          onNewProperty={handleNewProperty}
          onShowImport={handleShowImportFlow}
        />
      </div>

      {isListPage && activeTab === 'settings' && (
        <div className="lb-app-content">
          <SettingsPage
            authStatus={authStatus}
            onCreatePassword={onCreatePassword}
            onChangePassword={onChangePassword}
            onDisablePassword={onDisablePassword}
            onCreatePasskey={onCreatePasskey}
            onDisablePasskeys={onDisablePasskeys}
          />
        </div>
      )}

      {isListPage && activeTab === 'dashboard' && (
        <div className="lb-app-content">
          <div className="lb-empty-state-container">
            <h2 className="lb-empty-state-title">Dashboard</h2>
          </div>
        </div>
      )}

      {/* Form pages — lightweight, safe to conditionally mount */}
      {currentPage === 'new-property' && (
        <div className="lb-app-content-no-header">
          <PropertyForm onClose={handlePropertyFormCancel} onCreated={handlePropertyCreated} />
        </div>
      )}

      {currentPage === 'import' && (
        <div className="lb-app-content-no-header">
          <WorkbookImportFlow
            onImported={handleImported}
            onCancel={() => setCurrentPage('list')}
            autoOpen
          />
        </div>
      )}

      {currentPage === 'detail' && selectedLeaseId !== null && (
        <div className="lb-app-content-no-header">
          <PropertyDetail
            lease={leases.find(l => l.id === selectedLeaseId)!}
            onBack={handleBackToList}
            onSaved={handleLeaseSaved}
            onDelete={() => handlePropertyDelete(selectedLeaseId)}
            initialEditMode={startInEditMode}
          />
        </div>
      )}
    </main>
  );
};

const App = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);

  useEffect(() => {
    invoke<AuthStatus>('auth_status')
      .then(setAuthStatus)
      .catch(err => {
        console.error('[LeaseBook] Failed to load auth status:', err);
        setAuthStatus({
          password_enabled: false,
          passkey_enabled: false,
          authenticated: true,
          next_factor: null,
        });
      });
  }, []);

  const handleCreatePassword = useCallback(async (password: string) => {
    const nextStatus = await invoke<AuthStatus>('create_auth_password', { password });
    setAuthStatus(nextStatus);
  }, []);

  const handleChangePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const nextStatus = await invoke<AuthStatus>('change_auth_password', {
      currentPassword,
      newPassword,
    });
    setAuthStatus(nextStatus);
  }, []);

  const handleDisablePassword = useCallback(async (currentPassword: string) => {
    const nextStatus = await invoke<AuthStatus>('disable_auth_password', { currentPassword });
    setAuthStatus(nextStatus);
  }, []);

  const handleCreatePasskey = useCallback(async () => {
    const nextStatus = await invoke<AuthStatus>('browser_passkey_registration');
    setAuthStatus(nextStatus);
  }, []);

  const handleDisablePasskeys = useCallback(
    async (currentPassword?: string) => {
      if (authStatus?.password_enabled) {
        if (currentPassword === undefined) {
          throw new Error('Password is required before removing passkeys.');
        }
        await invoke<AuthStatus>('verify_auth_password', { password: currentPassword });
      }

      await invoke<AuthStatus>('browser_passkey_login');
      const nextStatus = await invoke<AuthStatus>('disable_auth_passkeys');
      setAuthStatus(nextStatus);
    },
    [authStatus?.password_enabled],
  );

  const handleLogin = useCallback(async (password: string) => {
    const nextStatus = await invoke<AuthStatus>('auth_login', { password });
    setAuthStatus(nextStatus);
  }, []);

  const handlePasskeyLogin = useCallback(async () => {
    const nextStatus = await invoke<AuthStatus>('browser_passkey_login');
    setAuthStatus(nextStatus);
  }, []);

  const handleLogout = useCallback(async () => {
    const nextStatus = await invoke<AuthStatus>('auth_logout');
    setAuthStatus(nextStatus);
  }, []);

  if (authStatus === null) {
    return (
      <main className="lb-loading-container">
        <Loader2 size={48} className="lb-spin" />
      </main>
    );
  }

  if ((authStatus.password_enabled || authStatus.passkey_enabled) && !authStatus.authenticated) {
    const nextFactor =
      authStatus.next_factor ??
      (authStatus.password_enabled ? 'password' : authStatus.passkey_enabled ? 'passkey' : null);

    if (nextFactor === null) {
      return (
        <main className="lb-loading-container">
          <Loader2 size={48} className="lb-spin" />
        </main>
      );
    }

    return (
      <LockedScreen
        nextFactor={nextFactor}
        isMfaFlow={
          authStatus.password_enabled && authStatus.passkey_enabled && nextFactor === 'passkey'
        }
        onLogin={handleLogin}
        onPasskeyLogin={handlePasskeyLogin}
      />
    );
  }

  return (
    <SearchProvider>
      <FilterGridProvider>
        <AuthenticatedApp
          authStatus={authStatus}
          onCreatePassword={handleCreatePassword}
          onChangePassword={handleChangePassword}
          onDisablePassword={handleDisablePassword}
          onCreatePasskey={handleCreatePasskey}
          onDisablePasskeys={handleDisablePasskeys}
          onLogout={handleLogout}
        />
      </FilterGridProvider>
    </SearchProvider>
  );
};

export default App;
