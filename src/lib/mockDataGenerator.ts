/**
 * Mock Data Generator for Testing
 * Generates realistic subscription and domain data for testing the pending import workflow
 */

import { MOCK_DOMAINS, MOCK_SUBSCRIPTIONS } from './mockData';

import type { DomainExtraction, SubscriptionExtraction } from './types';

const DAYS_IN_MONTH = 30;
const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;
const MS_IN_SECOND = 1000;
const MS_IN_DAY =
  HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MS_IN_SECOND;

const FUTURE_DATE_MIN_DAYS = 30;
const FUTURE_DATE_RANGE_DAYS = 60;

const DOMAIN_EXPIRY_MIN_DAYS = 300;
const DOMAIN_EXPIRY_RANGE_DAYS = 100;

const CONFIDENCE_HIGH_THRESHOLD = 0.6;
const CONFIDENCE_HIGH_MIN = 0.8;
const CONFIDENCE_HIGH_RANGE = 0.2;

const CONFIDENCE_MEDIUM_THRESHOLD = 0.9;
const CONFIDENCE_MEDIUM_MIN = 0.5;
const CONFIDENCE_MEDIUM_RANGE = 0.3;

const CONFIDENCE_LOW_MIN = 0.3;
const CONFIDENCE_LOW_RANGE = 0.2;

const AUTO_RENEW_THRESHOLD = 0.3;

/**
 * Get a random item from an array
 */
function getRandomItem<T>(array: readonly T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  const item = array[randomIndex];
  if (item === undefined) {
    throw new Error('Array is empty');
  }
  return item;
}

/**
 * Get a random date within the last 30 days
 */
function getRandomRecentDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * DAYS_IN_MONTH);
  const date = new Date(now.getTime() - daysAgo * MS_IN_DAY);
  const dateStr = date.toISOString().split('T')[0];
  return dateStr ?? '';
}

/**
 * Get a random future date within the next 30-90 days
 */
function getRandomFutureDate(): string {
  const now = new Date();
  const daysFromNow =
    FUTURE_DATE_MIN_DAYS + Math.floor(Math.random() * FUTURE_DATE_RANGE_DAYS);
  const date = new Date(now.getTime() + daysFromNow * MS_IN_DAY);
  const dateStr = date.toISOString().split('T')[0];
  return dateStr ?? '';
}

/**
 * Get a random far future date within the next 300-400 days (for domain expiry)
 */
function getRandomDomainExpiryDate(): string {
  const now = new Date();
  const daysFromNow =
    DOMAIN_EXPIRY_MIN_DAYS +
    Math.floor(Math.random() * DOMAIN_EXPIRY_RANGE_DAYS);
  const date = new Date(now.getTime() + daysFromNow * MS_IN_DAY);
  const dateStr = date.toISOString().split('T')[0];
  return dateStr ?? '';
}

/**
 * Get a random confidence score (weighted toward higher confidence)
 */
function getRandomConfidence(): number {
  const rand = Math.random();
  if (rand < CONFIDENCE_HIGH_THRESHOLD) {
    return CONFIDENCE_HIGH_MIN + Math.random() * CONFIDENCE_HIGH_RANGE;
  }
  if (rand < CONFIDENCE_MEDIUM_THRESHOLD) {
    return CONFIDENCE_MEDIUM_MIN + Math.random() * CONFIDENCE_MEDIUM_RANGE;
  }
  return CONFIDENCE_LOW_MIN + Math.random() * CONFIDENCE_LOW_RANGE;
}

/**
 * Generate mock subscription data
 */
export function generateMockSubscription(): {
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  extractedData: SubscriptionExtraction;
  confidence: number;
} {
  const mockSub = getRandomItem(MOCK_SUBSCRIPTIONS);

  return {
    emailSubject: mockSub.subject,
    emailFrom: mockSub.from,
    emailDate: getRandomRecentDate(),
    extractedData: {
      name: mockSub.name,
      cost: mockSub.cost,
      currency: mockSub.currency,
      billingCycle: mockSub.billingCycle,
      nextBillingDate: getRandomFutureDate(),
      category: mockSub.category,
    },
    confidence: getRandomConfidence(),
  };
}

/**
 * Generate mock domain data
 */
export function generateMockDomain(): {
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  extractedData: DomainExtraction;
  confidence: number;
} {
  const mockDomain = getRandomItem(MOCK_DOMAINS);
  const registrationDate = getRandomRecentDate();

  return {
    emailSubject: mockDomain.subject,
    emailFrom: mockDomain.from,
    emailDate: registrationDate,
    extractedData: {
      domainName: mockDomain.domainName,
      registrar: mockDomain.registrar,
      cost: mockDomain.cost,
      currency: mockDomain.currency,
      registrationDate,
      expiryDate: getRandomDomainExpiryDate(),
      autoRenew: Math.random() > AUTO_RENEW_THRESHOLD,
    },
    confidence: getRandomConfidence(),
  };
}

const SUBSCRIPTION_PROBABILITY_THRESHOLD = 0.4;

/**
 * Generates a single mock pending import
 */
export function generateMockPendingImport(): {
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  classification: 'subscription' | 'domain';
  extractedData: string;
  confidence: number;
} {
  const isSubscription = Math.random() > SUBSCRIPTION_PROBABILITY_THRESHOLD; // 60% subscriptions, 40% domains

  if (isSubscription) {
    const mock = generateMockSubscription();
    return {
      emailSubject: mock.emailSubject,
      emailFrom: mock.emailFrom,
      emailDate: mock.emailDate,
      classification: 'subscription',
      extractedData: JSON.stringify(mock.extractedData),
      confidence: mock.confidence,
    };
  }

  const mock = generateMockDomain();
  return {
    emailSubject: mock.emailSubject,
    emailFrom: mock.emailFrom,
    emailDate: mock.emailDate,
    classification: 'domain',
    extractedData: JSON.stringify(mock.extractedData),
    confidence: mock.confidence,
  };
}

/**
 * Generate multiple mock pending imports
 */
export function generateMultipleMockImports(count: number): Array<{
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  classification: 'subscription' | 'domain';
  extractedData: string;
  confidence: number;
}> {
  return Array.from({ length: count }, () => generateMockPendingImport());
}
