'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DELIVERABLE_PRESETS } from '@/lib/deliverables';

type MonetaryValue = number;

export interface NegotiationGuardrails {
  minDealAmount: MonetaryValue;
  autoApprovalThreshold: MonetaryValue;
  usageRightsApproval: boolean;
  timelineApproval: boolean;
  autoDeclineNonAligned: boolean;
}

export interface RateCardEntry {
  id: string;
  label: string;
  deliverableKey: string;
  price: MonetaryValue;
}

export interface EscalationPreferences {
  highValueDeals: boolean;
  unusualTerms: boolean;
  paymentDelays: boolean;
  newBrandInquiries: boolean;
}

export interface NotificationPreferences {
  smsNotifications: boolean;
  emailNotifications: boolean;
  phoneNumber: string;
}

export interface AgentSettings {
  negotiation: NegotiationGuardrails;
  escalation: EscalationPreferences;
  notifications: NotificationPreferences;
  rateCard: RateCardEntry[];
}

type AgentSettingsContextValue = {
  settings: AgentSettings;
  updateSettings: (updater: (prev: AgentSettings) => AgentSettings) => void;
};

const DEFAULT_SETTINGS: AgentSettings = {
  negotiation: {
    minDealAmount: 5000,
    autoApprovalThreshold: 10000,
    usageRightsApproval: true,
    timelineApproval: true,
    autoDeclineNonAligned: true
  },
  escalation: {
    highValueDeals: true,
    unusualTerms: true,
    paymentDelays: true,
    newBrandInquiries: false
  },
  notifications: {
    smsNotifications: true,
    emailNotifications: true,
    phoneNumber: ''
  },
  rateCard: DELIVERABLE_PRESETS.slice(0, 6).map((preset, index) => ({
    id: preset.deliverableKey,
    label: preset.label,
    deliverableKey: preset.deliverableKey,
    price: [5000, 5500, 1200, 3000, 4000, 8000][index] ?? 0
  }))
};

const STORAGE_KEY = 'griphyn-agent-settings';

const AgentSettingsContext = createContext<AgentSettingsContextValue | null>(null);

export function AgentSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AgentSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AgentSettings>;
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          negotiation: { ...prev.negotiation, ...(parsed.negotiation ?? {}) },
          escalation: { ...prev.escalation, ...(parsed.escalation ?? {}) },
          notifications: { ...prev.notifications, ...(parsed.notifications ?? {}) },
          rateCard: parsed.rateCard && parsed.rateCard.length > 0 ? parsed.rateCard : prev.rateCard
        }));
      }
    } catch (error) {
      console.warn('Failed to load agent settings from storage', error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to persist agent settings', error);
    }
  }, [settings]);

  const value = useMemo<AgentSettingsContextValue>(
    () => ({
      settings,
      updateSettings: (updater) => setSettings((prev) => updater(prev))
    }),
    [settings]
  );

  return <AgentSettingsContext.Provider value={value}>{children}</AgentSettingsContext.Provider>;
}

export function useAgentSettings() {
  const context = useContext(AgentSettingsContext);
  if (!context) {
    throw new Error('useAgentSettings must be used within an AgentSettingsProvider');
  }
  return context;
}
