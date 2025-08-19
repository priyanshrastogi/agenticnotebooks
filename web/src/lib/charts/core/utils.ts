import * as d3 from 'd3';

// ============================================================================
// DATE/TIME DETECTION AND FORMATTING UTILITIES
// ============================================================================

/**
 * Detects if a value is a date/time and returns its type
 */
export const detectDateTimeType = (value: string | number): 'date' | 'time' | 'timestamp' | 'datetime' | null => {
  if (typeof value === 'number') {
    // Check if it's a timestamp (milliseconds or seconds)
    if (value > 1000000000 && value < 10000000000) {
      return 'timestamp'; // Unix timestamp in seconds
    }
    if (value > 1000000000000) {
      return 'timestamp'; // Unix timestamp in milliseconds
    }
    return null;
  }

  const str = value.toString();
  
  // ISO date patterns
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) return 'datetime';
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return 'date';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return 'date';
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return 'date';
  
  // Time patterns
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) return 'time';
  
  // Month year patterns
  if (/^\w{3}\s\d{4}$/.test(str)) return 'date'; // "Jan 2024"
  if (/^\d{4}-\d{2}$/.test(str)) return 'date'; // "2024-01"
  
  return null;
};

/**
 * Converts various date/time formats to Date objects
 */
export const parseDateTime = (value: string | number): Date | null => {
  if (typeof value === 'number') {
    // Handle timestamps
    if (value > 1000000000 && value < 10000000000) {
      return new Date(value * 1000); // Unix timestamp in seconds
    }
    if (value > 1000000000000) {
      return new Date(value); // Unix timestamp in milliseconds
    }
    return null;
  }

  const str = value.toString();
  
  // Try parsing directly first
  const directParse = new Date(str);
  if (!isNaN(directParse.getTime())) {
    return directParse;
  }
  
  // Handle specific formats
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [month, day, year] = str.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [month, day, year] = str.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  return null;
};

/**
 * Formats date/time values for display on axes
 */
export const formatDateTimeForAxis = (value: string | number, type: string): string => {
  const date = parseDateTime(value);
  if (!date) return value.toString();
  
  switch (type) {
    case 'date':
      // For dates, show short month and day
      return d3.timeFormat('%b %d')(date);
    case 'datetime':
      // For datetime with hours, show month/day and hour only
      return d3.timeFormat('%m/%d %Hh')(date);
    case 'time':
      // For time, show formatted time
      return d3.timeFormat('%H:%M')(date);
    case 'timestamp':
      // For timestamps, show date or datetime based on data density
      return d3.timeFormat('%b %d')(date);
    default:
      return value.toString();
  }
};

/**
 * Analyzes a dataset to determine if X values are date/time and their type
 */
export const analyzeXAxisType = (data: { x: string | number }[]): { isDateTime: boolean; type: string | null; formatter: ((value: string | number) => string) | null } => {
  if (data.length === 0) return { isDateTime: false, type: null, formatter: null };
  
  // Sample first few values to determine type
  const sampleSize = Math.min(5, data.length);
  const samples = data.slice(0, sampleSize);
  
  let detectedType: string | null = null;
  let consistentType = true;
  
  for (const item of samples) {
    const xValue = item.x;
    const currentType = detectDateTimeType(xValue);
    
    if (currentType === null) {
      return { isDateTime: false, type: null, formatter: null };
    }
    
    if (detectedType === null) {
      detectedType = currentType;
    } else if (detectedType !== currentType) {
      consistentType = false;
      break;
    }
  }
  
  if (!consistentType || !detectedType) {
    return { isDateTime: false, type: null, formatter: null };
  }
  
  return {
    isDateTime: true,
    type: detectedType,
    formatter: (value: string | number) => formatDateTimeForAxis(value, detectedType!)
  };
};

export const formatNumber = (num: number): string => {
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

// Helper function to truncate text to fit within specified width
const truncateText = (textElement: d3.Selection<SVGTextElement, unknown, null, undefined>, maxWidth: number, originalText: string) => {
  const textNode = textElement.node()!;
  if (textNode.getBBox().width <= maxWidth) return;
  
  let text = originalText;
  while (textNode.getBBox().width > maxWidth && text.length > 3) {
    text = text.slice(0, -1);
    textElement.text(text + '...');
  }
};

// Helper function to calculate required legend space
export const calculateLegendSpace = (
  datasets: { label: string; color: string }[],
  width: number,
  margin: { top: number; right: number; bottom: number; left: number },
  position: 'bottom' | 'top' | 'left' | 'right' = 'bottom'
): { width: number; height: number } => {
  if (datasets.length === 0) return { width: 0, height: 0 };

  const itemHeight = 20;
  const itemSpacing = 15;
  const circleRadius = 4;
  const circleTextGap = 8;

  if (position === 'bottom' || position === 'top') {
    // Horizontal layout
    const availableWidth = width - margin.left - margin.right;
    
    // Create a temporary DOM element to measure text width
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    tempDiv.style.fontSize = '12px';
    document.body.appendChild(tempDiv);
    
    // Calculate actual widths for each label
    const maxItemWidth = Math.max(120, availableWidth * 0.4);
    const itemWidths = datasets.map(d => {
      tempDiv.textContent = d.label;
      const textWidth = tempDiv.offsetWidth;
      const totalItemWidth = textWidth + circleRadius * 2 + circleTextGap + 5;
      return Math.min(totalItemWidth, maxItemWidth);
    });
    
    document.body.removeChild(tempDiv);
    
    // Calculate total width and determine rows needed
    const totalWidth = itemWidths.reduce((sum, w) => sum + w, 0) + (datasets.length - 1) * itemSpacing;
    
    if (totalWidth <= availableWidth) {
      // Single row
      return { width: totalWidth, height: itemHeight + 10 }; // 10px padding
    } else {
      // Multi-row - calculate number of rows needed
      let currentX = 0;
      let rows = 1;
      
      itemWidths.forEach((itemWidth) => {
        if (currentX + itemWidth > availableWidth && currentX > 0) {
          currentX = 0;
          rows++;
        }
        currentX += itemWidth + itemSpacing;
      });
      
      return { width: availableWidth, height: rows * (itemHeight + 5) + 5 }; // 5px additional padding
    }
  } else {
    // Vertical layout (left/right)
    const maxWidth = Math.max(...datasets.map(d => d.label.length * 7)); // Rough estimate
    const totalHeight = datasets.length * (itemHeight + 5);
    return { width: maxWidth + circleRadius * 2 + circleTextGap + 20, height: totalHeight };
  }
};

export const createTooltip = (container: string, size: 'sm' | 'md' = 'sm') => {
  // Remove existing tooltip
  d3.select(`${container}-tooltip`).remove();

  const isSm = size === 'sm';

  return d3
    .select('body')
    .append('div')
    .attr('id', `${container.replace('#', '')}-tooltip`)
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.9)')
    .style('color', 'white')
    .style('padding', isSm ? '2px 4px' : '4px 6px')
    .style('border-radius', isSm ? '3px' : '4px')
    .style('font-size', isSm ? '10px' : '12px')
    .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('box-shadow', isSm ? '0 1px 3px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.1)')
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

export const createCrosshairTooltip = (container: string, size: 'sm' | 'md' = 'sm') => {
  // Remove existing crosshair tooltip
  d3.select(`${container}-crosshair-tooltip`).remove();

  const isSm = size === 'sm';

  return d3
    .select('body')
    .append('div')
    .attr('id', `${container.replace('#', '')}-crosshair-tooltip`)
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.9)')
    .style('color', 'white')
    .style('padding', isSm ? '4px 6px' : '6px 8px')
    .style('border-radius', isSm ? '4px' : '6px')
    .style('font-size', isSm ? '10px' : '12px')
    .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('box-shadow', isSm ? '0 1px 4px rgba(0, 0, 0, 0.15)' : '0 2px 6px rgba(0, 0, 0, 0.15)')
    .style('z-index', '1001')
    .style('min-width', isSm ? '80px' : '100px')
    .style('max-width', isSm ? '200px' : '250px');
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
  margin: { top: number; right: number; bottom: number; left: number },
  showXGrid: boolean = true,
  showYGrid: boolean = true
) => {
  const gridGroup = svg.append('g').attr('class', 'grid-lines');

  // Horizontal grid lines (Y-axis grid) - only draw within chart area
  if (showYGrid) {
    const yDomain = yScale.domain();
    const { ticks: yTicks } = calculateNiceScale(yDomain[0], yDomain[1]);
    
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
  }

  // Vertical grid lines (X-axis grid)
  if (showXGrid) {
    const chartWidth = width - margin.left - margin.right;
    const optimalTicks = Math.min(12, Math.floor(chartWidth / 50));
    
    if ('bandwidth' in xScale) {
      // For ordinal scales (string categories)
      const fullDomain = (xScale as d3.ScalePoint<string>).domain();
      const totalItems = fullDomain.length;
      
      // Filter ticks if there are too many
      let xTicks: string[];
      if (totalItems > optimalTicks) {
        const step = Math.ceil(totalItems / optimalTicks);
        xTicks = fullDomain.filter((_, i) => i % step === 0);
        // Ensure last item is included
        if (xTicks[xTicks.length - 1] !== fullDomain[fullDomain.length - 1]) {
          xTicks.push(fullDomain[fullDomain.length - 1]);
        }
      } else {
        xTicks = fullDomain;
      }
      
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
      const xTicks = (xScale as d3.ScaleLinear<number, number>).ticks(optimalTicks);
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

  const itemHeight = 20;
  const itemSpacing = 15;
  const circleRadius = 4;
  const circleTextGap = 8;

  if (position === 'bottom' || position === 'top') {
    // Horizontal layout - calculate dynamic Y position based on legend requirements
    let y: number;
    if (position === 'bottom') {
      y = height - 15;
    } else {
      // For top position, calculate space needed and position accordingly
      const availableWidth = width - margin.left - margin.right;
      const maxItemWidth = Math.max(120, availableWidth * 0.4);
      
      // Quick calculation of rows needed for proper positioning
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      tempDiv.style.fontSize = '12px';
      document.body.appendChild(tempDiv);
      
      const itemWidths = datasets.map(d => {
        tempDiv.textContent = d.label;
        const textWidth = tempDiv.offsetWidth;
        const totalItemWidth = textWidth + circleRadius * 2 + circleTextGap + 5;
        return Math.min(totalItemWidth, maxItemWidth);
      });
      
      document.body.removeChild(tempDiv);
      
      const totalWidth = itemWidths.reduce((sum, w) => sum + w, 0) + (datasets.length - 1) * itemSpacing;
      
      let rows = 1;
      if (totalWidth > availableWidth) {
        let currentX = 0;
        itemWidths.forEach((itemWidth) => {
          if (currentX + itemWidth > availableWidth && currentX > 0) {
            currentX = 0;
            rows++;
          }
          currentX += itemWidth + itemSpacing;
        });
      }
      
      // Position top legends to give proper spacing - start from allocated margin space
      const legendHeight = rows * (itemHeight + 5);
      y = margin.top - legendHeight - 10; // 10px buffer from chart
    }
    
    // Create a temporary text element to measure text width
    const tempText = svg.append('text')
      .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
      .style('font-size', '12px')
      .style('visibility', 'hidden');
    
    // Calculate available width first
    const availableWidth = width - margin.left - margin.right;
    
    // Calculate actual widths for each label, with truncation for very wide labels
    const maxItemWidth = Math.max(120, availableWidth * 0.4); // At most 40% of available width per item
    const itemWidths = datasets.map(d => {
      tempText.text(d.label);
      const bbox = (tempText.node() as SVGTextElement).getBBox();
      const textWidth = Math.ceil(bbox.width);
      const totalItemWidth = textWidth + circleRadius * 2 + circleTextGap + 5;
      return Math.min(totalItemWidth, maxItemWidth);
    });
    
    tempText.remove();
    
    // Calculate total width and determine if we need to wrap
    const totalWidth = itemWidths.reduce((sum, w) => sum + w, 0) + (datasets.length - 1) * itemSpacing;
    
    // If total width exceeds available width, use multi-row layout
    if (totalWidth > availableWidth) {
      // Calculate rows with proper bounds checking
      let currentX = 0;
      let currentRow = 0;
      const positions: { x: number; y: number }[] = [];
      
      datasets.forEach((d, i) => {
        // Check if this item would overflow, accounting for margins
        if (currentX + itemWidths[i] > availableWidth && currentX > 0) {
          currentX = 0;
          currentRow++;
        }
        
        // Ensure the item doesn't exceed the right boundary
        const finalX = Math.min(
          margin.left + currentX, 
          width - margin.right - itemWidths[i]
        );
        
        // For top legends, additional rows go down (+Y), for bottom legends they go up (-Y)
        const rowY = position === 'top' 
          ? y + (currentRow * (itemHeight + 5))
          : y - (currentRow * (itemHeight + 5));
        
        positions.push({ 
          x: finalX, 
          y: rowY 
        });
        currentX += itemWidths[i] + itemSpacing;
      });
      
      // Create legend items with calculated positions
      legendGroup
        .selectAll('.legend-item')
        .data(datasets)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(${positions[i].x}, ${positions[i].y})`)
        .each(function (d) {
          const item = d3.select(this);
          
          // Color indicator (circle)
          item
            .append('circle')
            .attr('cx', circleRadius)
            .attr('cy', -4)
            .attr('r', circleRadius)
            .attr('fill', d.color);

          // Label text with truncation
          const labelText = item
            .append('text')
            .attr('x', circleRadius * 2 + circleTextGap)
            .attr('y', 0)
            .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
            .attr('font-size', '12px')
            .attr('fill', '#666')
            .text(d.label);
          
          // Truncate text if needed
          const maxTextWidth = itemWidths[datasets.indexOf(d)] - circleRadius * 2 - circleTextGap - 5;
          truncateText(labelText, maxTextWidth, d.label);
        });
    } else {
      // Single row, centered but ensure it doesn't go outside SVG bounds
      const startX = Math.max(margin.left, (width - totalWidth) / 2);
      let currentX = startX;
      
      legendGroup
        .selectAll('.legend-item')
        .data(datasets)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => {
          const x = Math.min(currentX, width - margin.right - itemWidths[i]);
          currentX += itemWidths[i] + itemSpacing;
          return `translate(${x}, ${y})`;
        })
        .each(function (d) {
          const item = d3.select(this);
          
          // Color indicator (circle)
          item
            .append('circle')
            .attr('cx', circleRadius)
            .attr('cy', -4)
            .attr('r', circleRadius)
            .attr('fill', d.color);

          // Label text with truncation
          const labelText = item
            .append('text')
            .attr('x', circleRadius * 2 + circleTextGap)
            .attr('y', 0)
            .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
            .attr('font-size', '12px')
            .attr('fill', '#666')
            .text(d.label);
          
          // Truncate text if needed
          const maxTextWidth = itemWidths[datasets.indexOf(d)] - circleRadius * 2 - circleTextGap - 5;
          truncateText(labelText, maxTextWidth, d.label);
        });
    }
  } else {
    // Vertical layout (left/right)
    const startY = margin.top + 20;
    
    // Create a temporary text element to measure max text width
    const tempText = svg.append('text')
      .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
      .style('font-size', '12px')
      .style('visibility', 'hidden');
    
    // Find the maximum width needed
    let maxWidth = 0;
    datasets.forEach(d => {
      tempText.text(d.label);
      const bbox = (tempText.node() as SVGTextElement).getBBox();
      maxWidth = Math.max(maxWidth, Math.ceil(bbox.width));
    });
    
    tempText.remove();
    
    // Calculate x position based on side and max width, ensuring it stays within bounds
    const totalLegendWidth = maxWidth + circleRadius * 2 + circleTextGap + 10; // Add padding
    const x = position === 'right' 
      ? Math.max(margin.left, width - totalLegendWidth - 10)
      : Math.min(10, width - totalLegendWidth - margin.right);

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
          .attr('cx', circleRadius)
          .attr('cy', -4)
          .attr('r', circleRadius)
          .attr('fill', d.color);

        // Label text with truncation
        const labelText = item
          .append('text')
          .attr('x', circleRadius * 2 + circleTextGap)
          .attr('y', 0)
          .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
          .attr('font-size', '12px')
          .attr('fill', '#666')
          .text(d.label);
          
        // Truncate text if needed for vertical layout
        const maxTextWidth = Math.max(maxWidth, 50); // Use calculated max width
        truncateText(labelText, maxTextWidth, d.label);
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
  data: { x: string | number }[] = [],
  showXAxis: boolean = true,
  showYAxis: boolean = true,
) => {
  const chartBottom = height - margin.bottom;
  const chartLeft = margin.left;
  const chartWidth = width - margin.left - margin.right;

  // Calculate optimal number of ticks based on available width
  const calculateOptimalTicks = (availableWidth: number, isMobile: boolean = false): number => {
    if (isMobile) return Math.min(5, Math.floor(availableWidth / 60));
    return Math.min(12, Math.floor(availableWidth / 50)); // Aim for ~50px per label
  };

  // Smart tick filtering for ordinal scales
  const filterOrdinalTicks = (domain: string[], maxTicks: number): string[] => {
    const totalItems = domain.length;
    if (totalItems <= maxTicks) return domain;

    const step = Math.ceil(totalItems / maxTicks);
    const filtered: string[] = [];
    
    // Always include first and last
    for (let i = 0; i < totalItems; i += step) {
      filtered.push(domain[i]);
    }
    
    // Ensure last item is included
    if (filtered[filtered.length - 1] !== domain[domain.length - 1]) {
      filtered.push(domain[domain.length - 1]);
    }
    
    return filtered;
  };

  // Format time labels for better readability
  const formatTimeLabel = (label: string): string => {
    // Check if it's a time format (HH:MM)
    if (/^\d{2}:\d{2}$/.test(label)) {
      const [hour, minute] = label.split(':');
      const h = parseInt(hour);
      // Show only major hours
      if (minute === '00') {
        if (h === 0) return '12am';
        if (h === 12) return '12pm';
        if (h < 12) return `${h}am`;
        return `${h - 12}pm`;
      }
      return ''; // Hide non-hour marks
    }
    return label;
  };

  // X-axis - positioned at y=0 (bottom of chart area)
  if (showXAxis) {
    let xAxis: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
    const isMobile = chartWidth < 400;
    const optimalTicks = calculateOptimalTicks(chartWidth, isMobile);

    // Analyze data to detect date/time patterns
    const dateAnalysis = analyzeXAxisType(data);

    if (dateAnalysis.isDateTime && dateAnalysis.formatter) {
      // For detected date/time data, create appropriate time scale
      if ('bandwidth' in xScale) {
        // Point scale with date formatting
        const pointScale = xScale as d3.ScalePoint<string>;
        const fullDomain = pointScale.domain();
        const filteredDomain = filterOrdinalTicks(fullDomain, optimalTicks);
        
        const xAxisGenerator = d3
          .axisBottom(pointScale)
          .tickSize(5)
          .tickPadding(8)
          .tickValues(filteredDomain)
          .tickFormat((d) => dateAnalysis.formatter!(d as string | number));
          
        xAxis = svg
          .append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${chartBottom})`)
          .call(xAxisGenerator);
      } else if ('ticks' in xScale && typeof (xScale as d3.ScaleTime<number, number>).ticks === 'function') {
        // Time scale
        const timeScale = xScale as d3.ScaleTime<number, number>;
        const xAxisGenerator = d3
          .axisBottom(timeScale)
          .tickSize(5)
          .tickPadding(8)
          .ticks(optimalTicks);
          
        xAxis = svg
          .append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${chartBottom})`)
          .call(xAxisGenerator);
      } else {
        // Linear scale - likely timestamps
        const linearScale = xScale as d3.ScaleLinear<number, number>;
        const xAxisGenerator = d3
          .axisBottom(linearScale)
          .tickSize(5)
          .tickPadding(8)
          .ticks(optimalTicks)
          .tickFormat((d) => dateAnalysis.formatter!(d as string | number));
          
        xAxis = svg
          .append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${chartBottom})`)
          .call(xAxisGenerator);
      }
    } else {
      // Handle linear and point scales separately
      if ('bandwidth' in xScale) {
        // Point scale (ordinal)
        const pointScale = xScale as d3.ScalePoint<string>;
        const fullDomain = pointScale.domain();
        const filteredDomain = filterOrdinalTicks(fullDomain, optimalTicks);
        
        const xAxisGenerator = d3
          .axisBottom(pointScale)
          .tickSize(5)
          .tickPadding(8)
          .tickValues(filteredDomain)
          .tickFormat(d => formatTimeLabel(d));
          
        xAxis = svg
          .append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${chartBottom})`)
          .call(xAxisGenerator);
      } else {
        // Linear scale
        const linearScale = xScale as d3.ScaleLinear<number, number>;
        const xAxisGenerator = d3
          .axisBottom(linearScale)
          .tickSize(5)
          .tickPadding(8)
          .ticks(optimalTicks);
          
        xAxis = svg
          .append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${chartBottom})`)
          .call(xAxisGenerator);
      }
    }

    // Style X-axis
    xAxis.select('.domain').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
    xAxis.selectAll('.tick line').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
    
    // Remove empty labels
    xAxis.selectAll('.tick text').filter((d, i, nodes) => {
      const text = d3.select(nodes[i]).text();
      return text === '';
    }).remove();
  }

  // Y-axis - positioned at x=0 (left of chart area)
  if (showYAxis) {
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
  }

  // Style axis text
  svg
    .selectAll('.x-axis text, .y-axis text')
    .attr('fill', '#666')
    .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
    .attr('font-size', '12px');
};
