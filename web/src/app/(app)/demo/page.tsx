'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { type ChartOptionsConfig } from '@/components/ChartOptions';
import ChartOptionsPopover from '@/components/ChartOptionsPopover';
import { type AreaChart, createAreaChart, createLineChart, type LineChart } from '@/lib/charts';
import type { ChartDataset } from '@/lib/charts/core/types';
import {
  generateAppleStockData,
  generateAppleStockDataWithDates,
  generateTechStocksData,
} from '@/lib/charts/data/stockData';

export default function DemoPage() {
  const appleStockRef = useRef<HTMLDivElement>(null);
  const appleMonthlyRef = useRef<HTMLDivElement>(null);
  const techStocksRef = useRef<HTMLDivElement>(null);
  const multiAreaChartRef = useRef<HTMLDivElement>(null);
  
  // Chart instances
  const appleStockChartRef = useRef<AreaChart | null>(null);
  const appleMonthlyChartRef = useRef<LineChart | null>(null);
  const techStocksChartRef = useRef<LineChart | null>(null);
  const multiAreaChartInstanceRef = useRef<AreaChart | null>(null);

  // Chart options state
  const [appleStockOptions, setAppleStockOptions] = useState<ChartOptionsConfig>({
    showGrid: true,
    showAxis: true,
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom',
    showPoints: false,
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: false,
  });

  const [appleMonthlyOptions, setAppleMonthlyOptions] = useState<ChartOptionsConfig>({
    showGrid: true,
    showAxis: true,
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom',
    showPoints: false,
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: false,
  });

  const [techStocksOptions, setTechStocksOptions] = useState<ChartOptionsConfig>({
    showGrid: true,
    showAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    showPoints: false,
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: false,
  });

  const [multiAreaOptions, setMultiAreaOptions] = useState<ChartOptionsConfig>({
    showGrid: true,
    showAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    showPoints: false,
    animate: true,
    curve: 'smooth',
    yAxisStartsFromZero: false,
    showStackedTotal: false,
  });

  // Chart data - using useMemo to prevent regeneration on every render
  const appleStockData = useMemo(() => [generateAppleStockData()], []);
  const appleMonthlyData = useMemo(() => [generateAppleStockDataWithDates()], []);
  const techStocksData = useMemo(() => generateTechStocksData(), []);
  const stackedData = useMemo(() => {
    // Create cumulative/portfolio data for stacked chart
    const baseData = generateTechStocksData();
    return baseData.map(dataset => ({
      ...dataset,
      data: dataset.data.map(point => ({
        ...point,
        y: point.y / 10 // Scale down for better stacking visualization
      }))
    }));
  }, []);

  // Tab state for each chart
  const [appleStockTab, setAppleStockTab] = useState<'chart' | 'data'>('chart');
  const [appleMonthlyTab, setAppleMonthlyTab] = useState<'chart' | 'data'>('chart');
  const [techStocksTab, setTechStocksTab] = useState<'chart' | 'data'>('chart');
  const [stackedTab, setStackedTab] = useState<'chart' | 'data'>('chart');

  // Function to convert ChartOptionsConfig to chart library options
  const convertToChartOptions = (options: ChartOptionsConfig, isAreaChart = false) => ({
    height: 400,
    showGrid: options.showGrid,
    showAxis: options.showAxis,
    showTooltip: options.showTooltip,
    showLegend: options.showLegend,
    legendPosition: options.legendPosition,
    animate: options.animate,
    curve: options.curve,
    yAxisStartsFromZero: options.yAxisStartsFromZero,
    showPoints: options.showPoints,
    ...(isAreaChart && {
      fillOpacity: 0.3,
      stacked: false,
      showStackedTotal: options.showStackedTotal,
    }),
  });

  // Apple Stock Area Chart
  useEffect(() => {
    if (appleStockRef.current && appleStockTab === 'chart') {
      // Destroy existing chart
      if (appleStockChartRef.current) {
        appleStockChartRef.current.destroy();
      }
      // Create new chart
      appleStockChartRef.current = createAreaChart(
        '#apple-stock-chart',
        appleStockData,
        convertToChartOptions(appleStockOptions, true)
      );
      appleStockChartRef.current.render();
    }
  }, [appleStockOptions, appleStockData, appleStockTab]);

  // Apple Monthly Line Chart
  useEffect(() => {
    if (appleMonthlyRef.current && appleMonthlyTab === 'chart') {
      if (appleMonthlyChartRef.current) {
        appleMonthlyChartRef.current.destroy();
      }
      appleMonthlyChartRef.current = createLineChart(
        '#apple-monthly-chart',
        appleMonthlyData,
        convertToChartOptions(appleMonthlyOptions)
      );
      appleMonthlyChartRef.current.render();
    }
  }, [appleMonthlyOptions, appleMonthlyData, appleMonthlyTab]);

  // Tech Stocks Line Chart
  useEffect(() => {
    if (techStocksRef.current && techStocksTab === 'chart') {
      if (techStocksChartRef.current) {
        techStocksChartRef.current.destroy();
      }
      techStocksChartRef.current = createLineChart(
        '#tech-stocks-chart',
        techStocksData,
        convertToChartOptions(techStocksOptions)
      );
      techStocksChartRef.current.render();
    }
  }, [techStocksOptions, techStocksData, techStocksTab]);

  // Multi Area Chart
  useEffect(() => {
    if (multiAreaChartRef.current && stackedTab === 'chart') {
      if (multiAreaChartInstanceRef.current) {
        multiAreaChartInstanceRef.current.destroy();
      }
      multiAreaChartInstanceRef.current = createAreaChart(
        '#multi-area-chart',
        stackedData,
        {
          ...convertToChartOptions(multiAreaOptions, true),
          stacked: true, // Keep stacked for this specific chart
        }
      );
      multiAreaChartInstanceRef.current.render();
    }
  }, [multiAreaOptions, stackedData, stackedTab]);

  // Tab component
  const TabButton = ({ 
    active, 
    onClick, 
    children 
  }: { 
    active: boolean; 
    onClick: () => void; 
    children: React.ReactNode; 
  }) => (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
        active
          ? 'bg-white text-blue-600 border-b-2 border-blue-600'
          : 'bg-gray-50 text-gray-500 hover:text-gray-700'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  // Data JSON component
  const DataDisplay = ({ datasets }: { datasets: ChartDataset[] }) => (
    <div className="max-h-96 overflow-auto rounded-lg border bg-gray-50 p-4">
      <pre className="text-sm text-gray-800">
        <code>{JSON.stringify(datasets, null, 2)}</code>
      </pre>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">IntelliCharts Demo</h1>
        <p className="text-gray-600">Beautiful, customizable charts built with D3.js</p>
      </div>

      <div className="space-y-12">
        {/* Apple Stock Area Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Apple Stock Price (AAPL)</h2>
              <p className="text-sm text-gray-600">
                Daily stock price over the last year with gradient area fill
              </p>
            </div>
            <ChartOptionsPopover
              options={appleStockOptions}
              onOptionsChange={setAppleStockOptions}
              chartType="area"
            />
          </div>
          
          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton
              active={appleStockTab === 'chart'}
              onClick={() => setAppleStockTab('chart')}
            >
              Chart
            </TabButton>
            <TabButton
              active={appleStockTab === 'data'}
              onClick={() => setAppleStockTab('data')}
            >
              Data
            </TabButton>
          </div>

          {/* Content */}
          {appleStockTab === 'chart' ? (
            <div id="apple-stock-chart" ref={appleStockRef} className="w-full"></div>
          ) : (
            <DataDisplay datasets={appleStockData} />
          )}
        </div>

        {/* Apple Monthly Line Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Apple Monthly Performance</h2>
              <p className="text-sm text-gray-600">
                Monthly closing prices showing seasonal patterns
              </p>
            </div>
            <ChartOptionsPopover
              options={appleMonthlyOptions}
              onOptionsChange={setAppleMonthlyOptions}
              chartType="line"
            />
          </div>
          
          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton
              active={appleMonthlyTab === 'chart'}
              onClick={() => setAppleMonthlyTab('chart')}
            >
              Chart
            </TabButton>
            <TabButton
              active={appleMonthlyTab === 'data'}
              onClick={() => setAppleMonthlyTab('data')}
            >
              Data
            </TabButton>
          </div>

          {/* Content */}
          {appleMonthlyTab === 'chart' ? (
            <div id="apple-monthly-chart" ref={appleMonthlyRef} className="w-full"></div>
          ) : (
            <DataDisplay datasets={appleMonthlyData} />
          )}
        </div>

        {/* Tech Stocks Comparison */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Tech Stocks Comparison</h2>
              <p className="text-sm text-gray-600">AAPL vs GOOGL vs MSFT performance comparison</p>
            </div>
            <ChartOptionsPopover
              options={techStocksOptions}
              onOptionsChange={setTechStocksOptions}
              chartType="line"
            />
          </div>
          
          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton
              active={techStocksTab === 'chart'}
              onClick={() => setTechStocksTab('chart')}
            >
              Chart
            </TabButton>
            <TabButton
              active={techStocksTab === 'data'}
              onClick={() => setTechStocksTab('data')}
            >
              Data
            </TabButton>
          </div>

          {/* Content */}
          {techStocksTab === 'chart' ? (
            <div id="tech-stocks-chart" ref={techStocksRef} className="w-full"></div>
          ) : (
            <DataDisplay datasets={techStocksData} />
          )}
        </div>

        {/* Stacked Area Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Stacked Tech Portfolio</h2>
              <p className="text-sm text-gray-600">
                Cumulative portfolio value showing stacked stock contributions
              </p>
            </div>
            <ChartOptionsPopover
              options={multiAreaOptions}
              onOptionsChange={setMultiAreaOptions}
              chartType="area"
            />
          </div>
          
          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton
              active={stackedTab === 'chart'}
              onClick={() => setStackedTab('chart')}
            >
              Chart
            </TabButton>
            <TabButton
              active={stackedTab === 'data'}
              onClick={() => setStackedTab('data')}
            >
              Data
            </TabButton>
          </div>

          {/* Content */}
          {stackedTab === 'chart' ? (
            <div id="multi-area-chart" ref={multiAreaChartRef} className="w-full"></div>
          ) : (
            <DataDisplay datasets={stackedData} />
          )}
        </div>
      </div>

      {/* Features */}
      <div className="mt-12 rounded-lg bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Features</h3>
        <div className="grid gap-4 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-3">
          <div>✅ Dashed grid lines</div>
          <div>✅ Dark, clear axis lines</div>
          <div>✅ Beautiful gradient fills</div>
          <div>✅ Smooth animations</div>
          <div>✅ Interactive tooltips</div>
          <div>✅ Responsive design</div>
          <div>✅ Multiple datasets</div>
          <div>✅ Customizable colors</div>
          <div>✅ Chart.js-like API</div>
          <div>✅ Chart/Data view toggle</div>
          <div>✅ Realistic stock data</div>
        </div>
      </div>
    </div>
  );
}