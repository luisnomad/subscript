/**
 * Application Constants
 */

// Billing Cycles
export const BILLING_CYCLES = ['monthly', 'yearly', 'one-time'] as const;

// Subscription Statuses
export const SUBSCRIPTION_STATUSES = ['active', 'cancelled', 'paused'] as const;

// Domain Statuses
export const DOMAIN_STATUSES = [
  'active',
  'expired',
  'pending-renewal',
] as const;

// Import Classifications
export const IMPORT_CLASSIFICATIONS = [
  'subscription',
  'domain',
  'junk',
] as const;

// Supported Currencies (extend as needed)
export const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'CNY',
] as const;

// Default Settings
export const DEFAULT_SYNC_INTERVAL_MINUTES = 30;
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_OLLAMA_ENDPOINT = 'http://localhost:11434';

// UI Constants
export const MAX_CONFIDENCE_SCORE = 1.0;
export const MIN_CONFIDENCE_SCORE = 0.0;
export const HIGH_CONFIDENCE_THRESHOLD = 0.8;
export const MEDIUM_CONFIDENCE_THRESHOLD = 0.5;

// Receipt Management
export const RECEIPT_RETENTION_DAYS = 365;

// File size constants
const BYTES_PER_KILOBYTE = 1024;
const BYTES_PER_MEGABYTE = BYTES_PER_KILOBYTE * BYTES_PER_KILOBYTE;
const MEGABYTES_FOR_MAX_RECEIPT = 10;

export const MAX_RECEIPT_SIZE_BYTES =
  MEGABYTES_FOR_MAX_RECEIPT * BYTES_PER_MEGABYTE; // 10MB

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';
