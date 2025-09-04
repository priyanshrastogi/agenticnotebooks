import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

import { FileMetadataDto, MessageDto } from '@/modules/agent/dto/sheets-request.dto';

@Injectable()
export class SheetsAgent {
  private readonly logger = new Logger(SheetsAgent.name);
  private openAIModel: ChatOpenAI;
  private anthropicModel: ChatAnthropic;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    try {
      this.openAIModel = new ChatOpenAI({
        modelName: this.configService.get<string>('agent.openaiModel'),
        openAIApiKey: this.configService.getOrThrow<string>('agent.openaiApiKey'),
        temperature: 0.1,
      });

      this.anthropicModel = new ChatAnthropic({
        modelName: this.configService.get<string>('agent.anthropicModel'),
        anthropicApiKey: this.configService.getOrThrow<string>('agent.anthropicApiKey'),
        temperature: 0.1,
      });

      this.logger.log('SheetsAgent initialized');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error initializing SheetsAgent: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error initializing SheetsAgent: ${String(error)}`);
      }
    }
  }

  async chatWithSheets(
    query: string,
    files: FileMetadataDto[],
    conversationId: string,
    history?: MessageDto[],
    preferredLLMProvider?: string
  ): Promise<{
    response: string;
    conversationId: string;
    code?: string;
    newFileName?: string;
    usage?: {
      inputTokens: number;
      outputTokens: number;
    };
  }> {
    try {
      this.logger.log(`Processing sheets message for conversation ${conversationId}`);

      // System prompt that instructs the model to generate code
      const systemPrompt = {
        role: 'system',
        content: `You are a data analysis assistant specialized in generating code for processing Excel/CSV data.
        Given metadata about spreadsheets and a user query, generate JavaScript code
        that would answer the user's question.
        
        IMPORTANT: The code you generate will run in the user's browser and MUST use the xlsx library for parsing and manipulating spreadsheet data.
        
        YOUR CODE MUST INCLUDE THREE FUNCTIONS:
        1. 'analyzeData' - Performs the data analysis and returns results
        2. 'constructResponseWithResult' - Builds a human-friendly response message
        3. 'createVisualization' - Generates a Chart.js visualization config when a visualization is requested by the user
        
        STRICT REQUIREMENTS:
        1. The 'analyzeData' function MUST return an object with exactly THREE properties:
          - data: An array of objects representing the result rows
          - columns: An array of objects with {header: string, accessor: string} format
          - newFileName: A string with a descriptive filename for the result (KEEP the original file extension)
        
        2. The 'constructResponseWithResult' function:
          - Takes the analysis result as parameter
          - Returns a natural language response string
          - MUST include the newFileName in the response
          - Should highlight key findings from the analysis
          - Should mention if a visualization was created
          - Should be conversational and specific to the data analysis performed
        
        3. The 'createVisualization' function:
          - Returns null when no visualization is needed
          - When visualization is requested, returns an object with:
            - type: The Chart.js chart type (e.g., 'bar', 'line', 'pie', 'scatter', etc.)
            - data: The data object with labels and datasets
            - options: Chart.js options for configuration
            - title: A descriptive title for the chart
        
        4. Do not add any explanations or comments outside these functions
        5. Do not use async/await in your functions
        6. Do not use TypeScript
        7. Ensure the code is browser-compatible
        
        VISUALIZATION GUIDELINES:
        - Create visualizations when the user's query implies a chart or graph is needed
        - Choose the most appropriate chart type for the data:
          - Use 'bar' for comparing discrete categories
          - Use 'line' for time series or trends
          - Use 'pie' for showing composition or proportions
          - Use 'scatter' for correlation between two variables
          - Use 'radar' for multivariate data on multiple axes
        - Use appropriate colors (preferably using tailwind CSS color palette)
        - Include clear labels, titles, and legends
        - Format y-axis values appropriately (e.g., currency, percentages)
        - Limit the number of data points for readability (top 10 or 20 if there are many)
        
        RESPONSE CONSTRUCTION GUIDELINES:
        - Write a natural, conversational response that summarizes what the analysis found
        - Include specific numbers and insights from the analysis
        - Always mention the name of the generated file
        - If a visualization was created, mention what it shows
        - Keep the message informative but concise (2-4 sentences)
        
        AVAILABLE CONTEXT VARIABLES:
        - filesData: Object - Map of all loaded files with their data, indexed by filename
        - databaseResult: Array - Database query results (when this comes from a database query)
        
        HOW TO ACCESS DATA:
        SPREADSHEET FILES:
        - Access a specific file: filesData['filename.xlsx']
        - Get available sheets: Object.keys(filesData['filename.xlsx'].sheets)
        - Access a specific sheet: filesData['filename.xlsx'].sheets['Sheet1']
        - Get sheet data: filesData['filename.xlsx'].sheets['Sheet1'].data
        - Get sheet columns: filesData['filename.xlsx'].sheets['Sheet1'].columns
        
        DATABASE RESULTS (when analyzing DB data or doing comparisons):
        - Access database data: databaseResult (array of objects)
        - Database results come pre-formatted as an array of objects
        
        COMPARISON SCENARIOS:
        - When comparing database vs spreadsheet data, you'll have both databaseResult and filesData
        - Intelligently match fields between database and spreadsheet data
        - Generate comprehensive comparison analysis with matches, differences, and insights
        
        EXAMPLE RETURN STRUCTURES:
        
        // Example 1: Spreadsheet Analysis
        \`\`\`
        function analyzeData() {
          const file1Data = filesData['sales.xlsx'].sheets['Q1'].data;
          const file2Data = filesData['sales.xlsx'].sheets['Q2'].data;
          
          const combinedData = [...file1Data, ...file2Data].filter(row => row.revenue > 1000);
          
          return {
            data: combinedData,
            columns: [
              { header: 'Date', accessor: 'Date' },
              { header: 'Product Name', accessor: 'Product Name' },
              { header: 'Revenue', accessor: 'Revenue' }
            ],
            newFileName: "Combined_Analysis_Q2_2023.xlsx"
          };
        }
        \`\`\`
        
        // Example 2: Database vs Spreadsheet Comparison
        \`\`\`
        function analyzeData() {
          const dbData = databaseResult; // Array from database query
          const sheetData = filesData['customers.xlsx'].sheets['Sheet1'].data;
          
          // Intelligent field matching
          const matches = [];
          const mismatches = [];
          const dbOnly = [];
          const sheetOnly = [];
          
          // Compare data intelligently
          dbData.forEach(dbRow => {
            const sheetRow = sheetData.find(sr => sr.customer_id === dbRow.id || sr.email === dbRow.email);
            if (sheetRow) {
              if (JSON.stringify(dbRow) === JSON.stringify(sheetRow)) {
                matches.push({ database: dbRow, spreadsheet: sheetRow });
              } else {
                mismatches.push({ database: dbRow, spreadsheet: sheetRow, differences: findDifferences(dbRow, sheetRow) });
              }
            } else {
              dbOnly.push(dbRow);
            }
          });
          
          return {
            data: { matches, mismatches, dbOnly, sheetOnly },
            columns: [
              { header: 'Comparison Type', accessor: 'type' },
              { header: 'Count', accessor: 'count' },
              { header: 'Details', accessor: 'details' }
            ],
            newFileName: "Database_Spreadsheet_Comparison.xlsx"
          };
        }
        \`\`\`
        
        function constructResponseWithResult(result) {
          return "I've analyzed your sales data and found that Q2 had the highest revenue at $1.2M. The top performing region was West with 32% of total sales. I've created a new file 'Sales_Analysis_Q2_2023.xlsx' with the detailed breakdown and also generated a bar chart visualizing the revenue by region.";
        }
        
        function createVisualization(result) {
          // Return null if no visualization is needed
          if (!result.data || result.data.length === 0) return null;
          
          // Example: Create a bar chart for revenue by region
          const labels = result.data.map(item => item.Region);
          const values = result.data.map(item => parseFloat(item.Revenue));
          
          return {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [{
                label: 'Revenue by Region',
                data: values,
                backgroundColor: [
                  'rgba(37, 99, 235, 0.6)',  // blue-600
                  'rgba(5, 150, 105, 0.6)',  // green-600
                  'rgba(220, 38, 38, 0.6)',  // red-600
                  'rgba(217, 119, 6, 0.6)',  // amber-600
                  'rgba(124, 58, 237, 0.6)'  // purple-600
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Revenue by Region'
                }
              }
            },
            title: 'Revenue by Region'
          };
        }
        \`\`\`
        
        Ensure the code is clear, efficient, and handles data correctly.
        The code should return ONLY the data needed to answer the user's question.
        The newFileName should be descriptive of the analysis performed and preserve the file extension (.xlsx, .xls, or .csv).`,
      };

      // Previous conversation history if available
      const messages = history ? [...history] : [];

      // Add file metadata to the context
      const fileMetadataPrompt = {
        role: 'user',
        content: `I have a spreadsheet with the following structure:
           
          ${JSON.stringify(files, null, 2)}
           
          Please analyze this data structure in your response.`,
      };

      // Add the user's current query
      const userPrompt = {
        role: 'user',
        content: `My question is: ${query}
           
          Please generate JavaScript/TypeScript code that would process this data and answer my question.
          Return only the code, no explanations or markdown.`,
      };

      // Create prompt for the model
      const prompts = [systemPrompt];

      // Add history if available
      if (messages.length > 0) {
        prompts.push(
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }))
        );
      }

      // Add the file metadata and current query
      prompts.push(fileMetadataPrompt, userPrompt);

      // Select model based on preferredLLMProvider
      let model: ChatOpenAI | ChatAnthropic;
      if (preferredLLMProvider === 'anthropic') {
        model = this.anthropicModel;
      } else {
        model = this.openAIModel;
      }

      // Call the model with the prompts
      const result = await model.invoke(prompts);

      // Extract and clean code from the response
      let code = '';
      try {
        if (typeof result.content === 'string') {
          code = result.content;
        } else if (
          result.content &&
          typeof result.content === 'object' &&
          'text' in result.content
        ) {
          code = (result.content as { text: string }).text;
        } else {
          throw new Error('Unable to extract text content from LLM response');
        }
      } catch (error) {
        this.logger.warn('Error extracting code from model response content', error);
        code = 'Error extracting code from model response';
      }

      // Clean up code if it contains markdown code blocks
      if (code.includes('```')) {
        const codeMatch = code.match(/```(?:javascript|typescript|js|ts)?\s*([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
          code = codeMatch[1].trim();
        }
      }

      // Try to extract the suggested filename from the code
      let newFileName: string | undefined;
      try {
        const filenameMatch = code.match(/newFileName:\s*["']([^"']+)["']/);
        if (filenameMatch && filenameMatch[1]) {
          newFileName = filenameMatch[1];

          // Ensure the filename has a valid extension
          if (!newFileName.match(/\.(xlsx|xls|csv)$/i)) {
            newFileName += '.xlsx';
          }
        }
      } catch (error) {
        this.logger.warn('Error extracting filename from code', error);
      }

      // Create a user-friendly response
      const response =
        "I've generated code to analyze your spreadsheet data based on your question.";

      const usage = {
        inputTokens: result.usage_metadata?.input_tokens || 0,
        outputTokens: result.usage_metadata?.output_tokens || 0,
      };

      return {
        response,
        conversationId,
        code,
        newFileName,
        usage,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error in chatWithSheets: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error in chatWithSheets: ${String(error)}`);
      }

      // Return a graceful error message
      return {
        response:
          "I'm sorry, but I encountered an error processing your request. Please try again.",
        conversationId: conversationId || nanoid(10),
      };
    }
  }
}
