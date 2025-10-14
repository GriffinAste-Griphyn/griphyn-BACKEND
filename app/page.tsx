import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Clock } from "lucide-react"

const aiActivity = [
  {
    timestamp: "2 hours ago",
    action: "Sent follow-up to Nike",
    detail: "Day 3 of outreach sequence",
    status: "sent",
  },
  {
    timestamp: "5 hours ago",
    action: "Drafted content brief",
    detail: "Adidas Spring Campaign deal",
    status: "ready",
  },
  {
    timestamp: "1 day ago",
    action: "Detected payment delay",
    detail: "TechFlow Inc - reminder sent",
    status: "alert",
  },
  {
    timestamp: "1 day ago",
    action: "Negotiated counter offer",
    detail: "Urban Lifestyle Co - increased by $2,000",
    status: "success",
  },
]

function getActivityBadge(status: string) {
  switch (status) {
    case "sent":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Sent
        </Badge>
      )
    case "ready":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Ready
        </Badge>
      )
    case "alert":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Alert
        </Badge>
      )
    case "success":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          Success
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function HomePage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-1">Welcome back, Griffin</h1>
        <p className="text-muted-foreground">Your AI agent is working 24/7 to grow your business.</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Financial Summary</h2>
        <div className="md:hidden">
          <Card className="border border-border bg-card shadow-sm">
            <div className="divide-y divide-border">
              <div className="py-2 px-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>This Month's Earnings</span>
                </div>
                <p className="text-2xl font-semibold text-foreground leading-tight">$12,450</p>
                <p className="text-xs text-green-600">+23% vs last month</p>
              </div>

              <div className="py-2 px-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Pending Payments</span>
                </div>
                <p className="text-2xl font-semibold text-foreground leading-tight">$8,200</p>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </div>

              <div className="py-2 px-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Projected This Quarter</span>
                </div>
                <p className="text-2xl font-semibold text-foreground leading-tight">$38,900</p>
                <p className="text-xs text-muted-foreground">Based on active deals</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="hidden md:grid md:grid-cols-3 gap-6">
          <Card className="border border-border bg-card shadow-sm rounded-2xl">
            <div className="p-6 md:p-7 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>This Month's Earnings</span>
              </div>
              <p className="text-3xl font-semibold text-foreground leading-tight">$12,450</p>
              <p className="text-xs text-green-600">+23% vs last month</p>
            </div>
          </Card>

          <Card className="border border-border bg-card shadow-sm rounded-2xl">
            <div className="p-6 md:p-7 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Pending Payments</span>
              </div>
              <p className="text-3xl font-semibold text-foreground leading-tight">$8,200</p>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </div>
          </Card>

          <Card className="border border-border bg-card shadow-sm rounded-2xl">
            <div className="p-6 md:p-7 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>Projected This Quarter</span>
              </div>
              <p className="text-3xl font-semibold text-foreground leading-tight">$38,900</p>
              <p className="text-xs text-muted-foreground">Based on active deals</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-xl font-semibold text-foreground">AI Agent Activity</h2>
            </div>
            <div className="space-y-4">
              {aiActivity.map((activity, index) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    {getActivityBadge(activity.status)}
                  </div>
                  <p className="font-medium text-foreground text-sm">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Performance Metrics</h2>
            <div className="space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">Deals Closed This Month</p>
                <p className="text-2xl font-bold text-foreground">5</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Average Deal Value</p>
                <p className="text-2xl font-bold text-foreground">$2,490</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Avg Time to Close</p>
                <p className="text-2xl font-bold text-foreground">12 days</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-foreground">68%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
