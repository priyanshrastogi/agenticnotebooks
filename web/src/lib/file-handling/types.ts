// Core interfaces for metadata extraction

/**
 * Collection of file metadata, keyed by filename
 */
export interface FileMetadataMap {
  [key: string]: FileMetadata;
}

export interface FileMetadata {
  fileName: string;
  fileType: 'xlsx' | 'xls' | 'csv';
  fileSize: number;
  sheetsNumber: number;
  sheets: {
    [sheetName: string]: SheetMetadata;
  };
}

export interface SheetMetadata {
  columns: Column[];
  rowCount: number;
  emptyColumnNameCount: number;
}

// Base column interface
export interface Column {
  name: string;
  index: number;
  dataType: 'string' | 'number' | 'datestring';
  stats: ColumnStats;
}

// Stats interfaces for different data types
export interface ColumnStats {
  count: number;
  nullCount: number;
  uniqueCount: number;
}

export interface NumberColumnStats extends ColumnStats {
  min: number | null;
  max: number | null;
}

export interface StringColumnStats extends ColumnStats {
  // No additional specific stats for basic implementation
  sampleValues: string[];
}

export interface DateColumnStats extends ColumnStats {
  min: string | null; // ISO date string
  max: string | null; // ISO date string
  format: string | null; // Date format (e.g., "YYYY-MM-DD")
}

// Type guards for runtime type checking
export type NumberColumn = Column & { dataType: 'number'; stats: NumberColumnStats };
export type StringColumn = Column & { dataType: 'string'; stats: StringColumnStats };
export type DateColumn = Column & { dataType: 'datestring'; stats: DateColumnStats };

// Types moved from FileViewer component
/**
 * Column definition for displaying data in tables
 */
export interface TableColumn {
  header: string;
  accessor: string;
}

/**
 * Represents a row of data in a spreadsheet
 */
export interface RowData {
  [key: string]: string | number;
}

/**
 * Sheet data structure
 */
export interface SheetData {
  data: RowData[];
  columns: TableColumn[];
}

/**
 * Processed file data ready for display
 */
export interface FileData {
  sheets: {
    [sheetName: string]: SheetData;
  };
  activeSheet: string;
}

/**
 * Collection of files with their data, keyed by filename
 */
export interface FileDataMap {
  [key: string]: FileData;
}
