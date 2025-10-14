import { Card } from "@/components/ui/card"
import { TrendingUp, DollarSign, Plus } from "lucide-react"

export function StatsCards() {
  return (
    <>
      {/* Mobile view - single card with sections */}
      <Card className="md:hidden border border-border bg-card shadow-sm">
        <div className="divide-y divide-border">
          <div className="py-2 px-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-muted-foreground">Pipeline Total</div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold text-foreground">$42,000</div>
          </div>

          <div className="py-2 px-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-muted-foreground">Negotiation</div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold text-foreground">$12,000</div>
          </div>

          <div className="py-2 px-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-muted-foreground">New</div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold text-foreground">$30,000</div>
          </div>
        </div>
      </Card>

      {/* Desktop view - three separate cards */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        <Card className="p-6 md:p-7 border border-border bg-card shadow-sm rounded-2xl space-y-3">
          <div className="text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span>Pipeline Total</span>
          </div>
          <p className="text-3xl font-semibold text-foreground leading-tight">$42,000</p>
          <p className="text-xs text-muted-foreground">Value of all active deals in your pipeline.</p>
        </Card>

        <Card className="p-6 md:p-7 border border-border bg-card shadow-sm rounded-2xl space-y-3">
          <div className="text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>Negotiation</span>
          </div>
          <p className="text-3xl font-semibold text-foreground leading-tight">$12,000</p>
          <p className="text-xs text-muted-foreground">Deals where you're actively pushing for higher terms.</p>
        </Card>

        <Card className="p-6 md:p-7 border border-border bg-card shadow-sm rounded-2xl space-y-3">
          <div className="text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span>New</span>
          </div>
          <p className="text-3xl font-semibold text-foreground leading-tight">$30,000</p>
          <p className="text-xs text-muted-foreground">Fresh opportunities added to the pipeline this month.</p>
        </Card>
      </div>
    </>
  )
}
