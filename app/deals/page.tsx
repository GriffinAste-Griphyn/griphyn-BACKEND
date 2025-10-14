"use client"

import { DealsTable } from "@/components/deals-table"
import { StatsCards } from "@/components/stats-cards"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon } from "@/components/icons"

type DealFilter = "all" | "active" | "closed-won" | "closed-lost"

export default function DealsPage() {
  const [filter, setFilter] = useState<DealFilter>("all")
  const [isAddDealOpen, setIsAddDealOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [newDeal, setNewDeal] = useState({
    dealName: "",
    company: "",
    email: "",
    amount: "",
    deliverables: "",
    stage: "new",
    closeDate: "",
    goLiveDate: "",
    source: "inbound",
    usageRights: "organic",
    paymentStatus: "awaiting-payment",
  })

  const handleAddDeal = () => {
    // TODO: Add logic to save the new deal
    console.log("New deal:", newDeal)
    setIsAddDealOpen(false)
    setCurrentStep(1)
    setNewDeal({
      dealName: "",
      company: "",
      email: "",
      amount: "",
      deliverables: "",
      stage: "new",
      closeDate: "",
      goLiveDate: "",
      source: "inbound",
      usageRights: "organic",
      paymentStatus: "awaiting-payment",
    })
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsAddDealOpen(open)
    if (!open) {
      setCurrentStep(1)
    }
  }

  return (
    <>
      <div className="mb-6 md:mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-1">Deals</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your brand partnerships and sponsorships.</p>
        </div>
        <Dialog open={isAddDealOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 whitespace-nowrap">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add New Deal</span>
              <span className="sm:hidden">Add Deal</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
              <DialogDescription>
                {currentStep === 1 && "Enter the basic information for your new brand partnership deal."}
                {currentStep === 2 && "Add details about deliverables and deal terms."}
                {currentStep === 3 && "Set timeline and payment information."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-center gap-2 py-4">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${
                    currentStep >= 1 ? "bg-foreground" : "bg-muted"
                  }`}
                />
                <div className={`h-0.5 w-8 ${currentStep >= 2 ? "bg-foreground" : "bg-muted"}`} />
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${
                    currentStep >= 2 ? "bg-foreground" : "bg-muted"
                  }`}
                />
                <div className={`h-0.5 w-8 ${currentStep >= 3 ? "bg-foreground" : "bg-muted"}`} />
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${
                    currentStep >= 3 ? "bg-foreground" : "bg-muted"
                  }`}
                />
              </div>
            </div>

            {currentStep === 1 && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dealName">Deal Name</Label>
                  <Input
                    id="dealName"
                    placeholder="e.g., Spring Launch Sponsored Reels"
                    value={newDeal.dealName}
                    onChange={(e) => setNewDeal({ ...newDeal, dealName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Nova Apparel"
                    value={newDeal.company}
                    onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@company.com"
                    value={newDeal.email}
                    onChange={(e) => setNewDeal({ ...newDeal, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Deal Amount</Label>
                  <Input
                    id="amount"
                    placeholder="e.g., $18,000"
                    value={newDeal.amount}
                    onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="deliverables">Deliverables</Label>
                  <Input
                    id="deliverables"
                    placeholder="e.g., 3 Instagram Reels, 2 Stories"
                    value={newDeal.deliverables}
                    onChange={(e) => setNewDeal({ ...newDeal, deliverables: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select value={newDeal.stage} onValueChange={(value) => setNewDeal({ ...newDeal, stage: value })}>
                    <SelectTrigger id="stage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed-won">Closed Won</SelectItem>
                      <SelectItem value="closed-lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={newDeal.source} onValueChange={(value) => setNewDeal({ ...newDeal, source: value })}>
                    <SelectTrigger id="source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageRights">Usage Rights</Label>
                  <Select
                    value={newDeal.usageRights}
                    onValueChange={(value) => setNewDeal({ ...newDeal, usageRights: value })}
                  >
                    <SelectTrigger id="usageRights">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="paid-usage">Paid Usage</SelectItem>
                      <SelectItem value="whitelisting">Whitelisting</SelectItem>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="closeDate">Close Date</Label>
                  <Input
                    id="closeDate"
                    type="date"
                    value={newDeal.closeDate}
                    onChange={(e) => setNewDeal({ ...newDeal, closeDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goLiveDate">Go-Live Date</Label>
                  <Input
                    id="goLiveDate"
                    type="date"
                    value={newDeal.goLiveDate}
                    onChange={(e) => setNewDeal({ ...newDeal, goLiveDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select
                    value={newDeal.paymentStatus}
                    onValueChange={(value) => setNewDeal({ ...newDeal, paymentStatus: value })}
                  >
                    <SelectTrigger id="paymentStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awaiting-payment">Awaiting Payment</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button onClick={handleAddDeal}>Add Deal</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <StatsCards />
      </div>

      <div className="overflow-x-auto pb-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 md:gap-3 min-w-max md:min-w-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border flex items-center gap-2 ${
              filter === "all"
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:bg-muted"
            }`}
          >
            All
            <Badge variant="secondary" className={filter === "all" ? "bg-background text-foreground" : ""}>
              5
            </Badge>
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border flex items-center gap-2 ${
              filter === "active"
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:bg-muted"
            }`}
          >
            Active
            <Badge variant="secondary" className={filter === "active" ? "bg-background text-foreground" : ""}>
              3
            </Badge>
          </button>
          <button
            onClick={() => setFilter("closed-won")}
            className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border flex items-center gap-2 ${
              filter === "closed-won"
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:bg-muted"
            }`}
          >
            Closed Won
            <Badge variant="secondary" className={filter === "closed-won" ? "bg-background text-foreground" : ""}>
              1
            </Badge>
          </button>
          <button
            onClick={() => setFilter("closed-lost")}
            className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border flex items-center gap-2 ${
              filter === "closed-lost"
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:bg-muted"
            }`}
          >
            Closed Lost
            <Badge variant="secondary" className={filter === "closed-lost" ? "bg-background text-foreground" : ""}>
              1
            </Badge>
          </button>
        </div>
      </div>

      <DealsTable filter={filter} />
    </>
  )
}
