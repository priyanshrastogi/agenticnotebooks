'use client';

import { useEffect, useState } from 'react';

import { ChartOptionsConfig } from '@/components/ChartOptions';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartDataset } from '@/lib/charts/core/types';

import ChartContainer from './ChartContainer';
import OptionsPanel from './OptionsPanel';

interface ChartDemoProps {
  title: string;
  description: string;
  dataGenerator: () => ChartDataset[];
  chartId: string;
  defaultOptions?: Partial<ChartOptionsConfig>;
}

export default function ChartDemo({
  title,
  description,
  dataGenerator,
  chartId,
  defaultOptions = {},
}: ChartDemoProps) {
  const [data, setData] = useState<ChartDataset[]>([]);
  const [activeTab, setActiveTab] = useState<'chart' | 'data'>('chart');
  const [options, setOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    showPoints: false, // Default to false as requested
    animate: true,
    curve: 'smooth',
    yAxisStartsFromZero: false,
    tooltipSize: 'sm',
    ...defaultOptions, // Apply custom default options
  });

  // Generate initial data
  useEffect(() => {
    const newData = dataGenerator();
    setData(newData);
  }, [dataGenerator]);

  return (
    <Card className="w-full bg-white">
      <CardContent className="p-6">
        {/* Header with title, description, and tabs */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">{description}</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'chart' | 'data')}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart" className="text-xs sm:text-sm">
                  Chart
                </TabsTrigger>
                <TabsTrigger value="data" className="text-xs sm:text-sm">
                  Data
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content area with chart and options */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Chart area - takes most of the space */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'chart' | 'data')}
            >
              <TabsContent value="chart" className="mt-0">
                <ChartContainer data={data} chartId={chartId} options={options} />
              </TabsContent>
              <TabsContent value="data" className="mt-0">
                <div className="h-[400px] overflow-auto rounded-lg border bg-gray-50 p-4">
                  <pre className="font-mono text-sm">{JSON.stringify(data, null, 2)}</pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Options panel - right sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div>
                <OptionsPanel options={options} onOptionsChange={setOptions} chartType="line" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
