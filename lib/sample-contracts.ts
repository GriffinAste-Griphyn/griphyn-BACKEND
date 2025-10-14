export type ContractRecord = {
  deal: string
  brand: string
  status: "Draft" | "Awaiting Signature" | "Fully Executed" | "Amendment Requested"
  effectiveDate: string
  renewalDate?: string
  termsSummary: string
  lastUpdated: string
}

export const sampleContracts: ContractRecord[] = [
  {
    deal: "Spring Launch Sponsored Reels",
    brand: "Nova Apparel",
    status: "Awaiting Signature",
    effectiveDate: "2025-03-01",
    renewalDate: "2025-08-31",
    termsSummary: "Organic social usage rights for 6 months. Payment released upon content approval.",
    lastUpdated: "2025-09-28",
  },
  {
    deal: "Holiday Content Package",
    brand: "Acme Beverages",
    status: "Fully Executed",
    effectiveDate: "2025-10-01",
    renewalDate: "2025-12-31",
    termsSummary: "Includes whitelisting and paid usage rights for Q4. Net-30 payment after deliverables.",
    lastUpdated: "2025-09-27",
  },
  {
    deal: "Summer Videos",
    brand: "Nova Apparel",
    status: "Draft",
    effectiveDate: "2025-05-15",
    renewalDate: "2025-09-15",
    termsSummary: "Awaiting brand approval on paid usage clause and reshoot expectations.",
    lastUpdated: "2025-09-23",
  },
  {
    deal: "Winter Campaign 2024",
    brand: "Arctic Gear Co.",
    status: "Fully Executed",
    effectiveDate: "2024-10-15",
    renewalDate: "2025-01-15",
    termsSummary: "Organic rights only. Payment split: 50% upfront, 50% within 15 days of campaign completion.",
    lastUpdated: "2024-12-16",
  },
]
