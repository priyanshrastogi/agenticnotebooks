import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

import { DatabaseMetadataDto, TableMetadataDto } from './dto/database-request.dto';
import { FileMetadataDto, MessageDto } from './dto/sheets-request.dto';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private openAIModel: ChatOpenAI;
  private anthropicModel: ChatAnthropic;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    try {
      // Initialize OpenAI chat model
      this.openAIModel = new ChatOpenAI({
        modelName: this.configService.get<string>('agent.openaiModel'),
        openAIApiKey: this.configService.getOrThrow<string>('agent.openaiApiKey'),
        temperature: 0.1, // Lower temperature for more deterministic code generation
      });

      this.anthropicModel = new ChatAnthropic({
        modelName: this.configService.get<string>('agent.anthropicModel'),
        anthropicApiKey: this.configService.getOrThrow<string>('agent.anthropicApiKey'),
        temperature: 0.1,
      });

      this.logger.log('Agent service initialized');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error initializing agent service: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error initializing agent service: ${String(error)}`);
      }
    }
  }

  /**
   * Process a user message about spreadsheet data and return generated code
   */
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
      this.logger.log(`Processing message for conversation ${conversationId}`);

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
        
        HOW TO ACCESS DATA:
        - Access a specific file: filesData['filename.xlsx']
        - Get available sheets: Object.keys(filesData['filename.xlsx'].sheets)
        - Access a specific sheet: filesData['filename.xlsx'].sheets['Sheet1']
        - Get sheet data: filesData['filename.xlsx'].sheets['Sheet1'].data
        - Get sheet columns: filesData['filename.xlsx'].sheets['Sheet1'].columns
        
        EXAMPLE RETURN STRUCTURE:
        \`\`\`
        function analyzeData() {
          // Example: Analyze data across multiple files
          const file1Data = filesData['sales.xlsx'].sheets['Q1'].data;
          const file2Data = filesData['sales.xlsx'].sheets['Q2'].data;
          
          // Process and combine data as needed
          const combinedData = [...file1Data, ...file2Data].filter(row => row.revenue > 1000);
          
          // Format monetary values to 2 decimal places
          combinedData.forEach(row => {
            row.Revenue = parseFloat(row.Revenue).toFixed(2);
          });
          
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
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        code = result.content?.toString() || '';
      } catch (error) {
        this.logger.warn('Error stringifying model response content', error);
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
        this.logger.error(`Error in chat: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error in chat: ${String(error)}`);
      }

      // Return a graceful error message
      return {
        response:
          "I'm sorry, but I encountered an error processing your request. Please try again.",
        conversationId: conversationId || nanoid(10),
      };
    }
  }

  /**
   * Get database-specific system prompt for SQL generation
   */
  private getDatabaseSpecificSystemPrompt(databaseType: 'postgres' | 'mysql' | 'sqlite'): string {
    const basePrompt = `You are a database expert specialized in helping users with their database questions.
        
        Your task is to analyze the user's question and determine if they need:
        1. A SQL query to retrieve data
        2. An explanation or conceptual answer about databases, schemas, or data modeling
        
        RESPONSE FORMAT:
        You must respond in the following JSON format:
        {
          "needsSQL": boolean,
          "response": "Natural language response to the user in markdown format",
          "sql": "SQL query (only if needsSQL is true, otherwise omit this field)"
        }
        
        CRITICAL JSON FORMATTING REQUIREMENTS:
        1. Return ONLY the JSON object, do not wrap it in markdown code blocks or add any other text
        2. PROPERLY ESCAPE all special characters in JSON strings:
           - Escape backticks: backtick becomes backslash + backtick
           - Escape quotes: double-quote becomes backslash + double-quote
           - Escape backslashes: backslash becomes double-backslash
           - Escape newlines: actual newlines become backslash + n
           - Escape tabs: actual tabs become backslash + t
        3. When using markdown formatting in the "response" field, ensure all backticks are properly escaped
        4. Example: table names in markdown code blocks must have escaped backticks in the JSON string
        5. Test your JSON mentally before responding to ensure it's valid
        
        WHEN TO GENERATE SQL (needsSQL: true):
        - User wants to query, retrieve, or analyze data
        - User asks "show me", "find", "get", "list", "count", "sum", etc.
        - User wants to see specific records or perform calculations
        - User needs data filtering, sorting, or aggregation
        
        WHEN NOT TO GENERATE SQL (needsSQL: false):
        - User asks for explanations about database concepts
        - User wants to understand table relationships or schema design
        - User asks "what is", "how does", "explain", "why", etc.
        - User needs conceptual help or learning about databases
        - User asks about data types, constraints, or database features
        
        RESPONSE GENERATION REQUIREMENTS:
        1. Always provide a helpful, natural language response formatted in markdown
        2. Use markdown formatting for better readability: bold text for emphasis, code blocks for table/column names, headings for sections, bullet points for lists, numbered lists for instructions, blockquotes for important notes
        3. If SQL is generated, explain what the query does in clear terms
        4. If no SQL is needed, provide a clear explanation or answer using markdown formatting
        5. Be conversational and helpful
        6. Reference specific table/column names using code formatting when relevant
        7. If user's question cannot be answered with available schema, explain what's missing
        8. For explanations, use examples when helpful
        9. DO NOT include "SQL Query:" headers or separators in your response - the UI will display SQL separately
        10. Focus only on explaining what the query does or providing the requested information
        
        CRITICAL SQL GENERATION REQUIREMENTS:
        1. NEVER use parameterized queries with placeholders like $1, $2, ?, etc.
        2. ALWAYS embed actual values directly in the SQL query
        3. Use proper SQL string quoting for text values: single quotes for strings
        4. For string values, escape single quotes by doubling them: 'can''t' for "can't"
        5. The generated SQL must be immediately executable without any parameter substitution
        6. When filtering by user input, embed the actual values directly in the WHERE clause
        
        AVAILABLE CONTEXT:
        - metadata: Object containing database schemas and their tables with complete DDLs
        - Pay close attention to the DDLs to understand table structures, column names, types, and relationships
        - Some tables may include descriptions explaining their purpose and content
        - Some tables may include column descriptions providing context for individual fields
        - Use descriptions (when available) to better understand the data model and generate more accurate queries
        - When descriptions are available, reference them in your explanations to provide richer context to users`;

    switch (databaseType) {
      case 'postgres':
        return `${basePrompt}
        
        DATABASE-SPECIFIC REQUIREMENTS FOR POSTGRESQL:
        1. Use double quotes for identifiers: "table_name", "column_name"
        2. Use proper schema qualification: schema_name."table_name"
        3. PostgreSQL supports advanced features like CTEs, window functions, JSON operators, arrays
        4. Use PostgreSQL-specific functions when appropriate: STRING_AGG(), JSONB operators, etc.
        5. Use proper PostgreSQL data types: INTEGER, VARCHAR, TIMESTAMP, JSONB, etc.
        6. Follow PostgreSQL naming conventions (case-sensitive with quotes)
        7. ALWAYS embed actual values directly in queries - DO NOT use $1, $2 parameters
        8. Support for LIMIT/OFFSET pagination
        9. Use proper CAST() or :: casting syntax
        10. Take advantage of PostgreSQL's rich feature set for complex queries
        11. For string literals, use single quotes and escape embedded quotes by doubling them`;

      case 'mysql':
        return `${basePrompt}
        
        DATABASE-SPECIFIC REQUIREMENTS FOR MYSQL:
        1. Use backticks for identifiers: \`table_name\`, \`column_name\`
        2. Use proper database qualification: \`database_name\`.\`table_name\`
        3. MySQL has some limitations compared to PostgreSQL - avoid overly complex CTEs
        4. Use MySQL-specific functions: CONCAT(), DATE_FORMAT(), IFNULL(), etc.
        5. Use proper MySQL data types: INT, VARCHAR, DATETIME, JSON (MySQL 5.7+), etc.
        6. Be aware of MySQL's case sensitivity settings (depends on OS and configuration)
        7. ALWAYS embed actual values directly in queries - DO NOT use ? parameters
        8. Use LIMIT for pagination (OFFSET available in newer versions)
        9. Use proper CAST() or CONVERT() functions for type conversion
        10. **IMPORTANT LIMITATIONS**: Inform users that MySQL may have limited support for:
           - Advanced window functions (depending on version)
           - Complex CTEs (recursive CTEs require MySQL 8.0+)
           - Some PostgreSQL-specific features
        11. Optimize for MySQL's query planner and indexing strategies
        12. For string literals, use single quotes and escape embedded quotes by doubling them`;

      case 'sqlite':
        return `${basePrompt}
        
        DATABASE-SPECIFIC REQUIREMENTS FOR SQLITE:
        1. Use double quotes for identifiers: "table_name", "column_name"
        2. No schema concept - all tables are in the main database, ignore schema prefixes
        3. **IMPORTANT LIMITATIONS**: Inform users that SQLite has significant limitations:
           - No window functions in older versions (requires SQLite 3.25+)
           - Limited JOIN support compared to PostgreSQL/MySQL
           - No stored procedures or user-defined functions
           - Limited ALTER TABLE capabilities
           - Date/time stored as TEXT, INTEGER, or REAL (not native datetime types)
           - No RIGHT JOIN or FULL OUTER JOIN
        4. Use SQLite-specific functions: strftime(), julianday(), substr(), etc.
        5. Use SQLite data types: INTEGER, REAL, TEXT, BLOB
        6. Handle date/time as TEXT format: 'YYYY-MM-DD HH:MM:SS'
        7. ALWAYS embed actual values directly in queries - DO NOT use ? parameters
        8. Use LIMIT for pagination (OFFSET supported)
        9. Be conservative with query complexity due to SQLite's simpler engine
        10. **Always warn users** about feature limitations when generating complex queries
        11. Prefer simpler, more portable SQL constructs
        12. For string literals, use single quotes and escape embedded quotes by doubling them`;

      default:
        return basePrompt;
    }
  }

  /**
   * Process a user message about database queries and return generated SQL
   */
  async chatWithDatabase(
    query: string,
    metadata: DatabaseMetadataDto,
    conversationId: string,
    history?: MessageDto[],
    preferredLLMProvider?: string
  ): Promise<{
    response: string;
    conversationId: string;
    sql?: string;
    usage?: {
      inputTokens: number;
      outputTokens: number;
    };
  }> {
    try {
      this.logger.log(`Processing database query for conversation ${conversationId}`);

      const totalUsage = { inputTokens: 0, outputTokens: 0 };

      // Extract database type from metadata
      const databaseType = metadata.type || 'postgres'; // fallback to postgres
      this.logger.log(`[Conv: ${conversationId}] Database type: ${databaseType}`);

      // Select model based on preferredLLMProvider
      let model: ChatOpenAI | ChatAnthropic;
      if (preferredLLMProvider === 'anthropic') {
        model = this.anthropicModel;
      } else {
        model = this.openAIModel;
      }

      // Stage 1: Table Selection
      const allTableNames: string[] = [];
      const tableDescriptions: Record<string, string> = {};

      for (const schemaName in metadata.schemas) {
        const schemaContents = metadata.schemas[schemaName] as unknown as Record<
          string,
          TableMetadataDto
        >;
        if (schemaContents) {
          for (const tableName in schemaContents) {
            if (Object.prototype.hasOwnProperty.call(schemaContents, tableName)) {
              // Format table names based on database type
              const qualifiedTableName =
                databaseType === 'sqlite' ? tableName : `${schemaName}.${tableName}`;

              allTableNames.push(qualifiedTableName);

              // Collect table descriptions if available
              const tableMetadata = schemaContents[tableName];
              if (tableMetadata?.description) {
                tableDescriptions[qualifiedTableName] = tableMetadata.description;
              }
            }
          }
        } else {
          this.logger.warn(
            `[Conv: ${conversationId}] Schema ${schemaName} found in metadata.schemas but its content is undefined or null.`
          );
        }
      }

      const tableSelectorSystemPrompt = {
        role: 'system',
        content: `You are an expert database assistant. Your task is to identify the relevant tables needed to answer a user's question based on a provided list of table names and their descriptions.
        ${
          databaseType === 'sqlite'
            ? 'The table names are simple names without schema prefixes (SQLite format).'
            : `The table names are in the format "${databaseType === 'mysql' ? 'database.table' : 'schema.table'}".`
        }
        
        Use both the table names and their descriptions (when available) to make informed decisions about which tables are most relevant.
        
        Respond with a comma-separated list of the selected table names.
        If no tables seem relevant, respond with an empty string or "NONE".
        Only include table names from the provided list. Do not invent new table names.
        Focus solely on selecting tables, do not attempt to generate SQL or answer the question directly.`,
      };

      // Build table list with descriptions
      const tableListWithDescriptions = allTableNames
        .map((tableName) => {
          const description = tableDescriptions[tableName];
          return description ? `${tableName}: ${description}` : tableName;
        })
        .join('\n');

      console.log('tableListWithDescriptions', tableListWithDescriptions);

      const tableSelectorUserPrompt = {
        role: 'user',
        content: `Given the following tables with their descriptions:\n${tableListWithDescriptions}\n\nAnd the user's question: "${query}"\n\nWhich tables are most relevant to answer this question? Please provide a comma-separated list of their ${databaseType === 'sqlite' ? 'names' : 'fully qualified names'}.`,
      };

      const tableSelectorPrompts = [tableSelectorSystemPrompt, tableSelectorUserPrompt];

      if (history && history.length > 0) {
        const historyMessages = history.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
        tableSelectorPrompts.splice(1, 0, ...historyMessages);
      }

      const tableSelectorResult = await model.invoke(tableSelectorPrompts);
      totalUsage.inputTokens += tableSelectorResult.usage_metadata?.input_tokens || 0;
      totalUsage.outputTokens += tableSelectorResult.usage_metadata?.output_tokens || 0;

      let selectedTableNamesString = '';
      if (typeof tableSelectorResult.content === 'string') {
        selectedTableNamesString = tableSelectorResult.content.trim();
      } else {
        this.logger.warn(
          `[Conv: ${conversationId}] Stage 1: Table selector model response content was not a string.`
        );
      }

      console.log('selectedTableNamesString', selectedTableNamesString);

      let selectedTableNames: string[] = [];
      if (selectedTableNamesString && selectedTableNamesString.toUpperCase() !== 'NONE') {
        selectedTableNames = selectedTableNamesString
          .split(',')
          .map((name) => name.trim())
          .filter((name) => name.length > 0);
      }

      const filteredMetadata: DatabaseMetadataDto = {
        type: databaseType,
        schemas: {},
      };
      if (selectedTableNames.length > 0) {
        for (const qualifiedTableName of selectedTableNames) {
          let schemaName: string;
          let tableName: string;

          if (databaseType === 'sqlite') {
            // SQLite uses simple table names
            schemaName = 'default'; // or use the first available schema
            tableName = qualifiedTableName;
          } else {
            // PostgreSQL and MySQL use qualified names
            const parts = qualifiedTableName.split('.');
            schemaName = parts.length > 1 ? parts[0] : 'public';
            tableName = parts.length > 1 ? parts[1] : parts[0];
          }

          const sourceSchemaContents = metadata.schemas[schemaName] as unknown as Record<
            string,
            TableMetadataDto
          >;

          if (
            sourceSchemaContents &&
            Object.prototype.hasOwnProperty.call(sourceSchemaContents, tableName) &&
            sourceSchemaContents[tableName]
          ) {
            if (!filteredMetadata.schemas[schemaName]) {
              filteredMetadata.schemas[schemaName] = { tables: {} };
            }
            filteredMetadata.schemas[schemaName].tables[tableName] =
              sourceSchemaContents[tableName];
          } else {
            this.logger.warn(
              `[Conv: ${conversationId}] Table ${qualifiedTableName} selected by LLM but not found in original metadata.`
            );
          }
        }
      } else {
        this.logger.log(
          `[Conv: ${conversationId}] Stage 1: No tables selected or 'NONE' returned by table selector.`
        );
      }

      // Stage 2: Response Generation (SQL + Natural Language)
      const responseGeneratorSystemPrompt = {
        role: 'system',
        content: this.getDatabaseSpecificSystemPrompt(databaseType),
      };

      const responseGeneratorUserPromptContent = `I have the following ${databaseType.toUpperCase()} database structure (DDLs of relevant tables with descriptions when available):
           
      ${selectedTableNames.length > 0 || Object.keys(filteredMetadata.schemas).length > 0 ? JSON.stringify(filteredMetadata, null, 2) : 'No specific tables were pre-selected or found. The user might be asking a general question about databases.'}
       
      User's question: ${query}
       
      Please analyze the question and provide an appropriate response for ${databaseType.toUpperCase()}. Determine if SQL is needed and generate both a natural language response and SQL query if required.
      When table or column descriptions are available in the metadata, use them to provide richer context in your response and generate more accurate SQL.
      
      Remember to respond in the exact JSON format specified and use ${databaseType.toUpperCase()}-specific SQL syntax.`;

      const responseGeneratorUserPrompt = {
        role: 'user',
        content: responseGeneratorUserPromptContent,
      };

      const responseGeneratorPrompts = [responseGeneratorSystemPrompt];
      if (history && history.length > 0) {
        responseGeneratorPrompts.push(
          ...history.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }))
        );
      }
      responseGeneratorPrompts.push(responseGeneratorUserPrompt);

      const responseResult = await model.invoke(responseGeneratorPrompts);
      totalUsage.inputTokens += responseResult.usage_metadata?.input_tokens || 0;
      totalUsage.outputTokens += responseResult.usage_metadata?.output_tokens || 0;

      let response = '';
      let sql: string | undefined;

      try {
        let resultContent = '';
        if (typeof responseResult.content === 'string') {
          resultContent = responseResult.content.trim();
        } else {
          this.logger.warn(
            `[Conv: ${conversationId}] Response generator model response content was not a string.`
          );
          resultContent = 'Error extracting response from model';
        }

        console.log('resultContent', resultContent);

        // Parse the JSON response
        const parsedResponse: unknown = JSON.parse(resultContent);

        // Type guard to ensure we have the expected structure
        if (
          typeof parsedResponse === 'object' &&
          parsedResponse !== null &&
          'response' in parsedResponse &&
          typeof (parsedResponse as { response: unknown }).response === 'string'
        ) {
          response = (parsedResponse as { response: string }).response;

          // Check if SQL is needed and provided
          if (
            'needsSQL' in parsedResponse &&
            (parsedResponse as { needsSQL: unknown }).needsSQL === true &&
            'sql' in parsedResponse &&
            typeof (parsedResponse as { sql: unknown }).sql === 'string'
          ) {
            sql = (parsedResponse as { sql: string }).sql.trim();
          }
        } else {
          this.logger.warn(
            `[Conv: ${conversationId}] Invalid JSON structure received:`,
            parsedResponse
          );
          response = "I apologize, but I couldn't generate a proper response.";
        }
      } catch (error) {
        // Fallback: try to extract response and SQL manually
        let fallbackContent = '';
        if (typeof responseResult.content === 'string') {
          fallbackContent = responseResult.content.trim();
        }

        this.logger.warn(
          `[Conv: ${conversationId}] Error parsing JSON response from model: ${error instanceof Error ? error.message : String(error)}`
        );
        this.logger.debug(
          `[Conv: ${conversationId}] Failed JSON content: ${fallbackContent || 'undefined'}`
        );

        // Try to extract response text
        const responseMatch = fallbackContent.match(/"response":\s*"([^"]+)"/);
        if (responseMatch && responseMatch[1]) {
          response = responseMatch[1];
        } else {
          response =
            'I encountered an issue processing your request. Please try rephrasing your question.';
        }

        // Try to extract SQL if present
        const sqlMatch = fallbackContent.match(/"sql":\s*"([^"]+)"/);
        if (sqlMatch && sqlMatch[1]) {
          sql = sqlMatch[1].trim();
        }
      }

      const result: {
        response: string;
        conversationId: string;
        sql?: string;
        usage?: {
          inputTokens: number;
          outputTokens: number;
        };
      } = {
        response,
        conversationId,
        usage: totalUsage,
      };

      if (sql) {
        result.sql = sql;
      }

      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `[Conv: ${conversationId}] Error in chatDatabase: ${error.message}`,
          error.stack
        );
      } else {
        this.logger.error(`[Conv: ${conversationId}] Error in chatDatabase: ${String(error)}`);
      }

      return {
        response:
          "I'm sorry, but I encountered an error processing your request. Please try again.",
        conversationId: conversationId || nanoid(10),
        usage: { inputTokens: 0, outputTokens: 0 }, // Ensure usage is returned in error cases
      };
    }
  }
}
