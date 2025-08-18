'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { ChartExportButton } from '@/components/ChartExportButton';
import { type ChartOptionsConfig } from '@/components/ChartOptions';
import ChartOptionsPopover from '@/components/ChartOptionsPopover';
import {
  type AreaChart,
  type BarChart,
  createAreaChart,
  createBarChart,
  createDoughnutChart,
  createLineChart,
  createPieChart,
  createScatterChart,
  type LineChart,
  type PieChart,
  type ScatterChart,
} from '@/lib/charts';
import type { ChartDataset } from '@/lib/charts/core/types';
import {
  generateAppleStockData,
  generateAppleStockDataWithDates,
  generateBrowserUsageData,
  generateCampaignPerformanceScatter,
  generateCustomerSatisfactionScatter,
  generateDepartmentRevenueData,
  generateGlobalTemperatureData,
  generateHeightWeightData,
  generateMarketShareData,
  generateOfficeSatisfactionData,
  generateQuarterlySalesData,
  generateRegionalSalesData,
  generateRevenueBreakdownData,
  generateSalesMarketingData,
  // Extended examples with more datasets
  generateTechRevenueComparison,
  generateTechStocksData,
  generateTrafficSourcesData,
  generateWebsitePerformanceData,
} from '@/lib/charts/data';

export default function DemoPage() {
  const appleStockRef = useRef<HTMLDivElement>(null);
  const appleMonthlyRef = useRef<HTMLDivElement>(null);
  const techStocksRef = useRef<HTMLDivElement>(null);
  const multiAreaChartRef = useRef<HTMLDivElement>(null);
  const heightWeightRef = useRef<HTMLDivElement>(null);
  const salesMarketingRef = useRef<HTMLDivElement>(null);
  const marketShareRef = useRef<HTMLDivElement>(null);
  const revenueBreakdownRef = useRef<HTMLDivElement>(null);
  const trafficSourcesRef = useRef<HTMLDivElement>(null);
  
  // Extended example refs
  const techRevenueRef = useRef<HTMLDivElement>(null);
  const globalTemperatureRef = useRef<HTMLDivElement>(null);
  const websitePerformanceRef = useRef<HTMLDivElement>(null);
  const regionalSalesRef = useRef<HTMLDivElement>(null);
  const customerSatisfactionRef = useRef<HTMLDivElement>(null);
  const campaignPerformanceRef = useRef<HTMLDivElement>(null);
  
  // Bar chart refs
  const quarterlySalesRef = useRef<HTMLDivElement>(null);
  const departmentRevenueRef = useRef<HTMLDivElement>(null);
  const browserUsageRef = useRef<HTMLDivElement>(null);
  const officeSatisfactionRef = useRef<HTMLDivElement>(null);

  // Chart instances
  const appleStockChartRef = useRef<AreaChart | null>(null);
  const appleMonthlyChartRef = useRef<LineChart | null>(null);
  const techStocksChartRef = useRef<LineChart | null>(null);
  const multiAreaChartInstanceRef = useRef<AreaChart | null>(null);
  const heightWeightChartRef = useRef<ScatterChart | null>(null);
  const salesMarketingChartRef = useRef<ScatterChart | null>(null);
  const marketShareChartRef = useRef<PieChart | null>(null);
  const revenueBreakdownChartRef = useRef<PieChart | null>(null);
  const trafficSourcesChartRef = useRef<PieChart | null>(null);
  
  // Extended example chart instances
  const techRevenueChartRef = useRef<LineChart | null>(null);
  const globalTemperatureChartRef = useRef<LineChart | null>(null);
  const websitePerformanceChartRef = useRef<AreaChart | null>(null);
  const regionalSalesChartRef = useRef<AreaChart | null>(null);
  const customerSatisfactionChartRef = useRef<ScatterChart | null>(null);
  const campaignPerformanceChartRef = useRef<ScatterChart | null>(null);
  
  // Bar chart instances
  const quarterlySalesChartRef = useRef<BarChart | null>(null);
  const departmentRevenueChartRef = useRef<BarChart | null>(null);
  const browserUsageChartRef = useRef<BarChart | null>(null);
  const officeSatisfactionChartRef = useRef<BarChart | null>(null);

  // Chart options state
  const [appleStockOptions, setAppleStockOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom',
    showPoints: false,
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: false,
    tooltipSize: 'sm',
  });

  const [appleMonthlyOptions, setAppleMonthlyOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom',
    showPoints: false,
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: false,
    tooltipSize: 'sm',
  });

  const [techStocksOptions, setTechStocksOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    showPoints: false,
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: false,
    tooltipSize: 'sm',
  });

  const [multiAreaOptions, setMultiAreaOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    showPoints: false,
    animate: true,
    curve: 'smooth',
    yAxisStartsFromZero: false,
    showStackedTotal: false,
    tooltipSize: 'sm',
  });

  const [heightWeightOptions, setHeightWeightOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: false,
    showTrendLine: true,
    tooltipSize: 'sm',
  });

  const [salesMarketingOptions, setSalesMarketingOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom',
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: true,
    showTrendLine: true,
    tooltipSize: 'sm',
  });

  const [marketShareOptions, setMarketShareOptions] = useState<ChartOptionsConfig>({
    showXGrid: false,
    showYGrid: false,
    showXAxis: false,
    showYAxis: false,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'right',
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: false,
    tooltipSize: 'sm',
    showLabels: true,
    showValues: false,
    showPercentages: true,
  });

  const [revenueBreakdownOptions, setRevenueBreakdownOptions] = useState<ChartOptionsConfig>({
    showXGrid: false,
    showYGrid: false,
    showXAxis: false,
    showYAxis: false,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: false,
    tooltipSize: 'sm',
    innerRadius: 75,
    showLabels: true,
    showValues: false,
    showPercentages: true,
  });

  const [trafficSourcesOptions, setTrafficSourcesOptions] = useState<ChartOptionsConfig>({
    showXGrid: false,
    showYGrid: false,
    showXAxis: false,
    showYAxis: false,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'right',
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: false,
    tooltipSize: 'sm',
    innerRadius: 80,
    showLabels: false,
    showValues: false,
    showPercentages: false,
  });

  // Extended example chart options state
  const [techRevenueOptions, setTechRevenueOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    showPoints: true,
    animate: true,
    curve: 'smooth',
    yAxisStartsFromZero: false,
    tooltipSize: 'sm',
  });

  const [globalTemperatureOptions, setGlobalTemperatureOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    showPoints: false,
    animate: true,
    curve: 'smooth',
    yAxisStartsFromZero: false,
    tooltipSize: 'sm',
  });

  const [websitePerformanceOptions, setWebsitePerformanceOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    showPoints: false,
    animate: true,
    curve: 'smooth',
    yAxisStartsFromZero: true,
    showStackedTotal: true,
    tooltipSize: 'sm',
  });

  const [regionalSalesOptions, setRegionalSalesOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    showPoints: false,
    animate: true,
    curve: 'smooth',
    yAxisStartsFromZero: true,
    showStackedTotal: false,
    tooltipSize: 'sm',
  });

  const [customerSatisfactionOptions, setCustomerSatisfactionOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: true,
    showTrendLine: true,
    tooltipSize: 'sm',
  });

  const [campaignPerformanceOptions, setCampaignPerformanceOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: true,
    showTrendLine: false,
    tooltipSize: 'sm',
  });

  // Bar chart options
  const [quarterlySalesOptions, setQuarterlySalesOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: true,
    tooltipSize: 'sm',
    stacked: false,
    horizontal: false,
    showBarValues: false,
  });

  const [departmentRevenueOptions, setDepartmentRevenueOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom',
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: true,
    tooltipSize: 'sm',
    stacked: false,
    horizontal: true,
    showBarValues: true,
  });

  const [browserUsageOptions, setBrowserUsageOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: true,
    tooltipSize: 'sm',
    stacked: false,
    horizontal: false,
    showBarValues: false,
  });

  const [officeSatisfactionOptions, setOfficeSatisfactionOptions] = useState<ChartOptionsConfig>({
    showXGrid: true,
    showYGrid: true,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showLegend: true,
    legendPosition: 'bottom',
    animate: true,
    curve: 'linear',
    yAxisStartsFromZero: true,
    tooltipSize: 'sm',
    stacked: true,
    horizontal: false,
    showBarValues: false,
  });

  // Chart data - using useMemo to prevent regeneration on every render
  const appleStockData = useMemo(() => [generateAppleStockData()], []);
  const appleMonthlyData = useMemo(() => [generateAppleStockDataWithDates()], []);
  const techStocksData = useMemo(() => generateTechStocksData(), []);
  const stackedData = useMemo(() => {
    // Create cumulative/portfolio data for stacked chart
    const baseData = generateTechStocksData();
    return baseData.map((dataset) => ({
      ...dataset,
      data: dataset.data.map((point) => ({
        ...point,
        y: point.y / 10, // Scale down for better stacking visualization
      })),
    }));
  }, []);
  const heightWeightData = useMemo(() => generateHeightWeightData(), []);
  const salesMarketingData = useMemo(() => [generateSalesMarketingData()], []);
  const marketShareData = useMemo(() => generateMarketShareData(), []);
  const revenueBreakdownData = useMemo(() => generateRevenueBreakdownData(), []);
  const trafficSourcesData = useMemo(() => generateTrafficSourcesData(), []);
  
  // Extended examples with more datasets
  const techRevenueData = useMemo(() => generateTechRevenueComparison(), []);
  const globalTemperatureData = useMemo(() => generateGlobalTemperatureData(), []);
  const websitePerformanceData = useMemo(() => generateWebsitePerformanceData(), []);
  const regionalSalesData = useMemo(() => generateRegionalSalesData(), []);
  const customerSatisfactionData = useMemo(() => generateCustomerSatisfactionScatter(), []);
  const campaignPerformanceData = useMemo(() => generateCampaignPerformanceScatter(), []);
  
  // Bar chart data
  const quarterlySalesData = useMemo(() => generateQuarterlySalesData(), []);
  const departmentRevenueData = useMemo(() => generateDepartmentRevenueData(), []);
  const browserUsageData = useMemo(() => generateBrowserUsageData(), []);
  const officeSatisfactionData = useMemo(() => generateOfficeSatisfactionData(), []);

  // Tab state for each chart
  const [appleStockTab, setAppleStockTab] = useState<'chart' | 'data'>('chart');
  const [appleMonthlyTab, setAppleMonthlyTab] = useState<'chart' | 'data'>('chart');
  const [techStocksTab, setTechStocksTab] = useState<'chart' | 'data'>('chart');
  const [stackedTab, setStackedTab] = useState<'chart' | 'data'>('chart');
  const [heightWeightTab, setHeightWeightTab] = useState<'chart' | 'data'>('chart');
  const [salesMarketingTab, setSalesMarketingTab] = useState<'chart' | 'data'>('chart');
  const [marketShareTab, setMarketShareTab] = useState<'chart' | 'data'>('chart');
  const [revenueBreakdownTab, setRevenueBreakdownTab] = useState<'chart' | 'data'>('chart');
  const [trafficSourcesTab, setTrafficSourcesTab] = useState<'chart' | 'data'>('chart');
  
  // Bar chart tabs
  const [quarterlySalesTab, setQuarterlySalesTab] = useState<'chart' | 'data'>('chart');
  const [departmentRevenueTab, setDepartmentRevenueTab] = useState<'chart' | 'data'>('chart');
  const [browserUsageTab, setBrowserUsageTab] = useState<'chart' | 'data'>('chart');
  const [officeSatisfactionTab, setOfficeSatisfactionTab] = useState<'chart' | 'data'>('chart');

  // Function to convert ChartOptionsConfig to chart library options
  const convertToChartOptions = (
    options: ChartOptionsConfig,
    chartType: 'line' | 'area' | 'scatter' | 'pie' | 'doughnut' | 'bar' = 'line'
  ) => ({
    height: 400,
    showXGrid: options.showXGrid,
    showYGrid: options.showYGrid,
    showXAxis: options.showXAxis,
    showYAxis: options.showYAxis,
    showTooltip: options.showTooltip,
    showLegend: options.showLegend,
    legendPosition: options.legendPosition,
    animate: options.animate,
    curve: options.curve,
    yAxisStartsFromZero: options.yAxisStartsFromZero,
    showPoints: options.showPoints,
    tooltipSize: options.tooltipSize || 'sm',
    ...(chartType === 'area' && {
      fillOpacity: 0.3,
      stacked: false,
      showStackedTotal: options.showStackedTotal,
    }),
    ...(chartType === 'scatter' && {
      pointRadius: 5,
      pointOpacity: 0.7,
      showTrendLine: options.showTrendLine,
    }),
    ...((chartType === 'pie' || chartType === 'doughnut') && {
      innerRadius: options.innerRadius || (chartType === 'doughnut' ? 75 : 0),
      showLabels: options.showLabels,
      showValues: options.showValues,
      showPercentages: options.showPercentages,
    }),
    ...(chartType === 'bar' && {
      stacked: options.stacked,
      horizontal: options.horizontal,
      showValues: options.showBarValues,
      barPadding: 0.1,
      groupPadding: 0.2,
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
        convertToChartOptions(appleStockOptions, 'area')
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
        convertToChartOptions(appleMonthlyOptions, 'line')
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
      techStocksChartRef.current = createLineChart('#tech-stocks-chart', techStocksData, {
        ...convertToChartOptions(techStocksOptions, 'line'),
        tooltipContentCallback: (data, xValue) => {
          const totalValue = data.reduce((sum, item) => sum + item.value, 0);
          const leader = data.reduce((prev, current) =>
            prev.value > current.value ? prev : current
          );
          return `
              <div style="text-align: center;">
                <div style="font-weight: 600; color: white; margin-bottom: 4px;">${xValue}</div>
                ${data
                  .map(
                    (item) => `
                  <div style="display: flex; align-items: center; margin-bottom: 1px;">
                    <div style="width: 8px; height: 8px; background: ${item.color}; border-radius: 50%; margin-right: 4px;"></div>
                    <span style="color: #e5e7eb; font-size: 9px; margin-right: 3px;">${item.label}:</span>
                    <span style="font-weight: 600; color: white; font-size: 9px;">$${item.value.toFixed(0)}</span>
                  </div>
                `
                  )
                  .join('')}
                <div style="border-top: 1px solid #374151; margin-top: 3px; padding-top: 2px;">
                  <div style="color: #fbbf24; font-size: 9px;">
                    Portfolio: $${totalValue.toFixed(0)} | Leader: ${leader.label}
                  </div>
                </div>
              </div>
            `;
        },
      });
      techStocksChartRef.current.render();
    }
  }, [techStocksOptions, techStocksData, techStocksTab]);

  // Multi Area Chart
  useEffect(() => {
    if (multiAreaChartRef.current && stackedTab === 'chart') {
      if (multiAreaChartInstanceRef.current) {
        multiAreaChartInstanceRef.current.destroy();
      }
      multiAreaChartInstanceRef.current = createAreaChart('#multi-area-chart', stackedData, {
        ...convertToChartOptions(multiAreaOptions, 'area'),
        stacked: true, // Keep stacked for this specific chart
      });
      multiAreaChartInstanceRef.current.render();
    }
  }, [multiAreaOptions, stackedData, stackedTab]);

  // Height Weight Scatter Chart
  useEffect(() => {
    if (heightWeightRef.current && heightWeightTab === 'chart') {
      if (heightWeightChartRef.current) {
        heightWeightChartRef.current.destroy();
      }
      heightWeightChartRef.current = createScatterChart('#height-weight-chart', heightWeightData, {
        ...convertToChartOptions(heightWeightOptions, 'scatter'),
        tooltipContentCallback: (data) => {
          const bmi = (data.y / ((data.x as number) / 100) ** 2).toFixed(1);
          const bmiCategory =
            parseFloat(bmi) < 18.5
              ? 'Underweight'
              : parseFloat(bmi) < 25
                ? 'Normal'
                : parseFloat(bmi) < 30
                  ? 'Overweight'
                  : 'Obese';
          return `
              <div style="text-align: center;">
                <div style="font-weight: 600; color: white; margin-bottom: 2px;">${data.label}</div>
                <div style="color: #e5e7eb; font-size: 9px; margin-bottom: 1px;">
                  ${data.x}cm, ${data.y}kg
                </div>
                <div style="color: #fbbf24; font-size: 9px;">
                  BMI: ${bmi} (${bmiCategory})
                </div>
              </div>
            `;
        },
      });
      heightWeightChartRef.current.render();
    }
  }, [heightWeightOptions, heightWeightData, heightWeightTab]);

  // Sales Marketing Scatter Chart
  useEffect(() => {
    if (salesMarketingRef.current && salesMarketingTab === 'chart') {
      if (salesMarketingChartRef.current) {
        salesMarketingChartRef.current.destroy();
      }
      salesMarketingChartRef.current = createScatterChart(
        '#sales-marketing-chart',
        salesMarketingData,
        {
          ...convertToChartOptions(salesMarketingOptions, 'scatter'),
          tooltipContentCallback: (data) => {
            const marketingSpend = data.x as number;
            const sales = data.y;
            const roi = (((sales - marketingSpend) / marketingSpend) * 100).toFixed(1);
            const efficiency = (sales / marketingSpend).toFixed(1);
            return `
              <div style="text-align: center;">
                <div style="font-weight: 600; color: white; margin-bottom: 2px;">Marketing Analysis</div>
                <div style="color: #e5e7eb; font-size: 9px; margin-bottom: 1px;">
                  Spend: $${marketingSpend.toFixed(1)}k
                </div>
                <div style="color: #e5e7eb; font-size: 9px; margin-bottom: 1px;">
                  Sales: $${sales.toFixed(1)}k
                </div>
                <div style="color: #10b981; font-size: 9px;">
                  ROI: ${roi}% | Efficiency: ${efficiency}x
                </div>
              </div>
            `;
          },
        }
      );
      salesMarketingChartRef.current.render();
    }
  }, [salesMarketingOptions, salesMarketingData, salesMarketingTab]);

  // Market Share Pie Chart
  useEffect(() => {
    if (marketShareRef.current && marketShareTab === 'chart') {
      if (marketShareChartRef.current) {
        marketShareChartRef.current.destroy();
      }
      marketShareChartRef.current = createPieChart('#market-share-chart', marketShareData, {
        ...convertToChartOptions(marketShareOptions, 'pie'),
        tooltipContentCallback: (data) => {
          return `
              <div style="text-align: center;">
                <div style="font-weight: 600; color: white; margin-bottom: 2px;">${data.label}</div>
                <div style="color: #e5e7eb; font-size: 9px; margin-bottom: 1px;">
                  Market Share: ${data.percentage.toFixed(1)}%
                </div>
                <div style="color: #fbbf24; font-size: 9px;">
                  ${data.value}M devices sold
                </div>
              </div>
            `;
        },
      });
      marketShareChartRef.current.render();
    }
  }, [marketShareOptions, marketShareData, marketShareTab]);

  // Revenue Breakdown Doughnut Chart
  useEffect(() => {
    if (revenueBreakdownRef.current && revenueBreakdownTab === 'chart') {
      if (revenueBreakdownChartRef.current) {
        revenueBreakdownChartRef.current.destroy();
      }
      revenueBreakdownChartRef.current = createDoughnutChart(
        '#revenue-breakdown-chart',
        revenueBreakdownData,
        {
          ...convertToChartOptions(revenueBreakdownOptions, 'doughnut'),
          tooltipContentCallback: (data) => {
            return `
              <div style="text-align: center;">
                <div style="font-weight: 600; color: white; margin-bottom: 2px;">${data.label}</div>
                <div style="color: #e5e7eb; font-size: 9px; margin-bottom: 1px;">
                  Revenue Share: ${data.percentage.toFixed(1)}%
                </div>
                <div style="color: #10b981; font-size: 9px;">
                  $${data.value.toFixed(1)}M quarterly
                </div>
              </div>
            `;
          },
        }
      );
      revenueBreakdownChartRef.current.render();
    }
  }, [revenueBreakdownOptions, revenueBreakdownData, revenueBreakdownTab]);

  // Traffic Sources Doughnut Chart
  useEffect(() => {
    if (trafficSourcesRef.current && trafficSourcesTab === 'chart') {
      if (trafficSourcesChartRef.current) {
        trafficSourcesChartRef.current.destroy();
      }
      trafficSourcesChartRef.current = createDoughnutChart(
        '#traffic-sources-chart',
        trafficSourcesData,
        {
          ...convertToChartOptions(trafficSourcesOptions, 'doughnut'),
          tooltipContentCallback: (data) => {
            return `
              <div style="text-align: center;">
                <div style="font-weight: 600; color: white; margin-bottom: 2px;">${data.label}</div>
                <div style="color: #e5e7eb; font-size: 9px; margin-bottom: 1px;">
                  ${data.percentage.toFixed(1)}% of traffic
                </div>
                <div style="color: #3b82f6; font-size: 9px;">
                  ~${Math.round(data.value * 100)}K visitors/month
                </div>
              </div>
            `;
          },
        }
      );
      trafficSourcesChartRef.current.render();
    }
  }, [trafficSourcesOptions, trafficSourcesData, trafficSourcesTab]);

  // Extended examples useEffect hooks
  
  // Tech Revenue Chart
  useEffect(() => {
    if (techRevenueRef.current) {
      if (techRevenueChartRef.current) {
        techRevenueChartRef.current.destroy();
      }
      techRevenueChartRef.current = createLineChart('#tech-revenue-chart', techRevenueData, {
        height: 400,
        ...techRevenueOptions,
      });
      techRevenueChartRef.current.render();
    }
  }, [techRevenueData, techRevenueOptions]);

  // Global Temperature Chart
  useEffect(() => {
    if (globalTemperatureRef.current) {
      if (globalTemperatureChartRef.current) {
        globalTemperatureChartRef.current.destroy();
      }
      globalTemperatureChartRef.current = createLineChart('#global-temperature-chart', globalTemperatureData, {
        height: 400,
        ...globalTemperatureOptions,
      });
      globalTemperatureChartRef.current.render();
    }
  }, [globalTemperatureData, globalTemperatureOptions]);

  // Website Performance Chart
  useEffect(() => {
    if (websitePerformanceRef.current) {
      if (websitePerformanceChartRef.current) {
        websitePerformanceChartRef.current.destroy();
      }
      websitePerformanceChartRef.current = createAreaChart('#website-performance-chart', websitePerformanceData, {
        height: 400,
        ...websitePerformanceOptions,
      });
      websitePerformanceChartRef.current.render();
    }
  }, [websitePerformanceData, websitePerformanceOptions]);

  // Regional Sales Chart
  useEffect(() => {
    if (regionalSalesRef.current) {
      if (regionalSalesChartRef.current) {
        regionalSalesChartRef.current.destroy();
      }
      regionalSalesChartRef.current = createAreaChart('#regional-sales-chart', regionalSalesData, {
        height: 400,
        ...regionalSalesOptions,
      });
      regionalSalesChartRef.current.render();
    }
  }, [regionalSalesData, regionalSalesOptions]);

  // Customer Satisfaction Chart
  useEffect(() => {
    if (customerSatisfactionRef.current) {
      if (customerSatisfactionChartRef.current) {
        customerSatisfactionChartRef.current.destroy();
      }
      customerSatisfactionChartRef.current = createScatterChart('#customer-satisfaction-chart', customerSatisfactionData, {
        height: 400,
        ...customerSatisfactionOptions,
      });
      customerSatisfactionChartRef.current.render();
    }
  }, [customerSatisfactionData, customerSatisfactionOptions]);

  // Campaign Performance Chart
  useEffect(() => {
    if (campaignPerformanceRef.current) {
      if (campaignPerformanceChartRef.current) {
        campaignPerformanceChartRef.current.destroy();
      }
      campaignPerformanceChartRef.current = createScatterChart('#campaign-performance-chart', campaignPerformanceData, {
        height: 400,
        ...campaignPerformanceOptions,
      });
      campaignPerformanceChartRef.current.render();
    }
  }, [campaignPerformanceData, campaignPerformanceOptions]);

  // Bar chart useEffects
  
  // Quarterly Sales Bar Chart
  useEffect(() => {
    if (quarterlySalesRef.current && quarterlySalesTab === 'chart') {
      if (quarterlySalesChartRef.current) {
        quarterlySalesChartRef.current.destroy();
      }
      quarterlySalesChartRef.current = createBarChart('#quarterly-sales-chart', quarterlySalesData, {
        ...convertToChartOptions(quarterlySalesOptions, 'bar'),
      });
      quarterlySalesChartRef.current.render();
    }
  }, [quarterlySalesData, quarterlySalesOptions, quarterlySalesTab]);

  // Department Revenue Horizontal Bar Chart
  useEffect(() => {
    if (departmentRevenueRef.current && departmentRevenueTab === 'chart') {
      if (departmentRevenueChartRef.current) {
        departmentRevenueChartRef.current.destroy();
      }
      departmentRevenueChartRef.current = createBarChart('#department-revenue-chart', departmentRevenueData, {
        ...convertToChartOptions(departmentRevenueOptions, 'bar'),
      });
      departmentRevenueChartRef.current.render();
    }
  }, [departmentRevenueData, departmentRevenueOptions, departmentRevenueTab]);

  // Browser Usage Grouped Bar Chart
  useEffect(() => {
    if (browserUsageRef.current && browserUsageTab === 'chart') {
      if (browserUsageChartRef.current) {
        browserUsageChartRef.current.destroy();
      }
      browserUsageChartRef.current = createBarChart('#browser-usage-chart', browserUsageData, {
        ...convertToChartOptions(browserUsageOptions, 'bar'),
      });
      browserUsageChartRef.current.render();
    }
  }, [browserUsageData, browserUsageOptions, browserUsageTab]);

  // Office Satisfaction Stacked Bar Chart
  useEffect(() => {
    if (officeSatisfactionRef.current && officeSatisfactionTab === 'chart') {
      if (officeSatisfactionChartRef.current) {
        officeSatisfactionChartRef.current.destroy();
      }
      officeSatisfactionChartRef.current = createBarChart('#office-satisfaction-chart', officeSatisfactionData, {
        ...convertToChartOptions(officeSatisfactionOptions, 'bar'),
      });
      officeSatisfactionChartRef.current.render();
    }
  }, [officeSatisfactionData, officeSatisfactionOptions, officeSatisfactionTab]);

  // Tab component
  const TabButton = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-b-2 border-blue-600 bg-white text-blue-600'
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
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#apple-stock-chart" chartTitle="Apple Stock Price" />
              <ChartOptionsPopover
                options={appleStockOptions}
                onOptionsChange={setAppleStockOptions}
                chartType="area"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton active={appleStockTab === 'chart'} onClick={() => setAppleStockTab('chart')}>
              Chart
            </TabButton>
            <TabButton active={appleStockTab === 'data'} onClick={() => setAppleStockTab('data')}>
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
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#apple-monthly-chart" chartTitle="Apple Monthly Performance" />
              <ChartOptionsPopover
                options={appleMonthlyOptions}
                onOptionsChange={setAppleMonthlyOptions}
                chartType="line"
              />
            </div>
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
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#tech-stocks-chart" chartTitle="Tech Stocks Comparison" />
              <ChartOptionsPopover
                options={techStocksOptions}
                onOptionsChange={setTechStocksOptions}
                chartType="line"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton active={techStocksTab === 'chart'} onClick={() => setTechStocksTab('chart')}>
              Chart
            </TabButton>
            <TabButton active={techStocksTab === 'data'} onClick={() => setTechStocksTab('data')}>
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
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#multi-area-chart" chartTitle="Stacked Tech Portfolio" />
              <ChartOptionsPopover
                options={multiAreaOptions}
                onOptionsChange={setMultiAreaOptions}
                chartType="area"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton active={stackedTab === 'chart'} onClick={() => setStackedTab('chart')}>
              Chart
            </TabButton>
            <TabButton active={stackedTab === 'data'} onClick={() => setStackedTab('data')}>
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

        {/* Height Weight Scatter Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Height vs Weight Analysis</h2>
              <p className="text-sm text-gray-600">
                Scatter plot showing correlation between height and weight by gender
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#height-weight-chart" chartTitle="Height vs Weight Analysis" />
              <ChartOptionsPopover
                options={heightWeightOptions}
                onOptionsChange={setHeightWeightOptions}
                chartType="scatter"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton
              active={heightWeightTab === 'chart'}
              onClick={() => setHeightWeightTab('chart')}
            >
              Chart
            </TabButton>
            <TabButton
              active={heightWeightTab === 'data'}
              onClick={() => setHeightWeightTab('data')}
            >
              Data
            </TabButton>
          </div>

          {/* Content */}
          {heightWeightTab === 'chart' ? (
            <div id="height-weight-chart" ref={heightWeightRef} className="w-full"></div>
          ) : (
            <DataDisplay datasets={heightWeightData} />
          )}
        </div>

        {/* Sales Marketing Scatter Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Sales vs Marketing Spend</h2>
              <p className="text-sm text-gray-600">
                Relationship between marketing investment and sales performance with trend line
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#sales-marketing-chart" chartTitle="Sales vs Marketing Spend" />
              <ChartOptionsPopover
                options={salesMarketingOptions}
                onOptionsChange={setSalesMarketingOptions}
                chartType="scatter"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton
              active={salesMarketingTab === 'chart'}
              onClick={() => setSalesMarketingTab('chart')}
            >
              Chart
            </TabButton>
            <TabButton
              active={salesMarketingTab === 'data'}
              onClick={() => setSalesMarketingTab('data')}
            >
              Data
            </TabButton>
          </div>

          {/* Content */}
          {salesMarketingTab === 'chart' ? (
            <div id="sales-marketing-chart" ref={salesMarketingRef} className="w-full"></div>
          ) : (
            <DataDisplay datasets={salesMarketingData} />
          )}
        </div>

        {/* Market Share Pie Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Smartphone Market Share</h2>
              <p className="text-sm text-gray-600">
                Global smartphone market share by manufacturer (2024)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#market-share-chart" chartTitle="Smartphone Market Share" />
              <ChartOptionsPopover
                options={marketShareOptions}
                onOptionsChange={setMarketShareOptions}
                chartType="pie"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton
              active={marketShareTab === 'chart'}
              onClick={() => setMarketShareTab('chart')}
            >
              Chart
            </TabButton>
            <TabButton active={marketShareTab === 'data'} onClick={() => setMarketShareTab('data')}>
              Data
            </TabButton>
          </div>

          {/* Content */}
          {marketShareTab === 'chart' ? (
            <div id="market-share-chart" ref={marketShareRef} className="w-full"></div>
          ) : (
            <DataDisplay
              datasets={[
                {
                  label: 'Market Share',
                  data: marketShareData.map((d) => ({ x: d.label, y: d.value })),
                },
              ]}
            />
          )}
        </div>

        {/* Revenue Breakdown Doughnut Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Revenue Breakdown</h2>
              <p className="text-sm text-gray-600">
                Quarterly revenue distribution by business segment
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#revenue-breakdown-chart" chartTitle="Revenue Breakdown" />
              <ChartOptionsPopover
                options={revenueBreakdownOptions}
                onOptionsChange={setRevenueBreakdownOptions}
                chartType="doughnut"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton
              active={revenueBreakdownTab === 'chart'}
              onClick={() => setRevenueBreakdownTab('chart')}
            >
              Chart
            </TabButton>
            <TabButton
              active={revenueBreakdownTab === 'data'}
              onClick={() => setRevenueBreakdownTab('data')}
            >
              Data
            </TabButton>
          </div>

          {/* Content */}
          {revenueBreakdownTab === 'chart' ? (
            <div id="revenue-breakdown-chart" ref={revenueBreakdownRef} className="w-full"></div>
          ) : (
            <DataDisplay
              datasets={[
                {
                  label: 'Revenue',
                  data: revenueBreakdownData.map((d) => ({ x: d.label, y: d.value })),
                },
              ]}
            />
          )}
        </div>

        {/* Traffic Sources Doughnut Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Website Traffic Sources</h2>
              <p className="text-sm text-gray-600">
                Monthly website traffic breakdown by source channel
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#traffic-sources-chart" chartTitle="Website Traffic Sources" />
              <ChartOptionsPopover
                options={trafficSourcesOptions}
                onOptionsChange={setTrafficSourcesOptions}
                chartType="doughnut"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton
              active={trafficSourcesTab === 'chart'}
              onClick={() => setTrafficSourcesTab('chart')}
            >
              Chart
            </TabButton>
            <TabButton
              active={trafficSourcesTab === 'data'}
              onClick={() => setTrafficSourcesTab('data')}
            >
              Data
            </TabButton>
          </div>

          {/* Content */}
          {trafficSourcesTab === 'chart' ? (
            <div id="traffic-sources-chart" ref={trafficSourcesRef} className="w-full"></div>
          ) : (
            <DataDisplay
              datasets={[
                {
                  label: 'Traffic Sources',
                  data: trafficSourcesData.map((d) => ({ x: d.label, y: d.value })),
                },
              ]}
            />
          )}
        </div>

        {/* Tech Revenue Comparison - 6 Datasets Line Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Tech Companies Revenue Comparison</h2>
              <p className="text-sm text-gray-600">
                Quarterly revenue comparison across 6 major tech companies (6 datasets)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#tech-revenue-chart" chartTitle="Tech Companies Revenue" />
              <ChartOptionsPopover
                options={techRevenueOptions}
                onOptionsChange={setTechRevenueOptions}
                chartType="line"
              />
            </div>
          </div>
          
          {/* Chart */}
          <div id="tech-revenue-chart" ref={techRevenueRef} className="w-full"></div>
        </div>

        {/* Global Temperature - 8 Datasets Line Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Global Temperature Patterns</h2>
              <p className="text-sm text-gray-600">
                Average monthly temperatures across 8 major cities worldwide (8 datasets)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#global-temperature-chart" chartTitle="Global Temperature Patterns" />
              <ChartOptionsPopover
                options={globalTemperatureOptions}
                onOptionsChange={setGlobalTemperatureOptions}
                chartType="line"
              />
            </div>
          </div>
          
          {/* Chart */}
          <div id="global-temperature-chart" ref={globalTemperatureRef} className="w-full"></div>
        </div>

        {/* Website Performance - 5 Datasets Area Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Website Performance Metrics</h2>
              <p className="text-sm text-gray-600">
                Key performance metrics across different website pages (5 datasets)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#website-performance-chart" chartTitle="Website Performance Metrics" />
              <ChartOptionsPopover
                options={websitePerformanceOptions}
                onOptionsChange={setWebsitePerformanceOptions}
                chartType="area"
              />
            </div>
          </div>
          
          {/* Chart */}
          <div id="website-performance-chart" ref={websitePerformanceRef} className="w-full"></div>
        </div>

        {/* Regional Sales - 6 Datasets Area Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Regional Sales Performance</h2>
              <p className="text-sm text-gray-600">
                Sales performance across 6 global regions with seasonal patterns (6 datasets)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#regional-sales-chart" chartTitle="Regional Sales Performance" />
              <ChartOptionsPopover
                options={regionalSalesOptions}
                onOptionsChange={setRegionalSalesOptions}
                chartType="area"
              />
            </div>
          </div>
          
          {/* Chart */}
          <div id="regional-sales-chart" ref={regionalSalesRef} className="w-full"></div>
        </div>

        {/* Customer Satisfaction - 6 Datasets Scatter Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Customer Satisfaction Analysis</h2>
              <p className="text-sm text-gray-600">
                Response time vs satisfaction score across 6 departments (6 datasets)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#customer-satisfaction-chart" chartTitle="Customer Satisfaction Analysis" />
              <ChartOptionsPopover
                options={customerSatisfactionOptions}
                onOptionsChange={setCustomerSatisfactionOptions}
                chartType="scatter"
              />
            </div>
          </div>
          
          {/* Chart */}
          <div id="customer-satisfaction-chart" ref={customerSatisfactionRef} className="w-full"></div>
        </div>

        {/* Campaign Performance - 7 Datasets Scatter Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Marketing Campaign Performance</h2>
              <p className="text-sm text-gray-600">
                Budget spent vs conversions across 7 different marketing campaigns (7 datasets)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#campaign-performance-chart" chartTitle="Marketing Campaign Performance" />
              <ChartOptionsPopover
                options={campaignPerformanceOptions}
                onOptionsChange={setCampaignPerformanceOptions}
                chartType="scatter"
              />
            </div>
          </div>
          
          {/* Chart */}
          <div id="campaign-performance-chart" ref={campaignPerformanceRef} className="w-full"></div>
        </div>

        {/* Quarterly Sales Bar Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Quarterly Sales Performance</h2>
              <p className="text-sm text-gray-600">
                Product sales comparison across quarters with grouping support
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#quarterly-sales-chart" chartTitle="Quarterly Sales Performance" />
              <ChartOptionsPopover
                options={quarterlySalesOptions}
                onOptionsChange={setQuarterlySalesOptions}
                chartType="bar"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton active={quarterlySalesTab === 'chart'} onClick={() => setQuarterlySalesTab('chart')}>
              Chart
            </TabButton>
            <TabButton active={quarterlySalesTab === 'data'} onClick={() => setQuarterlySalesTab('data')}>
              Data
            </TabButton>
          </div>

          {/* Content */}
          {quarterlySalesTab === 'chart' ? (
            <div id="quarterly-sales-chart" ref={quarterlySalesRef} className="w-full"></div>
          ) : (
            <DataDisplay datasets={quarterlySalesData} />
          )}
        </div>

        {/* Department Revenue Horizontal Bar Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Department Revenue Analysis</h2>
              <p className="text-sm text-gray-600">
                Monthly revenue by department with horizontal bars and value labels
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#department-revenue-chart" chartTitle="Department Revenue Analysis" />
              <ChartOptionsPopover
                options={departmentRevenueOptions}
                onOptionsChange={setDepartmentRevenueOptions}
                chartType="bar"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton active={departmentRevenueTab === 'chart'} onClick={() => setDepartmentRevenueTab('chart')}>
              Chart
            </TabButton>
            <TabButton active={departmentRevenueTab === 'data'} onClick={() => setDepartmentRevenueTab('data')}>
              Data
            </TabButton>
          </div>

          {/* Content */}
          {departmentRevenueTab === 'chart' ? (
            <div id="department-revenue-chart" ref={departmentRevenueRef} className="w-full"></div>
          ) : (
            <DataDisplay datasets={departmentRevenueData} />
          )}
        </div>

        {/* Browser Usage Grouped Bar Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Browser Usage Statistics</h2>
              <p className="text-sm text-gray-600">
                Browser usage across different device types with grouped bars
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#browser-usage-chart" chartTitle="Browser Usage Statistics" />
              <ChartOptionsPopover
                options={browserUsageOptions}
                onOptionsChange={setBrowserUsageOptions}
                chartType="bar"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton active={browserUsageTab === 'chart'} onClick={() => setBrowserUsageTab('chart')}>
              Chart
            </TabButton>
            <TabButton active={browserUsageTab === 'data'} onClick={() => setBrowserUsageTab('data')}>
              Data
            </TabButton>
          </div>

          {/* Content */}
          {browserUsageTab === 'chart' ? (
            <div id="browser-usage-chart" ref={browserUsageRef} className="w-full"></div>
          ) : (
            <DataDisplay datasets={browserUsageData} />
          )}
        </div>

        {/* Office Satisfaction Stacked Bar Chart */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Employee Satisfaction by Office</h2>
              <p className="text-sm text-gray-600">
                Satisfaction scores across office locations with stacked categories
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartExportButton chartId="#office-satisfaction-chart" chartTitle="Employee Satisfaction by Office" />
              <ChartOptionsPopover
                options={officeSatisfactionOptions}
                onOptionsChange={setOfficeSatisfactionOptions}
                chartType="bar"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex border-b">
            <TabButton active={officeSatisfactionTab === 'chart'} onClick={() => setOfficeSatisfactionTab('chart')}>
              Chart
            </TabButton>
            <TabButton active={officeSatisfactionTab === 'data'} onClick={() => setOfficeSatisfactionTab('data')}>
              Data
            </TabButton>
          </div>

          {/* Content */}
          {officeSatisfactionTab === 'chart' ? (
            <div id="office-satisfaction-chart" ref={officeSatisfactionRef} className="w-full"></div>
          ) : (
            <DataDisplay datasets={officeSatisfactionData} />
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
          <div>✅ Scatter plots with correlations</div>
          <div>✅ Trend line analysis</div>
          <div>✅ Pie and doughnut charts</div>
          <div>✅ Bar charts (vertical/horizontal)</div>
          <div>✅ Grouped and stacked bars</div>
          <div>✅ Value labels on bars</div>
          <div>✅ Custom tooltip content</div>
          <div>✅ Animated chart transitions</div>
        </div>
      </div>
    </div>
  );
}
