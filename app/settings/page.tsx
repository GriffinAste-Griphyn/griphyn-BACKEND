"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useEffect, useMemo, useState } from "react"
import { useAgentSettings } from "@/components/agent-settings-provider"
import { DELIVERABLE_PRESETS } from "@/lib/deliverables"
import { Plus, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const {
    settings: { negotiation, escalation, notifications, rateCard },
    updateSettings,
  } = useAgentSettings()

  const [minDealAmount, setMinDealAmount] = useState(negotiation.minDealAmount.toString())
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState(negotiation.autoApprovalThreshold.toString())
  const [phoneNumber, setPhoneNumber] = useState(notifications.phoneNumber)

  useEffect(() => {
    setMinDealAmount(negotiation.minDealAmount.toString())
    setAutoApprovalThreshold(negotiation.autoApprovalThreshold.toString())
  }, [negotiation.minDealAmount, negotiation.autoApprovalThreshold])

  useEffect(() => {
    setPhoneNumber(notifications.phoneNumber)
  }, [notifications.phoneNumber])

  const formatNumberWithCommas = (value: string) => {
    const number = value.replace(/,/g, "")
    if (!number || isNaN(Number(number))) return value
    return Number(number).toLocaleString("en-US")
  }

  const handleNumberInput = (value: string, setter: (val: string) => void) => {
    const cleanValue = value.replace(/,/g, "")
    if (cleanValue === "" || !isNaN(Number(cleanValue))) {
      setter(cleanValue)
    }
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  }

  const handlePhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned)
      updateSettings((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          phoneNumber: cleaned,
        },
      }))
    }
  }

  const presetDeliverables = useMemo(() => {
    const customEntries = rateCard
      .filter((entry) => !DELIVERABLE_PRESETS.some((preset) => preset.deliverableKey === entry.deliverableKey))
      .map((entry) => ({ label: entry.label, deliverableKey: entry.deliverableKey }))

    return [
      ...DELIVERABLE_PRESETS.map(({ label, deliverableKey }) => ({ label, deliverableKey })),
      ...customEntries,
    ]
  }, [rateCard])

  const handleRateLabelSelect = (id: string, deliverableKey: string, label?: string) => {
    updateSettings((prev) => ({
      ...prev,
      rateCard: prev.rateCard.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              label: label ?? entry.label,
              deliverableKey,
            }
          : entry,
      ),
    }))
  }

  const handleRatePriceChange = (id: string, value: string) => {
    const clean = value.replace(/,/g, "")
    if (clean === "" || !isNaN(Number(clean))) {
      updateSettings((prev) => ({
        ...prev,
        rateCard: prev.rateCard.map((entry) =>
          entry.id === id ? { ...entry, price: clean === "" ? 0 : Number(clean) } : entry,
        ),
      }))
    }
  }

  const handleAddRateEntry = () => {
    const newId = `custom-${Date.now()}`
    updateSettings((prev) => ({
      ...prev,
      rateCard: [
        ...prev.rateCard,
        {
          id: newId,
          label: presetDeliverables[0]?.label ?? "Deliverable",
          deliverableKey: presetDeliverables[0]?.deliverableKey ?? `custom-${prev.rateCard.length + 1}`,
          price: 0,
        },
      ],
    }))
  }

  const handleRemoveRateEntry = (id: string) => {
    updateSettings((prev) => ({
      ...prev,
      rateCard: prev.rateCard.length > 1 ? prev.rateCard.filter((entry) => entry.id !== id) : prev.rateCard,
    }))
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-1">Settings & Guardrails</h1>
        <p className="text-muted-foreground">Configure how your agent handles deals and negotiations.</p>
      </div>

      <div className="space-y-6">
        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Negotiation Guardrails</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Set boundaries for deal amounts and automatic approvals.
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minDeal">Minimum Deal Amount</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      id="minDeal"
                      type="text"
                      value={formatNumberWithCommas(minDealAmount)}
                      onChange={(e) => {
                        const value = e.target.value
                        handleNumberInput(value, setMinDealAmount)
                        updateSettings((prev) => ({
                          ...prev,
                          negotiation: {
                            ...prev.negotiation,
                            minDealAmount: Number(value.replace(/,/g, "") || "0"),
                          },
                        }))
                      }}
                      placeholder="5,000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Agent will decline deals below this amount</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="autoApproval">Auto-Approval Threshold</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="autoApproval"
                    type="text"
                    value={formatNumberWithCommas(autoApprovalThreshold)}
                    onChange={(e) => {
                      const value = e.target.value
                      handleNumberInput(value, setAutoApprovalThreshold)
                      updateSettings((prev) => ({
                        ...prev,
                        negotiation: {
                          ...prev.negotiation,
                          autoApprovalThreshold: Number(value.replace(/,/g, "") || "0"),
                        },
                      }))
                    }}
                    placeholder="10,000"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Agent can auto-approve deals under this amount if terms meet your criteria
                </p>
              </div>

              <div className="space-y-3">
                <div
                  className="flex items-center justify-between gap-4 py-3 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-accent/50 active:bg-accent transition-colors md:py-0 md:px-0 md:mx-0 md:hover:bg-transparent md:cursor-default"
                  onClick={() =>
                    updateSettings((prev) => ({
                      ...prev,
                      negotiation: {
                        ...prev.negotiation,
                        usageRightsApproval: !prev.negotiation.usageRightsApproval,
                      },
                    }))
                  }
                >
                  <div className="space-y-0.5 flex-1">
                    <Label className="cursor-pointer md:cursor-default">
                      Require approval for usage rights changes
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Escalate if brand requests whitelisting or paid usage
                    </p>
                  </div>
                  <Switch
                    checked={negotiation.usageRightsApproval}
                    onCheckedChange={(checked) =>
                      updateSettings((prev) => ({
                        ...prev,
                        negotiation: {
                          ...prev.negotiation,
                          usageRightsApproval: checked,
                        },
                      }))
                    }
                    className="scale-110 md:scale-100"
                  />
                </div>

                <div
                  className="flex items-center justify-between gap-4 py-3 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-accent/50 active:bg-accent transition-colors md:py-0 md:px-0 md:mx-0 md:hover:bg-transparent md:cursor-default"
                  onClick={() =>
                    updateSettings((prev) => ({
                      ...prev,
                      negotiation: {
                        ...prev.negotiation,
                        timelineApproval: !prev.negotiation.timelineApproval,
                      },
                    }))
                  }
                >
                  <div className="space-y-0.5 flex-1">
                    <Label className="cursor-pointer md:cursor-default">Require approval for timeline changes</Label>
                    <p className="text-xs text-muted-foreground">Notify me if brand requests different deadlines</p>
                  </div>
                  <Switch
                    checked={negotiation.timelineApproval}
                    onCheckedChange={(checked) =>
                      updateSettings((prev) => ({
                        ...prev,
                        negotiation: {
                          ...prev.negotiation,
                          timelineApproval: checked,
                        },
                      }))
                    }
                    className="scale-110 md:scale-100"
                  />
                </div>

                <div
                  className="flex items-center justify-between gap-4 py-3 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-accent/50 active:bg-accent transition-colors md:py-0 md:px-0 md:mx-0 md:hover:bg-transparent md:cursor-default"
                  onClick={() =>
                    updateSettings((prev) => ({
                      ...prev,
                      negotiation: {
                        ...prev.negotiation,
                        autoDeclineNonAligned: !prev.negotiation.autoDeclineNonAligned,
                      },
                    }))
                  }
                >
                  <div className="space-y-0.5 flex-1">
                    <Label className="cursor-pointer md:cursor-default">Auto-decline non-aligned brands</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically reject brands outside your niche or values
                    </p>
                  </div>
                  <Switch
                    checked={negotiation.autoDeclineNonAligned}
                    onCheckedChange={(checked) =>
                      updateSettings((prev) => ({
                        ...prev,
                        negotiation: {
                          ...prev.negotiation,
                          autoDeclineNonAligned: checked,
                        },
                      }))
                    }
                    className="scale-110 md:scale-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Rate Card</h2>
                <p className="text-sm text-muted-foreground">
                  Define your baseline pricing per deliverable so the agent can negotiate with confidence.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddRateEntry} className="gap-2">
                <Plus className="h-4 w-4" /> Add deliverable
              </Button>
            </div>

            <div className="space-y-4">
              {rateCard.map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-end border border-border/60 rounded-lg p-4 bg-muted/30"
                >
                  <div className="space-y-2">
                    <Label>Deliverable</Label>
                    <Select
                      value={entry.deliverableKey}
                      onValueChange={(value) => {
                        const option = presetDeliverables.find((item) => item.deliverableKey === value)
                        handleRateLabelSelect(entry.id, value, option?.label)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select deliverable" />
                      </SelectTrigger>
                      <SelectContent>
                        {presetDeliverables.map((option) => (
                          <SelectItem key={option.deliverableKey} value={option.deliverableKey}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Baseline price</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        value={formatNumberWithCommas(entry.price.toString())}
                        onChange={(e) => handleRatePriceChange(entry.id, e.target.value)}
                        placeholder="5,000"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pb-2 md:pb-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRateEntry(entry.id)}
                      disabled={rateCard.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Escalation Rules</h2>
            <p className="text-sm text-muted-foreground mb-6">Define when the agent should notify you.</p>

            <div className="space-y-3">
              <div
                className="flex items-center justify-between gap-4 py-3 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-accent/50 active:bg-accent transition-colors md:py-0 md:px-0 md:mx-0 md:hover:bg-transparent md:cursor-default"
                onClick={() =>
                  updateSettings((prev) => ({
                    ...prev,
                    escalation: {
                      ...prev.escalation,
                      highValueDeals: !prev.escalation.highValueDeals,
                    },
                  }))
                }
              >
                <div className="space-y-0.5 flex-1">
                  <Label className="cursor-pointer md:cursor-default">High-value deals</Label>
                  <p className="text-xs text-muted-foreground">Notify me when offers exceed your targets</p>
                </div>
                <Switch
                  checked={escalation.highValueDeals}
                  onCheckedChange={(checked) =>
                    updateSettings((prev) => ({
                      ...prev,
                      escalation: {
                        ...prev.escalation,
                        highValueDeals: checked,
                      },
                    }))
                  }
                  className="scale-110 md:scale-100"
                />
              </div>

              <div
                className="flex items-center justify-between gap-4 py-3 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-accent/50 active:bg-accent transition-colors md:py-0 md:px-0 md:mx-0 md:hover:bg-transparent md:cursor-default"
                onClick={() =>
                  updateSettings((prev) => ({
                    ...prev,
                    escalation: {
                      ...prev.escalation,
                      unusualTerms: !prev.escalation.unusualTerms,
                    },
                  }))
                }
              >
                <div className="space-y-0.5 flex-1">
                  <Label className="cursor-pointer md:cursor-default">Unusual terms or requests</Label>
                  <p className="text-xs text-muted-foreground">Alert me if brand asks for non-standard deliverables</p>
                </div>
                <Switch
                  checked={escalation.unusualTerms}
                  onCheckedChange={(checked) =>
                    updateSettings((prev) => ({
                      ...prev,
                      escalation: {
                        ...prev.escalation,
                        unusualTerms: checked,
                      },
                    }))
                  }
                  className="scale-110 md:scale-100"
                />
              </div>

              <div
                className="flex items-center justify-between gap-4 py-3 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-accent/50 active:bg-accent transition-colors md:py-0 md:px-0 md:mx-0 md:hover:bg-transparent md:cursor-default"
                onClick={() =>
                  updateSettings((prev) => ({
                    ...prev,
                    escalation: {
                      ...prev.escalation,
                      paymentDelays: !prev.escalation.paymentDelays,
                    },
                  }))
                }
              >
                <div className="space-y-0.5 flex-1">
                  <Label className="cursor-pointer md:cursor-default">Payment delays</Label>
                  <p className="text-xs text-muted-foreground">Notify me if payment is overdue by 3+ days</p>
                </div>
                <Switch
                  checked={escalation.paymentDelays}
                  onCheckedChange={(checked) =>
                    updateSettings((prev) => ({
                      ...prev,
                      escalation: {
                        ...prev.escalation,
                        paymentDelays: checked,
                      },
                    }))
                  }
                  className="scale-110 md:scale-100"
                />
              </div>

              <div
                className="flex items-center justify-between gap-4 py-3 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-accent/50 active:bg-accent transition-colors md:py-0 md:px-0 md:mx-0 md:hover:bg-transparent md:cursor-default"
                onClick={() =>
                  updateSettings((prev) => ({
                    ...prev,
                    escalation: {
                      ...prev.escalation,
                      newBrandInquiries: !prev.escalation.newBrandInquiries,
                    },
                  }))
                }
              >
                <div className="space-y-0.5 flex-1">
                  <Label className="cursor-pointer md:cursor-default">New brand inquiries</Label>
                  <p className="text-xs text-muted-foreground">Alert me when a new brand reaches out</p>
                </div>
                <Switch
                  checked={escalation.newBrandInquiries}
                  onCheckedChange={(checked) =>
                    updateSettings((prev) => ({
                      ...prev,
                      escalation: {
                        ...prev.escalation,
                        newBrandInquiries: checked,
                      },
                    }))
                  }
                  className="scale-110 md:scale-100"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Notification Preferences</h2>
            <p className="text-sm text-muted-foreground mb-6">Choose how you want to be notified.</p>

            <div className="space-y-4">
              <div
                className="flex items-center justify-between gap-4 py-3 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-accent/50 active:bg-accent transition-colors md:py-0 md:px-0 md:mx-0 md:hover:bg-transparent md:cursor-default"
                onClick={() =>
                  updateSettings((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      smsNotifications: !prev.notifications.smsNotifications,
                    },
                  }))
                }
              >
                <div className="space-y-0.5 flex-1">
                  <Label className="cursor-pointer md:cursor-default">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive text messages for urgent items</p>
                </div>
                <Switch
                  checked={notifications.smsNotifications}
                  onCheckedChange={(checked) =>
                    updateSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        smsNotifications: checked,
                      },
                    }))
                  }
                  className="scale-110 md:scale-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formatPhoneNumber(phoneNumber)}
                  onChange={(e) => handlePhoneInput(e.target.value)}
                  placeholder="(555) 123-4567"
                />
                <p className="text-xs text-muted-foreground">
                  Required for SMS notifications and AI assistant text messages
                </p>
              </div>

              <div
                className="flex items-center justify-between gap-4 py-3 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-accent/50 active:bg-accent transition-colors md:py-0 md:px-0 md:mx-0 md:hover:bg-transparent md:cursor-default"
                onClick={() =>
                  updateSettings((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      emailNotifications: !prev.notifications.emailNotifications,
                    },
                  }))
                }
              >
                <div className="space-y-0.5 flex-1">
                  <Label className="cursor-pointer md:cursor-default">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get email updates for all activity</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    updateSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        emailNotifications: checked,
                      },
                    }))
                  }
                  className="scale-110 md:scale-100"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="notificationTime">Preferred Notification Time</Label>
                <Select defaultValue="morning">
                  <SelectTrigger id="notificationTime">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8:00 AM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12:00 PM)</SelectItem>
                    <SelectItem value="evening">Evening (6:00 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Channels & Identity</h2>
            <p className="text-sm text-muted-foreground mb-6">Manage your social media presence and branding.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram Handle</Label>
                <Input id="instagram" placeholder="@griffincreator" defaultValue="@griffincreator" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok Handle</Label>
                <Input id="tiktok" placeholder="@griffincreator" defaultValue="@griffincreator" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube Channel</Label>
                <Input id="youtube" placeholder="@griffincreator" defaultValue="@griffincreator" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="niche">Primary Content Niche</Label>
                <Select defaultValue="fashion">
                  <SelectTrigger id="niche">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion">Fashion & Style</SelectItem>
                    <SelectItem value="beauty">Beauty & Makeup</SelectItem>
                    <SelectItem value="fitness">Fitness & Wellness</SelectItem>
                    <SelectItem value="food">Food & Cooking</SelectItem>
                    <SelectItem value="travel">Travel & Lifestyle</SelectItem>
                    <SelectItem value="tech">Tech & Gaming</SelectItem>
                    <SelectItem value="home">Home & Interior Design</SelectItem>
                    <SelectItem value="parenting">Parenting & Family</SelectItem>
                    <SelectItem value="finance">Finance & Business</SelectItem>
                    <SelectItem value="education">Education & Learning</SelectItem>
                    <SelectItem value="sports">Sports & Athletics</SelectItem>
                    <SelectItem value="music">Music & Entertainment</SelectItem>
                    <SelectItem value="art">Art & Design</SelectItem>
                    <SelectItem value="photography">Photography & Videography</SelectItem>
                    <SelectItem value="automotive">Automotive & Cars</SelectItem>
                    <SelectItem value="pets">Pets & Animals</SelectItem>
                    <SelectItem value="diy">DIY & Crafts</SelectItem>
                    <SelectItem value="outdoor">Outdoor & Adventure</SelectItem>
                    <SelectItem value="sustainability">Sustainability & Eco-Living</SelectItem>
                    <SelectItem value="comedy">Comedy & Humor</SelectItem>
                    <SelectItem value="motivation">Motivation & Self-Improvement</SelectItem>
                    <SelectItem value="books">Books & Literature</SelectItem>
                    <SelectItem value="science">Science & Nature</SelectItem>
                    <SelectItem value="health">Health & Medical</SelectItem>
                    <SelectItem value="luxury">Luxury & High-End Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Fashion-forward millennials and Gen Z"
                  defaultValue="Fashion-forward millennials and Gen Z"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </>
  )
}
