'use client';

import { useEffect, useState } from 'react';

import { ChartOptionsConfig } from '@/components/ChartOptions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartDataset } from '@/lib/charts/core/types';

import ChartViewer from './ChartViewer';
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

  const regenerateData = () => {
    const newData = dataGenerator();
    setData(newData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 lg:flex-row">
          <ChartViewer
            data={data}
            chartId={chartId}
            options={options}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onRegenerateData={regenerateData}
          />
          <OptionsPanel options={options} onOptionsChange={setOptions} chartType="line" />
        </div>
      </CardContent>
    </Card>
  );
}
