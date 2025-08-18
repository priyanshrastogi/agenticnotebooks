import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

import {
  DatabaseMetadataDto,
  MessageDto,
  TableMetadataDto,
} from '@/modules/agent/dto/database-request.dto';

@Injectable()
export class DatabaseAgent {
  private readonly logger = new Logger(DatabaseAgent.name);
  private openAIModel: ChatOpenAI;
  private anthropicModel: ChatAnthropic;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    try {
      this.openAIModel = new ChatOpenAI({
        modelName: this.configService.get<string>('agent.openaiModel'),
        openAIApiKey:
          this.configService.getOrThrow<string>('agent.openaiApiKey'),
        temperature: 0.1,
      });

      this.anthropicModel = new ChatAnthropic({
        modelName: this.configService.get<string>('agent.anthropicModel'),
        anthropicApiKey: this.configService.getOrThrow<string>(
          'agent.anthropicApiKey',
        ),
        temperature: 0.1,
      });

      this.logger.log('DatabaseAgent initialized');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Error initializing DatabaseAgent: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Error initializing DatabaseAgent: ${String(error)}`);
      }
    }
  }

  async chatWithDatabase(
    query: string,
    metadata: DatabaseMetadataDto,
    conversationId: string,
    history?: MessageDto[],
    preferredLLMProvider?: string,
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
      this.logger.log(
        `Processing database query for conversation ${conversationId}`,
      );

      const totalUsage = { inputTokens: 0, outputTokens: 0 };

      // Extract database type from metadata
      const databaseType = metadata.type || 'postgres';
      this.logger.log(
        `[Conv: ${conversationId}] Database type: ${databaseType}`,
      );

      // Select model based on preferredLLMProvider
      let model: ChatOpenAI | ChatAnthropic;
      if (preferredLLMProvider === 'anthropic') {
        model = this.anthropicModel;
      } else {
        model = this.openAIModel;
      }

      // Stage 1: Table Selection
      const allTableNames: string[] = [];
      for (const schemaName in metadata.schemas) {
        const schemaContents = metadata.schemas[
          schemaName
        ] as unknown as Record<string, TableMetadataDto>;
        if (schemaContents) {
          for (const tableName in schemaContents) {
            if (
              Object.prototype.hasOwnProperty.call(schemaContents, tableName)
            ) {
              if (databaseType === 'sqlite') {
                allTableNames.push(tableName);
              } else {
                allTableNames.push(`${schemaName}.${tableName}`);
              }
            }
          }
        } else {
          this.logger.warn(
            `[Conv: ${conversationId}] Schema ${schemaName} found but content is undefined.`,
          );
        }
      }

      const tableSelectorSystemPrompt = {
        role: 'system',
        content: `You are an expert database assistant. Your task is to identify the relevant tables needed to answer a user's question based on a provided list of table names.
        ${
          databaseType === 'sqlite'
            ? 'The table names are simple names without schema prefixes (SQLite format).'
            : `The table names are in the format "${databaseType === 'mysql' ? 'database.table' : 'schema.table'}".`
        }
        Respond with a comma-separated list of the selected table names.
        If no tables seem relevant, respond with an empty string or "NONE".
        Only include table names from the provided list. Do not invent new table names.
        Focus solely on selecting tables, do not attempt to generate SQL or answer the question directly.`,
      };

      const tableSelectorUserPrompt = {
        role: 'user',
        content: `Given the following tables:\n        ${allTableNames.join('\\n')}\n        \n        And the user's question: "${query}"\n        \n        Which tables are most relevant to answer this question? Please provide a comma-separated list of their ${databaseType === 'sqlite' ? 'names' : 'fully qualified names'}.`,
      };

      const tableSelectorPrompts = [
        tableSelectorSystemPrompt,
        tableSelectorUserPrompt,
      ];

      if (history && history.length > 0) {
        const historyMessages = history.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
        tableSelectorPrompts.splice(1, 0, ...historyMessages);
      }

      const tableSelectorResult = await model.invoke(tableSelectorPrompts);
      totalUsage.inputTokens +=
        tableSelectorResult.usage_metadata?.input_tokens || 0;
      totalUsage.outputTokens +=
        tableSelectorResult.usage_metadata?.output_tokens || 0;

      let selectedTableNamesString = '';
      if (typeof tableSelectorResult.content === 'string') {
        selectedTableNamesString = tableSelectorResult.content.trim();
      } else {
        this.logger.warn(
          `[Conv: ${conversationId}] Stage 1: Table selector response was not a string.`,
        );
      }

      let selectedTableNames: string[] = [];
      if (
        selectedTableNamesString &&
        selectedTableNamesString.toUpperCase() !== 'NONE'
      ) {
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
            schemaName = 'default';
            tableName = qualifiedTableName;
          } else {
            const parts = qualifiedTableName.split('.');
            schemaName = parts.length > 1 ? parts[0] : 'public';
            tableName = parts.length > 1 ? parts[1] : parts[0];
          }

          const sourceSchemaContents = metadata.schemas[
            schemaName
          ] as unknown as Record<string, TableMetadataDto>;

          if (
            sourceSchemaContents &&
            Object.prototype.hasOwnProperty.call(
              sourceSchemaContents,
              tableName,
            ) &&
            sourceSchemaContents[tableName]
          ) {
            if (!filteredMetadata.schemas[schemaName]) {
              filteredMetadata.schemas[schemaName] = { tables: {} };
            }
            filteredMetadata.schemas[schemaName].tables[tableName] =
              sourceSchemaContents[tableName];
          } else {
            this.logger.warn(
              `[Conv: ${conversationId}] Table ${qualifiedTableName} selected but not found in metadata.`,
            );
          }
        }
      } else {
        this.logger.log(
          `[Conv: ${conversationId}] Stage 1: No tables selected.`,
        );
      }

      // Stage 2: Response Generation (SQL + Natural Language)
      const responseGeneratorSystemPrompt = {
        role: 'system',
        content: this.getDatabaseSpecificSystemPrompt(databaseType),
      };

      const responseGeneratorUserPromptContent = `I have the following ${databaseType.toUpperCase()} database structure (DDLs of relevant tables):
           
      ${selectedTableNames.length > 0 || Object.keys(filteredMetadata.schemas).length > 0 ? JSON.stringify(filteredMetadata, null, 2) : 'No specific tables were pre-selected or found. The user might be asking a general question about databases.'}
       
      User's question: ${query}
       
      Please analyze the question and provide an appropriate response for ${databaseType.toUpperCase()}. Determine if SQL is needed and generate both a natural language response and SQL query if required.
      
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
          })),
        );
      }
      responseGeneratorPrompts.push(responseGeneratorUserPrompt);

      const responseResult = await model.invoke(responseGeneratorPrompts);
      totalUsage.inputTokens +=
        responseResult.usage_metadata?.input_tokens || 0;
      totalUsage.outputTokens +=
        responseResult.usage_metadata?.output_tokens || 0;

      let response = '';
      let sql: string | undefined;

      try {
        let resultContent = '';
        if (typeof responseResult.content === 'string') {
          resultContent = responseResult.content.trim();
        } else {
          this.logger.warn(
            `[Conv: ${conversationId}] Response generator response was not a string.`,
          );
          resultContent = 'Error extracting response from model';
        }

        // Clean up JSON if it contains markdown code blocks
        if (resultContent.includes('```json')) {
          const jsonMatch = resultContent.match(/```json\s*([\s\S]*?)```/);
          if (jsonMatch && jsonMatch[1]) {
            resultContent = jsonMatch[1].trim();
            this.logger.debug(
              `[Conv: ${conversationId}] Extracted from JSON code block`,
            );
          }
        } else if (
          resultContent.includes('```') &&
          !resultContent.trim().startsWith('{')
        ) {
          const jsonMatch = resultContent.match(/```\s*([\s\S]*?)```/);
          if (
            jsonMatch &&
            jsonMatch[1] &&
            jsonMatch[1].trim().startsWith('{')
          ) {
            resultContent = jsonMatch[1].trim();
            this.logger.debug(
              `[Conv: ${conversationId}] Extracted from generic code block`,
            );
          }
        }

        // Parse the JSON response
        const parsedResponse: unknown = JSON.parse(resultContent);

        if (
          typeof parsedResponse === 'object' &&
          parsedResponse !== null &&
          'response' in parsedResponse &&
          typeof (parsedResponse as { response: unknown }).response === 'string'
        ) {
          response = (parsedResponse as { response: string }).response;

          if (
            'needsSQL' in parsedResponse &&
            (parsedResponse as { needsSQL: unknown }).needsSQL === true &&
            'sql' in parsedResponse &&
            typeof (parsedResponse as { sql: unknown }).sql === 'string'
          ) {
            sql = (parsedResponse as { sql: string }).sql.trim();

            if (sql && sql.includes('```')) {
              const sqlMatch = sql.match(/```(?:sql)?\s*([\s\S]*?)```/);
              if (sqlMatch && sqlMatch[1]) {
                sql = sqlMatch[1].trim();
              }
            }
          }
        } else {
          this.logger.warn(
            `[Conv: ${conversationId}] Invalid JSON structure received:`,
            parsedResponse,
          );
          response = "I apologize, but I couldn't generate a proper response.";
        }
      } catch (error) {
        let fallbackContent = '';
        if (typeof responseResult.content === 'string') {
          fallbackContent = responseResult.content.trim();
        }

        this.logger.warn(
          `[Conv: ${conversationId}] Error parsing JSON response: ${error instanceof Error ? error.message : String(error)}`,
        );
        this.logger.debug(
          `[Conv: ${conversationId}] Failed JSON content: ${fallbackContent || 'undefined'}`,
        );

        const responseMatch = fallbackContent.match(/"response":\s*"([^"]+)"/);
        if (responseMatch && responseMatch[1]) {
          response = responseMatch[1];
        } else {
          response =
            'I encountered an issue processing your request. Please try rephrasing your question.';
        }

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
          `[Conv: ${conversationId}] Error in chatWithDatabase: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `[Conv: ${conversationId}] Error in chatWithDatabase: ${String(error)}`,
        );
      }

      return {
        response:
          "I'm sorry, but I encountered an error processing your request. Please try again.",
        conversationId: conversationId || nanoid(10),
        usage: { inputTokens: 0, outputTokens: 0 },
      };
    }
  }

  private getDatabaseSpecificSystemPrompt(
    databaseType: 'postgres' | 'mysql' | 'sqlite',
  ): string {
    const basePrompt = `You are an expert ${databaseType.toUpperCase()} database assistant. 
    
    Your task is to:
    1. Analyze the user's question
    2. Determine if SQL is needed to answer it
    3. Generate an appropriate response
    
    RESPONSE FORMAT:
    You must respond with a JSON object in this exact format:
    {
      "needsSQL": boolean,
      "response": "natural language response here",
      "sql": "SQL query here (only if needsSQL is true)"
    }
    
    IMPORTANT RULES:
    - If the question can be answered without querying data, set needsSQL to false and provide a helpful response
    - If SQL is needed, set needsSQL to true and include both response and sql fields
    - Always use ${databaseType.toUpperCase()}-specific SQL syntax
    - Keep responses concise but informative
    - Ensure SQL queries are safe and efficient`;

    const databaseSpecificNotes = {
      postgres: `
      PostgreSQL-specific notes:
      - Use double quotes for identifiers when needed
      - Support for window functions, CTEs, and advanced features
      - Use $1, $2, etc. for parameterized queries when applicable
      - Default schema is usually 'public'`,
      mysql: `
      MySQL-specific notes:
      - Use backticks for identifiers when needed
      - Be aware of MySQL-specific functions and syntax
      - Use ? for parameterized queries when applicable
      - Default database context depends on connection`,
      sqlite: `
      SQLite-specific notes:
      - Simpler syntax, no schema prefixes needed
      - Limited support for some advanced SQL features
      - Use ? for parameterized queries when applicable
      - All tables are in the main database`,
    };

    return basePrompt + databaseSpecificNotes[databaseType];
  }
}
