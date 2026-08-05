import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { invoke } from '@tauri-apps/api/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  confirm: vi.fn(),
}));

const leaseRow = (id: number, name: string, expirationDate: number) => ({
  id,
  name,
  address: `${id} Main St`,
  size: 2500,
  expiration_date: expirationDate,
  notes: null,
  misc_data: null,
  created_on: 1_700_000_000,
  managers: [],
});

const renderApp = () => render(<App />);

describe('App list empty states', () => {
  beforeEach(() => {
    vi.mocked(invoke).mockReset();
  });

  it('shows an in-grid empty message for zero-result filters', async () => {
    const user = userEvent.setup();
    let leaseFetchCount = 0;

    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'auth_status') {
        return Promise.resolve({
          password_enabled: false,
          passkey_enabled: false,
          authenticated: true,
        });
      }

      leaseFetchCount += 1;
      if (leaseFetchCount === 1) {
        return Promise.resolve({
          leases: [leaseRow(1, 'Active Office', 1_800_000_000)],
          total_count: 1,
        });
      }

      return Promise.resolve({
        leases: [],
        total_count: 0,
      });
    });

    renderApp();

    await waitFor(() => expect(screen.getByText('Active Office')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /Contacted/i }));

    await waitFor(() => expect(screen.getByText('No properties')).toBeInTheDocument());
    expect(screen.queryByText('No leases yet')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All Properties/i })).toBeInTheDocument();
  });
});

describe('App auth flow', () => {
  beforeEach(() => {
    vi.mocked(invoke).mockReset();
    vi.unstubAllGlobals();
    Object.defineProperty(navigator, 'credentials', {
      configurable: true,
      value: undefined,
    });
  });

  it('shows password setup from Settings when auth is not configured', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'auth_status') {
        return Promise.resolve({
          password_enabled: false,
          passkey_enabled: false,
          authenticated: true,
        });
      }

      if (command === 'create_auth_password') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: false,
          authenticated: true,
        });
      }

      return Promise.resolve({
        leases: [],
        total_count: 0,
      });
    });

    renderApp();

    await user.click(await screen.findByRole('button', { name: /Settings/i }));
    expect(screen.getByText('No auth setup')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Create password/i }));
    await user.type(screen.getByLabelText('Password'), 'correct-password');
    await user.click(screen.getByRole('button', { name: /^Save$/i }));

    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith('create_auth_password', {
        password: 'correct-password',
      }),
    );
    expect(await screen.findByText('Password enabled')).toBeInTheDocument();
  });

  it('shows a centered password prompt while logged out', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'auth_status') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: false,
          authenticated: false,
        });
      }

      if (command === 'auth_login') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: false,
          authenticated: true,
        });
      }

      return Promise.resolve({
        leases: [],
        total_count: 0,
      });
    });

    renderApp();

    expect(await screen.findByAltText('LeaseBook logo')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Settings/i })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Password'), 'correct-password');
    await user.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith('auth_login', {
        password: 'correct-password',
      }),
    );
    expect(await screen.findByRole('button', { name: /Settings/i })).toBeInTheDocument();
  });

  it('requires password before passkey when both local auth methods are configured', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'auth_status') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: true,
          authenticated: false,
          next_factor: 'password',
        });
      }

      if (command === 'auth_login') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: true,
          authenticated: false,
          next_factor: 'passkey',
        });
      }

      if (command === 'browser_passkey_login') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: true,
          authenticated: true,
          next_factor: null,
        });
      }

      return Promise.resolve({
        leases: [],
        total_count: 0,
      });
    });

    renderApp();

    expect(await screen.findByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign in to LeaseBook')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Use passkey/i })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Password'), 'correct-password');
    await user.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith('auth_login', {
        password: 'correct-password',
      }),
    );
    expect(await screen.findByText("Verify it's you")).toBeInTheDocument();
    expect(
      screen.getByText('Password accepted. Finish signing in with your passkey.'),
    ).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Use passkey/i })).toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Use passkey/i }));

    await waitFor(() => expect(invoke).toHaveBeenCalledWith('browser_passkey_login'));
    expect(await screen.findByRole('button', { name: /Settings/i })).toBeInTheDocument();
  });

  it('uses passkey first when passkey is the only configured local auth method', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'auth_status') {
        return Promise.resolve({
          password_enabled: false,
          passkey_enabled: true,
          authenticated: false,
          next_factor: 'passkey',
        });
      }

      if (command === 'browser_passkey_login') {
        return Promise.resolve({
          password_enabled: false,
          passkey_enabled: true,
          authenticated: true,
          next_factor: null,
        });
      }

      return Promise.resolve({
        leases: [],
        total_count: 0,
      });
    });

    renderApp();

    expect(await screen.findByRole('button', { name: /Use passkey/i })).toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Use passkey/i }));

    await waitFor(() => expect(invoke).toHaveBeenCalledWith('browser_passkey_login'));
    expect(invoke).not.toHaveBeenCalledWith('auth_login', expect.anything());
  });

  it('changes the password from Settings when auth is configured', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'auth_status') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: false,
          authenticated: true,
        });
      }

      if (command === 'change_auth_password') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: false,
          authenticated: true,
        });
      }

      return Promise.resolve({
        leases: [],
        total_count: 0,
      });
    });

    renderApp();

    await user.click(await screen.findByRole('button', { name: /Settings/i }));
    await user.click(screen.getByRole('button', { name: /Change password/i }));
    await user.type(screen.getByLabelText('Current password'), 'correct-password');
    await user.type(screen.getByLabelText('New password'), 'new-password');
    await user.click(screen.getByRole('button', { name: /Save new password/i }));

    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith('change_auth_password', {
        currentPassword: 'correct-password',
        newPassword: 'new-password',
      }),
    );
  });

  it('removes password protection from Settings when auth is configured', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'auth_status') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: false,
          authenticated: true,
        });
      }

      if (command === 'disable_auth_password') {
        return Promise.resolve({
          password_enabled: false,
          passkey_enabled: false,
          authenticated: true,
        });
      }

      return Promise.resolve({
        leases: [],
        total_count: 0,
      });
    });

    renderApp();

    await user.click(await screen.findByRole('button', { name: /Settings/i }));
    await user.click(screen.getByRole('button', { name: /Remove password protection/i }));
    await user.type(screen.getByLabelText('Password'), 'correct-password');
    await user.click(screen.getByRole('button', { name: /Remove protection/i }));

    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith('disable_auth_password', {
        currentPassword: 'correct-password',
      }),
    );
    expect(await screen.findByText('No auth setup')).toBeInTheDocument();
  });

  it('offers browser passkey setup when the app window lacks WebAuthn support', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'auth_status') {
        return Promise.resolve({
          password_enabled: false,
          passkey_enabled: false,
          authenticated: true,
        });
      }

      return Promise.resolve({
        leases: [],
        total_count: 0,
      });
    });

    renderApp();

    await user.click(await screen.findByRole('button', { name: /Settings/i }));

    expect(screen.getByText('Add a passkey with your browser.')).toBeInTheDocument();
    expect(screen.getByText('A browser tab will open to finish setup.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create passkey/i })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /Google SSO/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Microsoft SSO/i })).not.toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalledWith('start_passkey_registration');
  });

  it('creates a passkey from Settings through the browser ceremony', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'auth_status') {
        return Promise.resolve({
          password_enabled: false,
          passkey_enabled: false,
          authenticated: true,
        });
      }

      if (command === 'browser_passkey_registration') {
        return Promise.resolve({
          password_enabled: false,
          passkey_enabled: true,
          authenticated: true,
        });
      }

      return Promise.resolve({
        leases: [],
        total_count: 0,
      });
    });

    renderApp();

    await user.click(await screen.findByRole('button', { name: /Settings/i }));
    await user.click(screen.getByRole('button', { name: /Create passkey/i }));

    await waitFor(() => expect(invoke).toHaveBeenCalledWith('browser_passkey_registration'));
    expect(await screen.findByText('Passkey enabled')).toBeInTheDocument();
  });

  it('requires password and passkey confirmation before removing passkeys from Settings', async () => {
    const user = userEvent.setup();

    vi.mocked(invoke).mockImplementation(command => {
      if (command === 'auth_status') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: true,
          authenticated: true,
        });
      }

      if (command === 'auth_login') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: true,
          authenticated: false,
          next_factor: 'passkey',
        });
      }

      if (command === 'browser_passkey_login') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: true,
          authenticated: true,
        });
      }

      if (command === 'disable_auth_passkeys') {
        return Promise.resolve({
          password_enabled: true,
          passkey_enabled: false,
          authenticated: true,
        });
      }

      return Promise.resolve({
        leases: [],
        total_count: 0,
      });
    });

    renderApp();

    await user.click(await screen.findByRole('button', { name: /Settings/i }));
    await user.click(screen.getByRole('button', { name: /Remove passkeys/i }));

    expect(invoke).not.toHaveBeenCalledWith('disable_auth_passkeys');

    await user.type(screen.getByLabelText('Password'), 'correct-password');
    await user.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith('verify_auth_password', { password: 'correct-password' }),
    );
    expect(invoke).toHaveBeenCalledWith('browser_passkey_login');
    expect(invoke).toHaveBeenCalledWith('disable_auth_passkeys');
    expect(await screen.findByText('Add a passkey with your browser.')).toBeInTheDocument();
  });
});
