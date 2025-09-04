import { ApiProperty } from '@nestjs/swagger';

export class SheetsResponseDto {
  @ApiProperty({
    description: "The agent's response to the user message",
    example:
      'To analyze your Excel data, you can upload your spreadsheet and ask specific questions about the content.',
  })
  response: string;

  @ApiProperty({
    description: 'The conversation ID to use for continuing this conversation',
    example: 'abc123xyz789',
  })
  conversationId: string;

  @ApiProperty({
    description: 'The generated code that can be executed to analyze the spreadsheet data',
    example:
      'const data = workbook.getSheet("Sheet1"); const filteredData = data.filter(row => row.Revenue > 1000);',
    required: false,
  })
  code?: string;

  @ApiProperty({
    description: 'Suggested filename for the analysis result',
    example: 'Revenue_Analysis_2023.xlsx',
    required: false,
  })
  newFileName?: string;
}
