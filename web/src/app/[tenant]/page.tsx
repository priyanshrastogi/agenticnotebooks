import AgenticNotebooksLanding from '@/components/pages/AgenticNotebooks/Landing';
import IntellichartsLanding from '@/components/pages/Intellicharts/Landing';

interface TenantPageProps {
  params: Promise<{
    tenant: string;
  }>;
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenant } = await params;

  if (tenant === 'intellicharts') {
    return <IntellichartsLanding />;
  }

  // Default to AgenticNotebooks
  return <AgenticNotebooksLanding />;
}
