import { extractFileMetadata } from './extract-metadata';
import { readFileData } from './read-file';
import { FileData, FileMetadata } from './types';

/**
 * Service responsible for processing files (reading data and extracting metadata)
 * This centralizes all file processing operations into a single service
 */
export class FileProcessingService {
  /**
   * Process a single file - reads data and extracts metadata
   * @param file The file to process
   * @returns Promise with the processed data and metadata
   */
  public static async processFile(file: File): Promise<{
    fileData: FileData;
    fileMetadata: FileMetadata;
  }> {
    try {
      // Run operations in parallel for better performance
      const [fileData, fileMetadata] = await Promise.all([
        readFileData(file),
        extractFileMetadata(file),
      ]);

      return { fileData, fileMetadata };
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      throw new Error(
        `Failed to process file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Checks if a file is supported for processing
   * @param file The file to check
   * @returns boolean indicating if the file is supported
   */
  public static isFileSupported(file: File): boolean {
    return (
      file.type.includes('spreadsheet') ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.csv')
    );
  }

  /**
   * Gets the list of supported file extensions
   * @returns Array of supported file extensions
   */
  public static getSupportedFileExtensions(): string[] {
    return ['.xlsx', '.xls', '.csv'];
  }
}
