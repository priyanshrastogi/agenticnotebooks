import * as XLSX from 'xlsx';

import { FileData, RowData, SheetData, TableColumn } from './types';

/**
 * Factory function to get the appropriate file reader based on file type
 * @param file The file to read
 * @returns The appropriate reader function
 */
function getFileReader(file: File): (file: File) => Promise<FileData> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'csv':
      return readCSVFile;
    case 'xlsx':
    case 'xls':
      return readExcelFile;
    default:
      // Default to Excel reader if type can't be determined
      return readExcelFile;
  }
}

/**
 * Reads an Excel or CSV file and converts it to formatted data for display
 * Acts as a facade for the specific reader implementations
 * @param file The file to read
 * @returns Promise with the formatted file data
 */
export async function readFileData(file: File): Promise<FileData> {
  const reader = getFileReader(file);
  return reader(file);
}

/**
 * Reads Excel files (.xlsx, .xls)
 * @param file The Excel file to read
 * @returns Promise with the formatted file data
 */
async function readExcelFile(file: File): Promise<FileData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Process all sheets
        const sheetsData: { [sheetName: string]: SheetData } = {};

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          sheetsData[sheetName] = processWorksheet(worksheet);
        }

        // Use the first sheet as the active sheet by default
        const firstSheetName = workbook.SheetNames[0] || '';

        resolve({
          sheets: sheetsData,
          activeSheet: firstSheetName,
        });
      } catch (error) {
        reject(
          new Error(
            `Failed to read Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    };

    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Reads CSV files
 * @param file The CSV file to read
 * @returns Promise with the formatted file data
 */
async function readCSVFile(file: File): Promise<FileData> {
  // For CSV files, we still use XLSX but with specific options
  return readExcelFile(file);
}

/**
 * Processes a worksheet into structured data
 * @param worksheet The XLSX worksheet
 * @returns Structured sheet data
 */
function processWorksheet(worksheet: XLSX.WorkSheet): SheetData {
  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    defval: null,
    blankrows: true,
    raw: false,
  }) as Record<string, string | number>[];

  // Handle empty sheets
  if (jsonData.length === 0) {
    return {
      data: [],
      columns: [],
    };
  }

  // Extract column headers
  const headers = Object.keys(jsonData[0] || {});

  // Create column definitions
  const columns: TableColumn[] = headers.map((header) => ({
    header,
    accessor: header,
  }));

  // Create row data
  const rows: RowData[] = jsonData.map((row) => ({
    ...row,
  }));

  return {
    data: rows,
    columns,
  };
}

/**
 * Generates a file ID from the filename
 * @param fileName The original file name
 * @returns A formatted file ID
 */
export function getFileId(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/\.\w+$/, '')
    .replace(/\s+/g, '-');
}

/**
 * Extract a display name from a filename
 * @param fileName The original file name
 * @returns A formatted display name (e.g., "sales_data.xlsx" -> "Sales Data")
 */
export function getDisplayName(fileName: string): string {
  // Remove file extension and replace underscores/hyphens with spaces
  const nameWithoutExt = fileName.replace(/\.\w+$/, '').replace(/[_-]/g, ' ');

  // Capitalize first letter of each word
  return nameWithoutExt
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
