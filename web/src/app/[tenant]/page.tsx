import AgenticRowsLanding from '@/components/pages/AgenticRows/Landing';
import IntellichartsLanding from '@/components/pages/Intellicharts/Landing';

interface TenantPageProps {
  params: {
    tenant: string;
  };
}

export default function TenantPage({ params }: TenantPageProps) {
  const { tenant } = params;

  if (tenant === 'agenticrows') {
    return <AgenticRowsLanding />;
  }

  // Default to IntelliCharts
  return <IntellichartsLanding />;
}
