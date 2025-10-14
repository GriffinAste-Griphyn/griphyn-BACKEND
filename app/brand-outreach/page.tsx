"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, Trash2, Pencil, ExternalLink } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface Brand {
  id: number
  name: string
  dealType: string
  reason: string
  ideas?: string
  status: "researching" | "drafting" | "sent" | "responded" | "deal-created" | "declined"
  dateAdded: string
  dealId?: number
}

const truncateText = (value: string | undefined, limit = 140) => {
  if (!value) return ""
  if (value.length <= limit) return value
  return `${value.slice(0, limit)}…`
}

export default function BrandOutreachPage() {
  const router = useRouter()

  const [brands, setBrands] = useState<Brand[]>([
    {
      id: 1,
      name: "TechFlow Inc",
      dealType: "Sponsored Post",
      reason:
        "Their audience aligns perfectly with my tech content and they're launching a new product that fits my niche.",
      ideas: "Could create a 3-part video series showcasing their new AI features, plus behind-the-scenes content.",
      status: "deal-created",
      dateAdded: "2025-09-28",
      dealId: 1,
    },
    {
      id: 2,
      name: "Urban Lifestyle Co",
      dealType: "Brand Ambassador",
      reason:
        "I love their sustainable fashion line and my followers are always asking for eco-friendly brand recommendations.",
      ideas: "Monthly styling videos featuring their seasonal collections, Instagram Reels for quick outfit ideas.",
      status: "deal-created",
      dateAdded: "2025-09-29",
      dealId: 2,
    },
    {
      id: 3,
      name: "FitnessPro Gear",
      dealType: "Product Review",
      reason:
        "Their workout equipment matches my fitness content and my audience is highly engaged with product reviews.",
      ideas: "30-day challenge using their equipment, weekly progress updates, and honest review at the end.",
      status: "responded",
      dateAdded: "2025-09-30",
    },
    {
      id: 4,
      name: "EcoHome Solutions",
      dealType: "Content Collaboration",
      reason: "Sustainable home products align with my lifestyle content and values.",
      ideas: "Home makeover series focusing on sustainable swaps, product comparison videos.",
      status: "sent",
      dateAdded: "2025-10-01",
    },
  ])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [deletingBrandId, setDeletingBrandId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    dealType: "",
    reason: "",
    ideas: "",
    status: "researching" as Brand["status"],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingBrand) {
      setBrands(brands.map((brand) => (brand.id === editingBrand.id ? { ...brand, ...formData } : brand)))
      setEditingBrand(null)
    } else {
      const newBrand: Brand = {
        id: brands.length + 1,
        ...formData,
        status: "researching",
        dateAdded: new Date().toISOString().split("T")[0],
      }
      setBrands([newBrand, ...brands])
    }
    setFormData({
      name: "",
      dealType: "",
      reason: "",
      ideas: "",
      status: "researching",
    })
    setDialogOpen(false)
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      dealType: brand.dealType,
      reason: brand.reason,
      ideas: brand.ideas || "",
      status: brand.status,
    })
    setDialogOpen(true)
  }

  const handleCancel = () => {
    setDialogOpen(false)
    setEditingBrand(null)
    setFormData({
      name: "",
      dealType: "",
      reason: "",
      ideas: "",
      status: "researching",
    })
  }

  const handleDelete = (id: number) => {
    setBrands(brands.filter((brand) => brand.id !== id))
    setDeletingBrandId(null)
  }

  const getStatusBadge = (status: Brand["status"]) => {
    switch (status) {
      case "researching":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Researching
          </Badge>
        )
      case "drafting":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Drafting Pitch
          </Badge>
        )
      case "sent":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Pitch Sent
          </Badge>
        )
      case "responded":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Response Received
          </Badge>
        )
      case "deal-created":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Deal Created
          </Badge>
        )
      case "declined":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Declined
          </Badge>
        )
    }
  }

  const totalBrands = brands.length
  const activeBrands = brands.filter((brand) => brand.status !== "declined").length
  const awaitingReply = brands.filter((brand) => brand.status === "sent").length
  const convertedDeals = brands.filter((brand) => brand.status === "deal-created").length

  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-1">Brand Outreach</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Add brands you want to pitch to and let the AI agent reach out on your behalf.
        </p>
      </div>

      <Card className="border border-border bg-card shadow-sm mb-6">
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Pipeline Snapshot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-6 md:p-7 space-y-3">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Brands</p>
              <p className="text-3xl font-semibold text-foreground">{totalBrands}</p>
              <p className="text-xs text-muted-foreground">All brands you’re tracking right now.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-6 md:p-7 space-y-3">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Active</p>
              <p className="text-3xl font-semibold text-foreground">{activeBrands}</p>
              <p className="text-xs text-muted-foreground">Researching, drafting, or in negotiation.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-6 md:p-7 space-y-3">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Awaiting Reply</p>
              <p className="text-3xl font-semibold text-foreground">{awaitingReply}</p>
              <p className="text-xs text-muted-foreground">Follow-up reminders trigger here.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-6 md:p-7 space-y-3">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Deals Created</p>
              <p className="text-3xl font-semibold text-foreground">{convertedDeals}</p>
              <p className="text-xs text-muted-foreground">Opportunities already converted.</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-6">
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Brand
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
            <DialogDescription>
              {editingBrand
                ? "Update the brand information below."
                : "Add a new brand to your outreach list. Fill in the details to help the AI agent craft the perfect pitch."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter brand name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dealType">Type of Deal</Label>
              <Select
                value={formData.dealType}
                onValueChange={(value) => setFormData({ ...formData, dealType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select deal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sponsored Post">Sponsored Post</SelectItem>
                  <SelectItem value="Brand Ambassador">Brand Ambassador</SelectItem>
                  <SelectItem value="Product Review">Product Review</SelectItem>
                  <SelectItem value="Affiliate Partnership">Affiliate Partnership</SelectItem>
                  <SelectItem value="Content Collaboration">Content Collaboration</SelectItem>
                  <SelectItem value="Event Partnership">Event Partnership</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editingBrand && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Brand["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="researching">Researching</SelectItem>
                    <SelectItem value="drafting">Drafting Pitch</SelectItem>
                    <SelectItem value="sent">Pitch Sent</SelectItem>
                    <SelectItem value="responded">Response Received</SelectItem>
                    <SelectItem value="deal-created">Deal Created</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Why Are You a Good Fit?</Label>
              <Textarea
                id="reason"
                placeholder="Explain why you think you're a good fit for this brand and what value you can bring to the partnership..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ideas">Collaboration Ideas</Label>
              <Textarea
                id="ideas"
                placeholder="Share any creative ideas you have for working with this brand (e.g., video series, product reviews, social campaigns)..."
                value={formData.ideas}
                onChange={(e) => setFormData({ ...formData, ideas: e.target.value })}
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">{editingBrand ? "Update Brand" : "Add Brand"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border border-border bg-card shadow-sm">
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg md:text-xl font-semibold text-foreground">Outreach List</h2>
            {brands.length > 0 && (
              <p className="text-xs md:text-sm text-muted-foreground">Keep it light—only the essentials you need now.</p>
            )}
          </div>

          {brands.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No brands added yet. Add your first brand to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="rounded-lg border border-border/70 bg-card/80 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">{brand.name}</h3>
                      {getStatusBadge(brand.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Deal type:</span> {brand.dealType}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Why it fits:</span> {truncateText(brand.reason, 110)}
                    </p>
                    {brand.ideas && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Ideas:</span> {truncateText(brand.ideas, 110)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(brand.dateAdded).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end md:self-start">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleEdit(brand)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeletingBrandId(brand.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                    {brand.status === "deal-created" && brand.dealId !== undefined && (
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1"
                        onClick={() => router.push(`/deals/${brand.dealId}`)}
                      >
                        View Deal
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <AlertDialog open={deletingBrandId !== null} onOpenChange={(open) => !open && setDeletingBrandId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this brand from your outreach list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBrandId && handleDelete(deletingBrandId)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
