/**
 * Tauri Command Wrappers
 *
 * All Tauri backend commands are wrapped here with proper TypeScript types.
 * Components should NEVER call invoke() directly - always use these wrappers.
 *
 * Note: These functions will only work when Rust commands are implemented.
 * For now, they serve as the typed API contract between frontend and backend.
 */

import { invoke as tauriInvoke } from '@tauri-apps/api/core';

// Safe invoke wrapper that checks if Tauri is available
function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (typeof tauriInvoke !== 'function') {
    return Promise.reject(
      new Error(
        'Tauri is not available. Please use the Tauri desktop application window, not a web browser.'
      )
    );
  }
  return tauriInvoke<T>(cmd, args);
}

import type {
  Subscription,
  Domain,
  PendingImport,
  Receipt,
  AppSettings,
} from './types';

// ============================================================================
// Subscription Commands
// ============================================================================

export async function getSubscriptions(
  testMode: boolean = false
): Promise<Subscription[]> {
  return invoke<Subscription[]>('get_subscriptions', { testMode });
}

export async function getSubscriptionById(
  id: number,
  testMode: boolean = false
): Promise<Subscription | null> {
  return invoke<Subscription | null>('get_subscription_by_id', {
    id,
    testMode,
  });
}

export async function createSubscription(
  subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
  testMode: boolean = false
): Promise<number> {
  return invoke<number>('create_subscription', { subscription, testMode });
}

export async function updateSubscription(
  subscription: Subscription,
  testMode: boolean = false
): Promise<void> {
  return invoke('update_subscription', { subscription, testMode });
}

export async function deleteSubscription(
  id: number,
  testMode: boolean = false
): Promise<void> {
  return invoke('delete_subscription', { id, testMode });
}

// ============================================================================
// Domain Commands
// ============================================================================

export async function getDomains(testMode: boolean = false): Promise<Domain[]> {
  return invoke<Domain[]>('get_domains', { testMode });
}

export async function getDomainById(
  id: number,
  testMode: boolean = false
): Promise<Domain | null> {
  return invoke<Domain | null>('get_domain_by_id', { id, testMode });
}

export async function createDomain(
  domain: Omit<Domain, 'id' | 'createdAt' | 'updatedAt'>,
  testMode: boolean = false
): Promise<number> {
  return invoke<number>('create_domain', { domain, testMode });
}

export async function updateDomain(
  domain: Domain,
  testMode: boolean = false
): Promise<void> {
  return invoke('update_domain', { domain, testMode });
}

export async function deleteDomain(
  id: number,
  testMode: boolean = false
): Promise<void> {
  return invoke('delete_domain', { id, testMode });
}

// ============================================================================
// Pending Import Commands
// ============================================================================

export async function getPendingImports(
  testMode: boolean = false
): Promise<PendingImport[]> {
  return invoke<PendingImport[]>('get_pending_imports', { testMode });
}

interface CreatePendingImportParams {
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  classification: string;
  extractedData: string;
  confidence: number;
  testMode?: boolean;
}

export async function createPendingImport(
  params: CreatePendingImportParams
): Promise<number> {
  return invoke<number>('create_pending_import', {
    emailSubject: params.emailSubject,
    emailFrom: params.emailFrom,
    emailDate: params.emailDate,
    classification: params.classification,
    extractedData: params.extractedData,
    confidence: params.confidence,
    testMode: params.testMode ?? false,
  });
}

export async function approvePendingImport(
  id: number,
  editedData: string | null,
  testMode: boolean = false
): Promise<void> {
  return invoke('approve_pending_import', { id, editedData, testMode });
}

export async function rejectPendingImport(
  id: number,
  testMode: boolean = false
): Promise<void> {
  return invoke('reject_pending_import', { id, testMode });
}

export async function batchApprovePendingImports(
  ids: number[],
  testMode: boolean = false
): Promise<void> {
  return invoke('batch_approve_pending_imports', { ids, testMode });
}

export async function batchRejectPendingImports(
  ids: number[],
  testMode: boolean = false
): Promise<void> {
  return invoke('batch_reject_pending_imports', { ids, testMode });
}

// ============================================================================
// Receipt Commands
// ============================================================================

export async function getReceiptById(
  id: number,
  testMode: boolean = false
): Promise<Receipt | null> {
  return invoke<Receipt | null>('get_receipt_by_id', { id, testMode });
}

export async function deleteOldReceipts(
  testMode: boolean = false
): Promise<number> {
  return invoke<number>('delete_old_receipts', { testMode });
}

// ============================================================================
// Settings Commands
// ============================================================================

export async function getSettings(
  testMode: boolean = false
): Promise<AppSettings> {
  return invoke<AppSettings>('get_settings', { testMode });
}

export async function updateSettings(
  settings: AppSettings,
  testMode: boolean = false
): Promise<void> {
  return invoke('update_settings', { settings, testMode });
}

export interface ImapConnectionConfig {
  server: string;
  port: number;
  username: string;
  password: string;
  useSsl: boolean;
}

export async function testImapConnection(
  config: ImapConnectionConfig
): Promise<string> {
  return invoke<string>('test_imap_connection', {
    server: config.server,
    port: config.port,
    username: config.username,
    password: config.password,
    useSsl: config.useSsl,
  });
}

// ============================================================================
// Email Sync Commands
// ============================================================================

export async function triggerEmailSync(
  testMode: boolean = false
): Promise<string> {
  return invoke<string>('trigger_email_sync', { testMode });
}

export async function getLastSyncTime(
  testMode: boolean = false
): Promise<string | null> {
  return invoke<string | null>('get_last_sync_time', { testMode });
}

// ============================================================================
// Database Management Commands
// ============================================================================

export async function clearTestDatabase(): Promise<void> {
  return invoke('clear_test_db');
}

export async function exportDatabase(
  testMode: boolean = false
): Promise<string> {
  return invoke<string>('export_database', { testMode });
}
