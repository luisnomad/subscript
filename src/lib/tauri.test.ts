import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as tauriCore from '@tauri-apps/api/core';
import { 
  getSubscriptions, 
  getSubscriptionById, 
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getDomains,
  getPendingImports,
  approvePendingImport,
  rejectPendingImport,
  batchApprovePendingImports,
  batchRejectPendingImports,
  getSettings,
  triggerEmailSync,
  clearTestDatabase,
} from './tauri';

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('tauri command wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSubscriptions calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue([]);
    await getSubscriptions(true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('get_subscriptions', { testMode: true });
  });

  it('getSubscriptionById calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue(null);
    await getSubscriptionById(1, true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('get_subscription_by_id', { id: 1, testMode: true });
  });

  it('createSubscription calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue(1);
    const sub = { name: 'Test', cost: 10, currency: 'USD', billingCycle: 'monthly' as const, nextBillingDate: null, status: 'active' as const, category: null, notes: null };
    await createSubscription(sub, true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('create_subscription', { subscription: sub, testMode: true });
  });

  it('updateSubscription calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue(undefined);
    const sub = { id: 1, name: 'Test', cost: 10, currency: 'USD', billingCycle: 'monthly' as const, nextBillingDate: null, status: 'active' as const, category: null, notes: null, createdAt: '', updatedAt: '' };
    await updateSubscription(sub, true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('update_subscription', { subscription: sub, testMode: true });
  });

  it('deleteSubscription calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue(undefined);
    await deleteSubscription(1, true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('delete_subscription', { id: 1, testMode: true });
  });

  it('getDomains calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue([]);
    await getDomains(true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('get_domains', { testMode: true });
  });

  it('getPendingImports calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue([]);
    await getPendingImports(true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('get_pending_imports', { testMode: true });
  });

  it('approvePendingImport calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue(undefined);
    await approvePendingImport(1, null, true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('approve_pending_import', { id: 1, editedData: null, testMode: true });
  });

  it('rejectPendingImport calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue(undefined);
    await rejectPendingImport(1, true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('reject_pending_import', { id: 1, testMode: true });
  });

  it('batchApprovePendingImports calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue(undefined);
    await batchApprovePendingImports([1, 2], true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('batch_approve_pending_imports', { ids: [1, 2], testMode: true });
  });

  it('batchRejectPendingImports calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue(undefined);
    await batchRejectPendingImports([1, 2], true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('batch_reject_pending_imports', { ids: [1, 2], testMode: true });
  });

  it('getSettings calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue({});
    await getSettings(true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('get_settings', { testMode: true });
  });

  it('triggerEmailSync calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue('Sync started');
    await triggerEmailSync(true);
    expect(tauriCore.invoke).toHaveBeenCalledWith('trigger_email_sync', { testMode: true });
  });

  it('clearTestDatabase calls correct command', async () => {
    vi.mocked(tauriCore.invoke).mockResolvedValue(undefined);
    await clearTestDatabase();
    expect(tauriCore.invoke).toHaveBeenCalledWith('clear_test_db', undefined);
  });
});
