export interface StructuredPromptConfig<T> {
  prompt: string;
  schema: Record<string, unknown>;
  description: string;
}
