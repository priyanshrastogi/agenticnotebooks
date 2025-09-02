'use client';

import { ChartOptionsConfig } from '@/components/ChartOptions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartDataset } from '@/lib/charts/core/types';

import ChartContainer from './ChartContainer';

interface ChartViewerProps {
  data: ChartDataset[];
  chartId: string;
  options: ChartOptionsConfig;
  activeTab: 'chart' | 'data';
  onTabChange: (tab: 'chart' | 'data') => void;
  onRegenerateData: () => void;
}

export default function ChartViewer({
  data,
  chartId,
  options,
  activeTab,
  onTabChange,
  onRegenerateData,
}: ChartViewerProps) {
  return (
    <div className="flex-1">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'chart' | 'data')}>
          <TabsList>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={onRegenerateData} variant="outline" size="sm" className="w-full sm:w-auto">
          Regenerate Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'chart' | 'data')}>
        <TabsContent value="chart">
          <ChartContainer data={data} chartId={chartId} options={options} />
        </TabsContent>
        <TabsContent value="data">
          <div className="max-h-[280px] overflow-auto rounded-lg border bg-gray-50 p-2 sm:max-h-[400px] sm:p-4">
            <pre className="break-all font-mono text-xs sm:break-normal sm:text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
