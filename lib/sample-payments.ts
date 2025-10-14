export type UpcomingPayout = {
  deal: string
  company: string
  amount: string
  dueDate: string
  status: "Escrow Pending" | "Released" | "Held in Escrow" | "Pending"
  milestone: string
}

export type EscrowTransaction = {
  deal: string
  company: string
  amount: string
  paymentTerms: string
  dealDate: string
  paymentDueDays: number
}

export type InvoiceRecord = {
  id: string
  deal: string
  company: string
  amount: string
  issueDate: string
  paidDate: string
  status: "Paid" | "Pending" | "Overdue"
}

export const upcomingPayouts: UpcomingPayout[] = [
  {
    deal: "Spring Launch Sponsored Reels",
    company: "Nova Apparel",
    amount: "$18,000",
    dueDate: "March 30, 2025",
    status: "Escrow Pending",
    milestone: "Upon content approval",
  },
  {
    deal: "Holiday Content Package",
    company: "Acme Beverages",
    amount: "$12,000",
    dueDate: "December 20, 2025",
    status: "Released",
    milestone: "Content delivered",
  },
]

export const escrowTransactions: EscrowTransaction[] = [
  {
    deal: "Spring Launch Sponsored Reels",
    company: "Nova Apparel",
    amount: "$18,000",
    paymentTerms: "Upon content approval",
    dealDate: "2025-09-15",
    paymentDueDays: 30,
  },
  {
    deal: "Summer Videos",
    company: "Nova Apparel",
    amount: "$12,000",
    paymentTerms: "Net 30 days",
    dealDate: "2025-09-01",
    paymentDueDays: 30,
  },
]

export const invoices: InvoiceRecord[] = [
  {
    id: "INV-001",
    deal: "Holiday Content Package",
    company: "Acme Beverages",
    amount: "$12,000",
    issueDate: "September 15, 2025",
    paidDate: "September 28, 2025",
    status: "Paid",
  },
  {
    id: "INV-002",
    deal: "Spring Launch Sponsored Reels",
    company: "Nova Apparel",
    amount: "$18,000",
    issueDate: "September 28, 2025",
    paidDate: "—",
    status: "Pending",
  },
  {
    id: "INV-003",
    deal: "Summer Videos",
    company: "Nova Apparel",
    amount: "$12,000",
    issueDate: "August 10, 2025",
    paidDate: "—",
    status: "Overdue",
  },
]
