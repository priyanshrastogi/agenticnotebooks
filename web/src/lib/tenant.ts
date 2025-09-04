import { BookOpen, TrendingUp } from 'lucide-react';

export type Tenant = 'agenticnotebooks' | 'intellicharts';

export interface TenantInfo {
  id: Tenant;
  name: string;
  domain: string;
  logoIcon: typeof TrendingUp;
  description: string;
}

export const TENANT_CONFIG: Record<Tenant, TenantInfo> = {
  agenticnotebooks: {
    id: 'agenticnotebooks',
    name: 'AgenticNotebooks',
    domain: 'agenticnotebooks.com',
    logoIcon: BookOpen,
    description: 'AI agent for notebook analysis',
  },
  intellicharts: {
    id: 'intellicharts',
    name: 'IntelliCharts',
    domain: 'intellicharts.com',
    logoIcon: TrendingUp,
    description: 'AI-powered data visualization platform',
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
    return TENANT_CONFIG.agenticnotebooks;
  }
  
  const hostname = window.location.hostname;
  
  if (hostname.includes('agenticnotebooks')) {
    return TENANT_CONFIG.agenticnotebooks;
  }
  
  if (hostname.includes('intellicharts')) {
    return TENANT_CONFIG.intellicharts;
  }
  
  // Default to agenticnotebooks
  return TENANT_CONFIG.agenticnotebooks;
}

export async function isIntellicharts(): Promise<boolean> {
  const tenant = await getTenant();
  return tenant.id === 'intellicharts';
}

export async function isAgenticNotebooks(): Promise<boolean> {
  const tenant = await getTenant();
  return tenant.id === 'agenticnotebooks';
}
