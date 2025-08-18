import * as d3 from 'd3';

export const formatNumber = (num: number): string => {
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

export const createTooltip = (container: string) => {
  // Remove existing tooltip
  d3.select(`${container}-tooltip`).remove();

  return d3
    .select('body')
    .append('div')
    .attr('id', `${container.replace('#', '')}-tooltip`)
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.9)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '6px')
    .style('font-size', '12px')
    .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)')
    .style('z-index', '1000');
};

export const showTooltip = (
  tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown>,
  content: string,
  event: MouseEvent
) => {
  tooltip
    .style('opacity', 1)
    .html(content)
    .style('left', event.pageX + 10 + 'px')
    .style('top', event.pageY - 10 + 'px');
};

export const hideTooltip = (
  tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown>
) => {
  tooltip.style('opacity', 0);
};

export const createCrosshairTooltip = (container: string) => {
  // Remove existing crosshair tooltip
  d3.select(`${container}-crosshair-tooltip`).remove();

  return d3
    .select('body')
    .append('div')
    .attr('id', `${container.replace('#', '')}-crosshair-tooltip`)
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.9)')
    .style('color', 'white')
    .style('padding', '12px 16px')
    .style('border-radius', '8px')
    .style('font-size', '13px')
    .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.15)')
    .style('z-index', '1001')
    .style('min-width', '120px')
    .style('max-width', '300px');
};

export const showCrosshairTooltip = (
  tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown>,
  content: string,
  x: number,
  y: number
) => {
  tooltip
    .style('opacity', 1)
    .html(content)
    .style('left', x + 15 + 'px')
    .style('top', y - 10 + 'px');
};

// Function to calculate nice tick values and domain
export const calculateNiceScale = (dataMin: number, dataMax: number, tickCount: number = 6) => {
  const range = dataMax - dataMin;

  if (range === 0) {
    return {
      niceMin: dataMin === 0 ? 0 : Math.floor(dataMin),
      niceMax: dataMax === 0 ? 10 : Math.ceil(dataMax),
      step: 1,
      ticks: dataMin === 0 ? [0, 1, 2, 3, 4, 5] : [Math.floor(dataMin), Math.ceil(dataMax)],
    };
  }

  // Calculate rough step
  const rawStep = range / (tickCount - 1);

  // Calculate nice step
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalizedStep = rawStep / magnitude;

  let niceStep: number;
  if (normalizedStep <= 1) niceStep = 1;
  else if (normalizedStep <= 2) niceStep = 2;
  else if (normalizedStep <= 5) niceStep = 5;
  else niceStep = 10;

  const step = niceStep * magnitude;

  // Calculate nice min and max
  const niceMin = Math.floor(dataMin / step) * step;
  const niceMax = Math.ceil(dataMax / step) * step;

  // Generate ticks
  const ticks = [];
  for (let i = niceMin; i <= niceMax; i += step) {
    // Handle floating point precision
    ticks.push(Math.round(i / step) * step);
  }

  return { niceMin, niceMax, step, ticks };
};

export const addGridLines = (
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>,
  xScale: d3.ScaleLinear<number, number> | d3.ScalePoint<string> | d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  width: number,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number }
) => {
  const gridGroup = svg.append('g').attr('class', 'grid-lines');

  // Get nice ticks for the current y domain
  const yDomain = yScale.domain();
  const { ticks: yTicks } = calculateNiceScale(yDomain[0], yDomain[1]);

  // Horizontal grid lines - only draw within chart area
  const chartTop = margin.top;
  const chartBottom = height - margin.bottom;
  
  gridGroup
    .selectAll('.grid-line-horizontal')
    .data(yTicks)
    .enter()
    .append('line')
    .attr('class', 'grid-line-horizontal')
    .attr('x1', margin.left)
    .attr('x2', width - margin.right)
    .attr('y1', (d) => {
      const y = yScale(d);
      return y >= chartTop && y <= chartBottom ? y : null;
    })
    .attr('y2', (d) => {
      const y = yScale(d);
      return y >= chartTop && y <= chartBottom ? y : null;
    })
    .attr('stroke', 'rgba(0, 0, 0, 0.1)')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '4,4')
    .style('display', (d) => {
      const y = yScale(d);
      return y >= chartTop && y <= chartBottom ? 'block' : 'none';
    });

  // Vertical grid lines
  if ('bandwidth' in xScale) {
    // For ordinal scales (string categories)
    const xTicks = (xScale as d3.ScalePoint<string>).domain();
    gridGroup
      .selectAll('.grid-line-vertical')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line-vertical')
      .attr('x1', (d) => (xScale as d3.ScalePoint<string>)(d)!)
      .attr('x2', (d) => (xScale as d3.ScalePoint<string>)(d)!)
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'rgba(0, 0, 0, 0.1)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');
  } else {
    // For linear scales
    const xTicks = (xScale as d3.ScaleLinear<number, number>).ticks(8);
    gridGroup
      .selectAll('.grid-line-vertical')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line-vertical')
      .attr('x1', (d) => (xScale as d3.ScaleLinear<number, number>)(d))
      .attr('x2', (d) => (xScale as d3.ScaleLinear<number, number>)(d))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'rgba(0, 0, 0, 0.1)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');
  }
};

export const addLegend = (
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>,
  datasets: { label: string; color: string }[],
  width: number,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number },
  position: 'bottom' | 'top' | 'left' | 'right' = 'bottom'
) => {
  // Remove existing legend
  svg.selectAll('.legend').remove();

  if (datasets.length === 0) return;

  const legendGroup = svg.append('g').attr('class', 'legend');

  const itemWidth = 120;
  const itemHeight = 20;
  const itemSpacing = 10;

  if (position === 'bottom' || position === 'top') {
    // Horizontal layout
    const totalWidth = datasets.length * itemWidth + (datasets.length - 1) * itemSpacing;
    const startX = (width - totalWidth) / 2;
    const y = position === 'bottom' ? height - 15 : margin.top - 30;

    legendGroup
      .selectAll('.legend-item')
      .data(datasets)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(${startX + i * (itemWidth + itemSpacing)}, ${y})`)
      .each(function (d) {
        const item = d3.select(this);
        
        // Color indicator (circle)
        item
          .append('circle')
          .attr('cx', 6)
          .attr('cy', -4)
          .attr('r', 4)
          .attr('fill', d.color);

        // Label text
        item
          .append('text')
          .attr('x', 16)
          .attr('y', 0)
          .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
          .attr('font-size', '12px')
          .attr('fill', '#666')
          .text(d.label);
      });
  } else {
    // Vertical layout (left/right)
    const x = position === 'right' ? width - 100 : 10;
    const startY = margin.top + 20;

    legendGroup
      .selectAll('.legend-item')
      .data(datasets)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(${x}, ${startY + i * (itemHeight + 5)})`)
      .each(function (d) {
        const item = d3.select(this);
        
        // Color indicator (circle)
        item
          .append('circle')
          .attr('cx', 6)
          .attr('cy', -4)
          .attr('r', 4)
          .attr('fill', d.color);

        // Label text
        item
          .append('text')
          .attr('x', 16)
          .attr('y', 0)
          .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
          .attr('font-size', '12px')
          .attr('fill', '#666')
          .text(d.label);
      });
  }
};

export const addAxes = (
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>,
  xScale: d3.ScaleLinear<number, number> | d3.ScalePoint<string> | d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  width: number,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number },
  isDateScale: boolean = false
) => {
  const chartBottom = height - margin.bottom;
  const chartLeft = margin.left;

  // X-axis - positioned at y=0 (bottom of chart area)
  let xAxis: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;

  if (isDateScale) {
    // For date scales, use time-based ticks
    const timeScale = xScale as d3.ScaleTime<number, number>;
    const xAxisGenerator = d3
      .axisBottom(timeScale)
      .tickSize(5)
      .tickPadding(8)
      .tickFormat((d) => d3.timeFormat('%b %Y')(d as Date))
      .ticks(6); // Show about 6 month intervals

    xAxis = svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartBottom})`)
      .call(xAxisGenerator);
  } else {
    // Handle linear and point scales separately
    if ('bandwidth' in xScale) {
      // Point scale (ordinal)
      const pointScale = xScale as d3.ScalePoint<string>;
      const xAxisGenerator = d3.axisBottom(pointScale).tickSize(5).tickPadding(8);
      xAxis = svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${chartBottom})`)
        .call(xAxisGenerator);
    } else {
      // Linear scale
      const linearScale = xScale as d3.ScaleLinear<number, number>;
      const xAxisGenerator = d3.axisBottom(linearScale).tickSize(5).tickPadding(8);
      xAxis = svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${chartBottom})`)
        .call(xAxisGenerator);
    }
  }

  // xAxis is already created above

  // Style X-axis
  xAxis.select('.domain').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);

  xAxis.selectAll('.tick line').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);

  // Y-axis - positioned at x=0 (left of chart area)
  const yDomain = yScale.domain();
  const { ticks: tickValues } = calculateNiceScale(yDomain[0], yDomain[1]);

  const yAxis = svg
    .append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${chartLeft},0)`)
    .call(
      d3
        .axisLeft(yScale)
        .tickValues(tickValues)
        .tickSize(5)
        .tickPadding(8)
        .tickFormat((d) => formatNumber(d as number))
    );

  // Style Y-axis
  yAxis.select('.domain').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);

  yAxis.selectAll('.tick line').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);

  // Style axis text
  svg
    .selectAll('.x-axis text, .y-axis text')
    .attr('fill', '#666')
    .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
    .attr('font-size', '12px');
};
