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
  onRegenerateData 
}: ChartViewerProps) {

  return (
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
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
          <div className="border rounded-lg p-2 sm:p-4 bg-gray-50 max-h-[280px] sm:max-h-[400px] overflow-auto">
            <pre className="text-xs sm:text-sm font-mono break-all sm:break-normal">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}