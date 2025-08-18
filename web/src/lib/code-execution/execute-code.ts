/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileDataMap, RowData } from '@/lib/file-handling/types';

interface ChartConfig {
  type: string;
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  options: {
    [key: string]: any;
  };
  title: string;
}

interface ExecutionResult {
  data: RowData[];
  columns: { header: string; accessor: string }[];
  newFileName?: string;
  responseMessage: string;
  visualization?: ChartConfig | null; // New property for chart configuration
}

/**
 * Safely executes generated code with spreadsheet data as context
 *
 * @param code The generated code to execute
 * @param filesData Map of all loaded file data
 * @returns Execution result containing data, columns, response message, and visualization
 */
export async function executeGeneratedCode(
  code: string,
  filesData: FileDataMap
): Promise<ExecutionResult | null> {
  try {
    if (Object.keys(filesData).length === 0) {
      throw new Error('No files available to analyze');
    }

    // Prepare execution context variables
    const executionContext = {
      filesData,
    };

    // Check if the code contains all required functions
    const hasAnalyzeData = code.includes('function analyzeData');
    const hasConstructResponse = code.includes('function constructResponseWithResult');
    const hasCreateVisualization = code.includes('function createVisualization');

    // If any function is missing, try to add placeholder implementations
    if (!hasAnalyzeData) {
      code = `function analyzeData() {\n${code}\n}`;
    }

    if (!hasConstructResponse) {
      code += `\nfunction constructResponseWithResult(result) {
        return "I've analyzed your data and created a new file named '" + result.newFileName + "' with the results. You can view it in the file viewer.";
      }`;
    }

    if (!hasCreateVisualization) {
      code += `\nfunction createVisualization(result) {
        return null; // No visualization by default
      }`;
    }

    // Create a function that executes the code with the prepared context
    const executeFunction = new Function(
      ...Object.keys(executionContext),
      `
      try {
        // Add XLSX library to the context (assuming it's globally available)
        const XLSX = window.XLSX;
        
        // Execute the generated code
        ${code}
        
        // Call the analyzeData function to get the result
        const result = analyzeData();
        
        // Generate the response message
        let responseMessage = "";
        try {
          responseMessage = constructResponseWithResult(result);
        } catch (responseError) {
          console.warn('Error in constructResponseWithResult:', responseError);
          responseMessage = "I've analyzed your data and created a new file named '" + result.newFileName + "' with the results. You can view it in the file viewer.";
        }
        
        // Generate visualization if applicable
        let visualization = null;
        try {
          visualization = createVisualization(result);
        } catch (visualizationError) {
          console.warn('Error in createVisualization:', visualizationError);
          visualization = null;
        }
        
        // Add the response message and visualization to the result
        result.responseMessage = responseMessage;
        result.visualization = visualization;
        
        return result;
      } catch (error) {
        console.error('Error in code execution:', error);
        throw error;
      }
      `
    );

    // Execute the function with the context values
    const result = executeFunction(...Object.values(executionContext));

    if (!result || !result.data || !result.columns) {
      console.warn('Code execution did not produce a valid result structure');
      return null;
    }

    // Ensure we have a response message even if it wasn't set
    if (!result.responseMessage) {
      result.responseMessage = `I've analyzed your data and created a new file named '${result.newFileName || 'analysis_results.xlsx'}' with the results. You can view it in the file viewer.`;
    }

    return result;
  } catch (error) {
    console.error('Error executing generated code:', error);
    throw error;
  }
}
