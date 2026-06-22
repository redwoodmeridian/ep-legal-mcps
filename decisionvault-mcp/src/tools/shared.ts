import { z, type ZodRawShape } from "zod";

export interface Tool {
  name: string;
  description: string;
  inputSchema: ZodRawShape;
  handler: (args: any) => Promise<string>;
}

/** Shared pagination params for DecisionVault list endpoints. */
export const pageParams: ZodRawShape = {
  page: z.number().int().positive().optional().describe("1-based page number."),
  page_size: z.number().int().positive().max(200).optional().describe("Results per page (max 200)."),
};

export function buildPageQuery(args: Record<string, any>): Record<string, any> {
  const q: Record<string, any> = {};
  if (args.page !== undefined) q.page = args.page;
  if (args.page_size !== undefined) q.page_size = args.page_size;
  return q;
}
