const { z } = require('zod');

const inputSchema = z.object({
  title: z.string().min(1).max(500),
  price: z.number(),
  availability: z.string(),
});

const outputSchema = z.object({
  category: z.enum(['fiction', 'non-fiction', 'childrens', 'other']),
  summary: z.string(),
  confidence: z.number().min(0).max(1),
});

module.exports = { inputSchema, outputSchema };