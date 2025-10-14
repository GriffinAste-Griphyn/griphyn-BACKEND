'use client'

import { useEffect, useState } from 'react';

export type NegotiationStatus = 'idle' | 'recommendation-ready' | 'in-progress' | 'completed';

export interface NegotiationPlan {
  status: NegotiationStatus;
  recommendedCounter: number;
  percentageIncrease: number;
  rationale: string[];
  lastUpdated: string;
  emailDraft: string;
}

const STORAGE_KEY = 'griphyn-negotiation-plans';

type NegotiationMap = Record<string, NegotiationPlan>;

export function useNegotiationState(dealId: string, computeInitial: () => NegotiationPlan) {
  const [plan, setPlan] = useState<NegotiationPlan>(() => computeInitial());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = computeInitial();
        setPlan(initial);
        return;
      }
      const parsed = JSON.parse(raw) as NegotiationMap;
      if (parsed[dealId]) {
        setPlan(parsed[dealId]);
      } else {
        const initial = computeInitial();
        setPlan(initial);
        parsed[dealId] = initial;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch (error) {
      console.warn('Failed to load negotiation plan', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const map: NegotiationMap = raw ? (JSON.parse(raw) as NegotiationMap) : {};
      map[dealId] = plan;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      window.dispatchEvent(
        new CustomEvent('griphyn-negotiation-plan-updated', {
          detail: { dealId, plan }
        })
      );
    } catch (error) {
      console.warn('Failed to persist negotiation plan', error);
    }
  }, [dealId, plan]);

  return [plan, setPlan] as const;
}
