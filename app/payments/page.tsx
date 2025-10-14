import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Download, TrendingUp, Clock } from "lucide-react"
import { upcomingPayouts, escrowTransactions, invoices } from "@/lib/sample-payments"

function getStatusBadge(status: string) {
  switch (status) {
    case "Paid":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Paid
        </Badge>
      )
    case "Pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Pending
        </Badge>
      )
    case "Overdue":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Overdue
        </Badge>
      )
    case "Escrow Pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Escrow Pending
        </Badge>
      )
    case "Released":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Released
        </Badge>
      )
    case "Held in Escrow":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Held in Escrow
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function calculateDaysUntilPayment(dealDate: string, paymentDueDays: number) {
  const deal = new Date(dealDate)
  const dueDate = new Date(deal)
  dueDate.setDate(dueDate.getDate() + paymentDueDays)

  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return {
    dueDate: dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    daysRemaining: diffDays,
  }
}

export default function PaymentsPage() {
  const averageDealValue =
    invoices.reduce((sum, inv) => {
      const amount = Number.parseFloat(inv.amount.replace(/[$,]/g, ""))
      return sum + amount
    }, 0) / invoices.length

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-1">Payments</h1>
        <p className="text-muted-foreground">Track your earnings, payouts, and invoices.</p>
      </div>

      {/* Mobile view - single card with sections */}
      <Card className="md:hidden border border-border bg-card shadow-sm mb-8">
        <div className="divide-y divide-border">
          <div className="py-2 px-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Total Earned (2025)</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold text-foreground">$72,000</p>
            <p className="text-xs text-green-600 mt-1">+24% from last year</p>
          </div>

          <div className="py-2 px-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Pending Payouts</p>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold text-foreground">$30,000</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
          </div>

          <div className="py-2 px-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Average Deal Value</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold text-foreground">${averageDealValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Per completed deal</p>
          </div>
        </div>
      </Card>

      {/* Desktop view - three separate cards */}
      <div className="hidden md:grid grid-cols-3 gap-6 mb-8">
        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Earned (2025)</p>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold text-foreground">$72,000</p>
            <p className="text-xs text-green-600 mt-2">+24% from last year</p>
          </div>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold text-foreground">$30,000</p>
            <p className="text-xs text-muted-foreground mt-2">Awaiting payment</p>
          </div>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Average Deal Value</p>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold text-foreground">${averageDealValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">Per completed deal</p>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Payouts</h2>
            <div className="space-y-4">
              {escrowTransactions.map((transaction, index) => {
                const paymentInfo = calculateDaysUntilPayment(transaction.dealDate, transaction.paymentDueDays)

                return (
                  <div key={index} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground text-sm">{transaction.deal}</p>
                        <p className="text-sm text-muted-foreground">{transaction.company}</p>
                      </div>
                      <p className="font-semibold text-foreground">{transaction.amount}</p>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-muted-foreground">Payment Terms: {transaction.paymentTerms}</p>
                      <p className="text-xs text-muted-foreground">
                        Payment Due: {paymentInfo.dueDate} ({paymentInfo.daysRemaining} days)
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      <Card className="border border-border bg-card shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Invoice History</h2>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Invoice ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Deal</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Issue Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Paid Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="py-4 px-4 text-sm text-foreground font-medium">{invoice.id}</td>
                    <td className="py-4 px-4 text-sm text-foreground">{invoice.deal}</td>
                    <td className="py-4 px-4 text-sm text-foreground">{invoice.company}</td>
                    <td className="py-4 px-4 text-sm text-foreground font-semibold">{invoice.amount}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{invoice.issueDate}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{invoice.paidDate}</td>
                    <td className="py-4 px-4 text-sm">{getStatusBadge(invoice.status)}</td>
                    <td className="py-4 px-4 text-sm">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </>
  )
}
