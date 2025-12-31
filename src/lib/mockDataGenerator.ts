/**
 * Mock Data Generator for Testing
 * Generates realistic subscription and domain data for testing the pending import workflow
 */

import type {
  BillingCycle,
  DomainExtraction,
  SubscriptionExtraction,
} from "./types";

// Mock subscription services with realistic data
const MOCK_SUBSCRIPTIONS = [
  {
    name: "Netflix Premium",
    cost: 19.99,
    currency: "USD",
    billingCycle: "monthly" as BillingCycle,
    category: "Entertainment",
    from: "billing@netflix.com",
    subject: "Your Netflix subscription receipt",
  },
  {
    name: "Spotify Premium",
    cost: 9.99,
    currency: "USD",
    billingCycle: "monthly" as BillingCycle,
    category: "Music",
    from: "noreply@spotify.com",
    subject: "Spotify Premium - Payment Confirmation",
  },
  {
    name: "Adobe Creative Cloud",
    cost: 54.99,
    currency: "USD",
    billingCycle: "monthly" as BillingCycle,
    category: "Software",
    from: "adobe@adobe.com",
    subject: "Adobe Creative Cloud Receipt",
  },
  {
    name: "GitHub Pro",
    cost: 4.0,
    currency: "USD",
    billingCycle: "monthly" as BillingCycle,
    category: "Development",
    from: "billing@github.com",
    subject: "GitHub Pro subscription renewed",
  },
  {
    name: "Figma Professional",
    cost: 12.0,
    currency: "USD",
    billingCycle: "monthly" as BillingCycle,
    category: "Design",
    from: "team@figma.com",
    subject: "Figma Professional Plan Receipt",
  },
  {
    name: "The New York Times",
    cost: 17.0,
    currency: "USD",
    billingCycle: "monthly" as BillingCycle,
    category: "News",
    from: "nytimes@nytimes.com",
    subject: "Your NYT Digital Subscription",
  },
  {
    name: "Notion Plus",
    cost: 8.0,
    currency: "USD",
    billingCycle: "monthly" as BillingCycle,
    category: "Productivity",
    from: "team@notion.so",
    subject: "Notion Plus Payment Received",
  },
  {
    name: "Dropbox Plus",
    cost: 11.99,
    currency: "USD",
    billingCycle: "monthly" as BillingCycle,
    category: "Storage",
    from: "no-reply@dropbox.com",
    subject: "Dropbox Plus - Monthly Receipt",
  },
  {
    name: "ChatGPT Plus",
    cost: 20.0,
    currency: "USD",
    billingCycle: "monthly" as BillingCycle,
    category: "AI",
    from: "noreply@openai.com",
    subject: "ChatGPT Plus subscription confirmation",
  },
  {
    name: "AWS Services",
    cost: 45.32,
    currency: "USD",
    billingCycle: "monthly" as BillingCycle,
    category: "Cloud",
    from: "aws-billing@amazon.com",
    subject: "AWS Monthly Bill",
  },
];

// Mock domain registrations
const MOCK_DOMAINS = [
  {
    domainName: "myawesomeapp.com",
    registrar: "Namecheap",
    cost: 12.98,
    currency: "USD",
    from: "domains@namecheap.com",
    subject: "Domain Registration Confirmation - myawesomeapp.com",
  },
  {
    domainName: "startupidea.io",
    registrar: "GoDaddy",
    cost: 29.99,
    currency: "USD",
    from: "noreply@godaddy.com",
    subject: "GoDaddy Domain Registration Receipt",
  },
  {
    domainName: "portfolio-site.dev",
    registrar: "Google Domains",
    cost: 12.0,
    currency: "USD",
    from: "domains-noreply@google.com",
    subject: "Google Domains: Registration Confirmation",
  },
  {
    domainName: "coolproject.xyz",
    registrar: "Cloudflare",
    cost: 9.15,
    currency: "USD",
    from: "noreply@cloudflare.com",
    subject: "Cloudflare Registrar - Domain Registered",
  },
  {
    domainName: "business-site.co",
    registrar: "Hover",
    cost: 17.99,
    currency: "USD",
    from: "support@hover.com",
    subject: "Hover Domain Registration",
  },
];

/**
 * Get a random item from an array
 */
function getRandomItem<T>(array: readonly T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  const item = array[randomIndex];
  if (item === undefined) {
    throw new Error("Array is empty");
  }
  return item;
}

/**
 * Get a random date within the last 30 days
 */
function getRandomRecentDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const dateStr = date.toISOString().split("T")[0];
  return dateStr ?? "";
}

/**
 * Get a random future date within the next 30-90 days
 */
function getRandomFutureDate(): string {
  const now = new Date();
  const daysFromNow = 30 + Math.floor(Math.random() * 60);
  const date = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  const dateStr = date.toISOString().split("T")[0];
  return dateStr ?? "";
}

/**
 * Get a random far future date within the next 300-400 days (for domain expiry)
 */
function getRandomDomainExpiryDate(): string {
  const now = new Date();
  const daysFromNow = 300 + Math.floor(Math.random() * 100);
  const date = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  const dateStr = date.toISOString().split("T")[0];
  return dateStr ?? "";
}

/**
 * Get a random confidence score (weighted toward higher confidence)
 */
function getRandomConfidence(): number {
  const rand = Math.random();
  if (rand < 0.6) {
    return 0.8 + Math.random() * 0.2; // 60% chance: 0.8-1.0
  }
  if (rand < 0.9) {
    return 0.5 + Math.random() * 0.3; // 30% chance: 0.5-0.8
  }
  return 0.3 + Math.random() * 0.2; // 10% chance: 0.3-0.5
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
      autoRenew: Math.random() > 0.3, // 70% chance of auto-renew
    },
    confidence: getRandomConfidence(),
  };
}

/**
 * Generate a random mock pending import (subscription or domain)
 */
export function generateMockPendingImport(): {
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  classification: "subscription" | "domain";
  extractedData: string;
  confidence: number;
} {
  const isSubscription = Math.random() > 0.4; // 60% subscriptions, 40% domains

  if (isSubscription) {
    const mock = generateMockSubscription();
    return {
      emailSubject: mock.emailSubject,
      emailFrom: mock.emailFrom,
      emailDate: mock.emailDate,
      classification: "subscription",
      extractedData: JSON.stringify(mock.extractedData),
      confidence: mock.confidence,
    };
  }

  const mock = generateMockDomain();
  return {
    emailSubject: mock.emailSubject,
    emailFrom: mock.emailFrom,
    emailDate: mock.emailDate,
    classification: "domain",
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
  classification: "subscription" | "domain";
  extractedData: string;
  confidence: number;
}> {
  return Array.from({ length: count }, () => generateMockPendingImport());
}
