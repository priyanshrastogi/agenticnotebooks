import { registerAs } from '@nestjs/config';

export default registerAs('agent', () => ({
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4.1',
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-7-sonnet-latest',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
}));
