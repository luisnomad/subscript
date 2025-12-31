/**
 * Core domain types for SubScript application
 * These interfaces match the SQLite database schema defined in ARCHITECTURE.md
 */

// ============================================================================
// Subscription Types
// ============================================================================

export type BillingCycle = 'monthly' | 'yearly' | 'one-time';
export type SubscriptionStatus = 'active' | 'cancelled' | 'paused';

export interface Subscription {
  id: number;
  name: string;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string | null; // ISO 8601 date string
  status: SubscriptionStatus;
  category: string | null;
  notes: string | null;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

// ============================================================================
// Domain Types
// ============================================================================

export type DomainStatus = 'active' | 'expired' | 'pending-renewal';

export interface Domain {
  id: number;
  domainName: string;
  registrar: string | null;
  cost: number | null;
  currency: string | null;
  registrationDate: string | null; // ISO 8601 date
  expiryDate: string; // ISO 8601 date
  autoRenew: boolean;
  status: DomainStatus;
  notes: string | null;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

// ============================================================================
// Pending Import Types
// ============================================================================

export type ImportClassification = 'subscription' | 'domain' | 'junk';

export interface PendingImport {
  id: number;
  emailSubject: string;
  emailFrom: string;
  emailDate: string; // ISO 8601 datetime
  classification: ImportClassification;
  extractedData: string; // JSON string
  confidence: number; // 0.0 to 1.0
  receiptId: number | null;
  status: string;
  createdAt: string; // ISO 8601 datetime
}

// Parsed extracted data interfaces (JSON.parse of extractedData field)
export interface SubscriptionExtraction {
  name: string;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate?: string;
  category?: string;
}

export interface DomainExtraction {
  domainName: string;
  registrar: string;
  cost: number;
  currency: string;
  registrationDate?: string;
  expiryDate: string;
  autoRenew?: boolean;
}

// ============================================================================
// Receipt Types
// ============================================================================

export interface Receipt {
  id: number;
  subscriptionId?: number;
  domainId?: number;
  emailSubject: string;
  emailFrom: string;
  emailDate: string; // ISO 8601 datetime
  attachmentData?: string; // Base64 encoded
  attachmentMimeType?: string;
  rawEmailBody?: string;
  createdAt: string; // ISO 8601 datetime
}

// ============================================================================
// Settings Types
// ============================================================================

export interface AppSettings {
  id: number;
  imapServer: string;
  imapPort: number;
  imapUsername: string;
  imapUseSsl: boolean;
  ollamaEndpoint: string;
  defaultCurrency: string;
  syncIntervalMinutes: number;
  updatedAt: string; // ISO 8601 datetime
}

// ============================================================================
// UI/Component Types
// ============================================================================

export interface FormFieldError {
  field: string;
  message: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
