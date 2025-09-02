import { BarChart3, Grid2X2CheckIcon } from 'lucide-react';

export type Tenant = 'intellicharts' | 'agenticrows';

export interface TenantInfo {
  id: Tenant;
  name: string;
  domain: string;
  logoIcon: typeof Grid2X2CheckIcon;
  description: string;
}

export const TENANT_CONFIG: Record<Tenant, TenantInfo> = {
  intellicharts: {
    id: 'intellicharts',
    name: 'IntelliCharts',
    domain: 'intellicharts.com',
    logoIcon: Grid2X2CheckIcon,
    description: 'AI-powered data visualization platform',
  },
  agenticrows: {
    id: 'agenticrows',
    name: 'AgenticRows',
    domain: 'agenticrows.com',
    logoIcon: BarChart3,
    description: 'AI agent for data analysis',
  },
};

// Server-side function
export async function getTenant(): Promise<TenantInfo> {
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const tenantHeader = headersList.get('x-tenant') as Tenant | null;

  // Default to intellicharts if no header is found
  const tenantId = tenantHeader || 'intellicharts';
  return TENANT_CONFIG[tenantId];
}

// Client-side function to get tenant from window location
export function getTenantFromUrl(): TenantInfo {
  if (typeof window === 'undefined') {
    return TENANT_CONFIG.intellicharts;
  }
  
  const hostname = window.location.hostname;
  
  if (hostname.includes('agenticrows')) {
    return TENANT_CONFIG.agenticrows;
  }
  
  // Default to intellicharts
  return TENANT_CONFIG.intellicharts;
}

export async function isIntellicharts(): Promise<boolean> {
  const tenant = await getTenant();
  return tenant.id === 'intellicharts';
}

export async function isAgenticRows(): Promise<boolean> {
  const tenant = await getTenant();
  return tenant.id === 'agenticrows';
}
