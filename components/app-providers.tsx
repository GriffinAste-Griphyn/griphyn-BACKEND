'use client'

import type { PropsWithChildren } from 'react';
import { AgentSettingsProvider } from './agent-settings-provider';

export default function AppProviders({ children }: PropsWithChildren) {
  return <AgentSettingsProvider>{children}</AgentSettingsProvider>;
}
