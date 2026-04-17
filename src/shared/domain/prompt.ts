export type PromptTemplateVars = {
  topic: string;
  image_context: string;
  style: string;
  format_rules: string;
};

const SUPPORTED_TOKENS = ['topic', 'image_context', 'style', 'format_rules'] as const;

export function interpolatePrompt(template: string, variables: PromptTemplateVars): string {
  let result = template;

  for (const token of SUPPORTED_TOKENS) {
    const placeholder = `{{${token}}}`;
    result = result.replaceAll(placeholder, variables[token]);
  }

  return result;
}
