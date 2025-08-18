import { format } from 'date-fns';
import * as XLSX from 'xlsx';

import {
  Column,
  ColumnStats,
  DateColumnStats,
  FileMetadata,
  NumberColumnStats,
  SheetMetadata,
  StringColumnStats,
} from './types';

/**
 * Factory function to get the appropriate metadata extractor based on file type
 * @param file The file to analyze
 * @returns The appropriate extractor function
 */
function getMetadataExtractor(file: File): (file: File) => Promise<FileMetadata> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'csv':
      return extractCSVMetadata;
    case 'xlsx':
    case 'xls':
      return extractExcelMetadata;
    default:
      // Default to Excel extractor if type can't be determined
      return extractExcelMetadata;
  }
}

/**
 * Extracts metadata from a file using the appropriate extractor
 * @param file File object to analyze
 * @returns Promise resolving to FileMetadata
 */
export async function extractFileMetadata(file: File): Promise<FileMetadata> {
  const extractor = getMetadataExtractor(file);
  return extractor(file);
}

/**
 * Extracts metadata from Excel files
 * @param file Excel file to analyze
 * @returns Promise resolving to FileMetadata
 */
async function extractExcelMetadata(file: File): Promise<FileMetadata> {
  try {
    // Convert File to ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Parse the file with XLSX
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Determine file type from extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const fileType = fileExtension === 'xls' ? 'xls' : 'xlsx';

    // Initialize the FileMetadata
    const fileMetadata: FileMetadata = {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      sheetsNumber: workbook.SheetNames.length,
      sheets: {},
    };

    // Process each sheet in the workbook
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      fileMetadata.sheets[sheetName] = processSheet(worksheet);
    }

    return fileMetadata;
  } catch (error) {
    console.error('Error extracting Excel metadata:', error);
    throw new Error(
      `Failed to extract metadata from Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extracts metadata from CSV files
 * @param file CSV file to analyze
 * @returns Promise resolving to FileMetadata
 */
async function extractCSVMetadata(file: File): Promise<FileMetadata> {
  try {
    // Convert File to ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Parse the file with XLSX (which can handle CSV too)
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Initialize the FileMetadata
    const fileMetadata: FileMetadata = {
      fileName: file.name,
      fileType: 'csv',
      fileSize: file.size,
      sheetsNumber: 1,
      sheets: {},
    };

    // For CSV there's only one sheet with the default name
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    fileMetadata.sheets[sheetName] = processSheet(worksheet);

    return fileMetadata;
  } catch (error) {
    console.error('Error extracting CSV metadata:', error);
    throw new Error(
      `Failed to extract metadata from CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Process a worksheet to extract sheet metadata
 * @param worksheet XLSX worksheet
 * @returns SheetMetadata object
 */
function processSheet(worksheet: XLSX.WorkSheet): SheetMetadata {
  // Convert sheet to JSON with headers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    header: 1,
    defval: null,
    blankrows: true,
    raw: false,
  });

  // Skip empty sheets
  if (!data || data.length === 0) {
    return {
      columns: [],
      rowCount: 0,
      emptyColumnNameCount: 0,
    };
  }

  // Extract headers from first row
  const headers = data[0] as unknown[];
  const dataRows = data.slice(1) as unknown[][];

  let emptyColumnNameCount = 0;
  const columns: Column[] = [];

  // Process each column
  for (let colIndex = 0; colIndex < headers.length; colIndex++) {
    let columnName = headers[colIndex] as string;

    // Handle empty column names
    if (columnName === null || columnName === undefined || columnName === '') {
      columnName = `Column ${colIndex + 1}`;
      emptyColumnNameCount++;
    }

    // Extract column values
    const columnValues = dataRows.map((row) => row[colIndex]);

    // Detect data type and compute stats
    const { dataType, stats } = analyzeColumn(columnValues);

    // Create column metadata
    columns.push({
      name: columnName.toString(),
      index: colIndex,
      dataType,
      stats,
    });
  }

  return {
    columns,
    rowCount: data.length - 1, // Exclude header row
    emptyColumnNameCount,
  };
}

/**
 * Analyzes a column to determine its data type and statistics
 * @param values Array of column values
 * @returns Object with dataType and appropriate stats
 */
function analyzeColumn(values: unknown[]): {
  dataType: 'string' | 'number' | 'datestring';
  stats: ColumnStats;
} {
  // Filter out null/undefined values
  const nonNullValues = values.filter((v) => v !== null && v !== undefined);
  const nullCount = values.length - nonNullValues.length;

  // Count unique values (stringify for objects)
  const uniqueValues = new Set(
    nonNullValues.map((v) => (typeof v === 'object' ? JSON.stringify(v) : v))
  );

  // Detect data type
  const dataType = detectDataType(nonNullValues);

  // Base stats that apply to all types
  const baseStats: ColumnStats = {
    count: values.length,
    nullCount,
    uniqueCount: uniqueValues.size,
  };

  // Calculate type-specific stats
  switch (dataType) {
    case 'number':
      return {
        dataType,
        stats: calculateNumberStats(nonNullValues, baseStats),
      };

    case 'datestring':
      return {
        dataType,
        stats: calculateDateStats(nonNullValues, baseStats),
      };

    case 'string':
    default:
      return {
        dataType: 'string',
        stats: calculateStringStats(nonNullValues, baseStats),
      };
  }
}

/**
 * Detects the most likely data type for a column
 * @param values Non-null values from the column
 * @returns Detected data type
 */
function detectDataType(values: unknown[]): 'string' | 'number' | 'datestring' {
  // Return string for empty columns
  if (values.length === 0) {
    return 'string';
  }

  const sampleSize = Math.min(values.length, 100);

  // Get sample either directly or through reservoir sampling
  const sample =
    values.length <= 100
      ? Array.from(new Set(values))
      : (() => {
          // Use reservoir sampling for large arrays
          const reservoir: unknown[] = [];
          // Fill reservoir with first k elements
          for (let i = 0; i < sampleSize; i++) {
            reservoir.push(values[i]);
          }
          // Replace elements with gradually decreasing probability
          for (let i = sampleSize; i < values.length; i++) {
            const j = Math.floor(Math.random() * (i + 1));
            if (j < sampleSize) {
              reservoir[j] = values[i];
            }
          }
          return Array.from(new Set(reservoir));
        })();

  // Count occurrences of each type in the sample
  let numberCount = 0;
  let datestringCount = 0;

  for (const value of sample) {
    const datestringResult = isDate(value);
    if (datestringResult && typeof datestringResult !== 'boolean' && datestringResult.isDate) {
      datestringCount++;
    } else if (isNumber(value)) {
      numberCount++;
    }
    // No else needed - we don't need to count other types
  }

  // Calculate percentages (what portion of the sample is each type)
  const numberPercentage = numberCount / sample.length;
  const datestringPercentage = datestringCount / sample.length;

  // Determine the most likely type based on thresholds
  // We require high consistency for special types
  if (datestringPercentage >= 0.9) {
    return 'datestring';
  } else if (numberPercentage >= 0.9) {
    return 'number';
  } else {
    return 'string'; // Default to string for mixed types
  }
}

/**
 * Checks if a value is a number
 */
function isNumber(value: unknown): boolean {
  if (typeof value === 'number') {
    return !isNaN(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return false;

    // Simple number check - integers, decimals, scientific notation
    if (/^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(trimmed)) {
      const num = parseFloat(trimmed);
      return !isNaN(num) && isFinite(num);
    }
  }

  return false;
}

/**
 * Checks if a value is a date
 */
function isDate(value: unknown): boolean | { isDate: boolean; format: string } {
  if (value instanceof Date) {
    return { isDate: !isNaN(value.getTime()), format: 'ISO' };
  }

  if (typeof value === 'string') {
    // Try to parse common date formats
    const trimmed = value.trim();
    if (trimmed === '') return false;

    // Check for time-only formats (these should be treated as strings, not dates)
    const timeOnlyPatterns = [
      /^\d{2}:\d{2}:\d{2}\s?[AP]M$/i, // HH:MM:SS AM/PM format
      /^\d{1,2}:\d{2}(?::\d{2})?\s?[AP]M$/i, // H:MM:SS AM/PM format
      /^\d{1,2}:\d{2}(?::\d{2})?$/i, // H:MM:SS 24-hour format
    ];

    if (timeOnlyPatterns.some((pattern) => pattern.test(trimmed))) {
      return false; // Treat time-only values as strings, not dates
    }

    // Define date patterns with their corresponding formats
    const datePatterns = [
      // ISO formats
      { pattern: /^\d{4}-\d{2}-\d{2}$/, format: 'YYYY-MM-DD' },
      { pattern: /^\d{4}-\d{1,2}-\d{1,2}$/, format: 'YYYY-M-D' },
      { pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, format: 'YYYY-MM-DDTHH:MM:SS' },
      { pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, format: 'YYYY-MM-DDTHH:MM:SSZ' },
      {
        pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        format: 'YYYY-MM-DDTHH:MM:SS.sssZ',
      },
      {
        pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/,
        format: 'YYYY-MM-DDTHH:MM:SS±HH:MM',
      },

      // US formats (MM/DD/YYYY)
      { pattern: /^\d{1,2}\/\d{1,2}\/\d{4}$/, format: 'MM/DD/YYYY' },
      { pattern: /^\d{1,2}\/\d{1,2}\/\d{2}$/, format: 'MM/DD/YY' },

      // European formats (DD/MM/YYYY and DD.MM.YYYY)
      { pattern: /^\d{1,2}\/\d{1,2}\/\d{4}$/, format: 'DD/MM/YYYY' }, // Ambiguous with US format
      { pattern: /^\d{1,2}\.\d{1,2}\.\d{4}$/, format: 'DD.MM.YYYY' },
      { pattern: /^\d{1,2}\.\d{1,2}\.\d{2}$/, format: 'DD.MM.YY' },

      // Hyphen separated
      { pattern: /^\d{1,2}-\d{1,2}-\d{4}$/, format: 'DD-MM-YYYY' },
      { pattern: /^\d{1,2}-\d{1,2}-\d{2}$/, format: 'DD-MM-YY' },

      // Slash separated (YYYY/MM/DD)
      { pattern: /^\d{4}\/\d{1,2}\/\d{1,2}$/, format: 'YYYY/MM/DD' },

      // Month name formats (3-letter abbreviations)
      { pattern: /^\d{1,2}\s[A-Za-z]{3}\s\d{4}$/, format: 'DD MMM YYYY' },
      { pattern: /^\d{1,2}\s[A-Za-z]{3}\s\d{2}$/, format: 'DD MMM YY' },
      { pattern: /^[A-Za-z]{3}\s\d{1,2},?\s\d{4}$/, format: 'MMM DD, YYYY' },
      { pattern: /^[A-Za-z]{3}\s\d{1,2},?\s\d{2}$/, format: 'MMM DD, YY' },
      { pattern: /^\d{1,2}-[A-Za-z]{3}-\d{4}$/, format: 'DD-MMM-YYYY' },
      { pattern: /^\d{1,2}-[A-Za-z]{3}-\d{2}$/, format: 'DD-MMM-YY' },

      // Month name formats (full month names)
      { pattern: /^\d{1,2}\s[A-Za-z]{4,9}\s\d{4}$/, format: 'DD MMMM YYYY' },
      { pattern: /^[A-Za-z]{4,9}\s\d{1,2},?\s\d{4}$/, format: 'MMMM DD, YYYY' },

      // Compact formats
      { pattern: /^\d{8}$/, format: 'YYYYMMDD' }, // 20230115
      { pattern: /^\d{6}$/, format: 'YYMMDD' }, // 230115

      // Other common formats
      { pattern: /^\d{1,2}-\d{1,2}-\d{4}\s\d{1,2}:\d{2}:\d{2}$/, format: 'DD-MM-YYYY HH:MM:SS' },
      { pattern: /^\d{4}-\d{1,2}-\d{1,2}\s\d{1,2}:\d{2}:\d{2}$/, format: 'YYYY-MM-DD HH:MM:SS' },
    ];

    for (const { pattern, format } of datePatterns) {
      if (pattern.test(trimmed)) {
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
          return { isDate: true, format };
        }
      }
    }
  }

  return false;
}

// Stats calculation functions
/**
 * Calculates statistics for string columns including sample values
 */
function calculateStringStats(values: unknown[], baseStats: ColumnStats): StringColumnStats {
  const maxSamples = 5;

  // Filter out null/undefined/empty values and convert to strings
  const validStrings = values
    .filter((value) => value !== null && value !== undefined)
    .map(String)
    .filter((str) => str.trim() !== '');

  // Get sample either directly or through reservoir sampling
  const sampleValues =
    validStrings.length <= maxSamples
      ? Array.from(new Set(validStrings))
      : (() => {
          // Use reservoir sampling for larger arrays
          const reservoir: string[] = validStrings.slice(0, maxSamples);
          // Replace elements with gradually decreasing probability
          for (let i = maxSamples; i < validStrings.length; i++) {
            const j = Math.floor(Math.random() * (i + 1));
            if (j < maxSamples) {
              reservoir[j] = validStrings[i];
            }
          }
          return Array.from(new Set(reservoir));
        })();

  return {
    ...baseStats,
    sampleValues,
  };
}

/**
 * Calculates statistics for number columns
 */
function calculateNumberStats(values: unknown[], baseStats: ColumnStats): NumberColumnStats {
  // Convert all values to numbers
  const numbers: number[] = [];

  for (const value of values) {
    if (isNumber(value)) {
      let num: number;

      if (typeof value === 'number') {
        num = value;
      } else if (typeof value === 'string') {
        // Remove currency symbols, commas, etc.
        const normalized = value.trim().replace(/[,$]/g, '').replace(/[()]/g, '');
        num = parseFloat(normalized);
      } else {
        continue; // Skip non-numeric values
      }

      if (!isNaN(num) && isFinite(num)) {
        numbers.push(num);
      }
    }
  }

  // Calculate min and max
  let min: number | null = null;
  let max: number | null = null;

  if (numbers.length > 0) {
    // Use iteration instead of spread operator to avoid stack overflow with large arrays
    min = numbers[0];
    max = numbers[0];

    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] < min) min = numbers[i];
      if (numbers[i] > max) max = numbers[i];
    }
  }

  return {
    ...baseStats,
    min,
    max,
  };
}

/**
 * Calculates statistics for datestring columns
 */
function calculateDateStats(values: unknown[], baseStats: ColumnStats): DateColumnStats {
  // Convert all values to dates and track formats
  const dates: Date[] = [];
  const formatCounts: Record<string, number> = {};
  let dominantFormat: string | null = null;

  for (const value of values) {
    if (value instanceof Date) {
      if (!isNaN(value.getTime())) {
        dates.push(value);
        formatCounts['ISO'] = (formatCounts['ISO'] || 0) + 1;
      }
    } else if (typeof value === 'string') {
      const result = isDate(value);
      if (result && typeof result !== 'boolean' && result.isDate) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          dates.push(date);
          formatCounts[result.format] = (formatCounts[result.format] || 0) + 1;
        }
      }
    }
  }

  // Calculate min and max
  let min: string | null = null;
  let max: string | null = null;

  if (dates.length > 0) {
    // Use iteration instead of spread operator to avoid stack overflow with large arrays
    let minTimestamp = dates[0].getTime();
    let maxTimestamp = dates[0].getTime();

    for (let i = 1; i < dates.length; i++) {
      const timestamp = dates[i].getTime();
      if (timestamp < minTimestamp) minTimestamp = timestamp;
      if (timestamp > maxTimestamp) maxTimestamp = timestamp;
    }

    const minDate = new Date(minTimestamp);
    const maxDate = new Date(maxTimestamp);

    // Determine the dominant format
    if (Object.keys(formatCounts).length > 0) {
      dominantFormat = Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0][0];

      // Map our format strings to date-fns format strings
      const formatMapping: Record<string, string> = {
        'YYYY-MM-DD': 'yyyy-MM-dd',
        'YYYY-M-D': 'yyyy-M-d',
        'YYYY-MM-DDTHH:MM:SS': "yyyy-MM-dd'T'HH:mm:ss",
        'YYYY-MM-DDTHH:MM:SSZ': "yyyy-MM-dd'T'HH:mm:ss'Z'",
        'YYYY-MM-DDTHH:MM:SS.sssZ': "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
        'YYYY-MM-DDTHH:MM:SS±HH:MM': "yyyy-MM-dd'T'HH:mm:ssXXX",
        'MM/DD/YYYY': 'MM/dd/yyyy',
        'MM/DD/YY': 'MM/dd/yy',
        'DD/MM/YYYY': 'dd/MM/yyyy',
        'DD.MM.YYYY': 'dd.MM.yyyy',
        'DD.MM.YY': 'dd.MM.yy',
        'DD-MM-YYYY': 'dd-MM-yyyy',
        'DD-MM-YY': 'dd-MM-yy',
        'YYYY/MM/DD': 'yyyy/MM/dd',
        'DD MMM YYYY': 'dd MMM yyyy',
        'DD MMM YY': 'dd MMM yy',
        'MMM DD, YYYY': 'MMM dd, yyyy',
        'MMM DD, YY': 'MMM dd, yy',
        'DD-MMM-YYYY': 'dd-MMM-yyyy',
        'DD-MMM-YY': 'dd-MMM-yy',
        'DD MMMM YYYY': 'dd MMMM yyyy',
        'MMMM DD, YYYY': 'MMMM dd, yyyy',
        YYYYMMDD: 'yyyyMMdd',
        YYMMDD: 'yyMMdd',
        'DD-MM-YYYY HH:MM:SS': 'dd-MM-yyyy HH:mm:ss',
        'YYYY-MM-DD HH:MM:SS': 'yyyy-MM-dd HH:mm:ss',
        ISO: 'yyyy-MM-dd',
      };

      // Format dates using date-fns
      if (dominantFormat && formatMapping[dominantFormat]) {
        try {
          min = format(minDate, formatMapping[dominantFormat]);
          max = format(maxDate, formatMapping[dominantFormat]);
        } catch {
          // Fallback to ISO format if date-fns format fails
          min = format(minDate, 'yyyy-MM-dd');
          max = format(maxDate, 'yyyy-MM-dd');
        }
      } else {
        // Fallback to ISO format if no mapping found
        min = format(minDate, 'yyyy-MM-dd');
        max = format(maxDate, 'yyyy-MM-dd');
      }
    } else {
      // Fallback to ISO format
      min = format(minDate, 'yyyy-MM-dd');
      max = format(maxDate, 'yyyy-MM-dd');
    }
  }

  return {
    ...baseStats,
    min,
    max,
    format: dominantFormat,
  };
}
