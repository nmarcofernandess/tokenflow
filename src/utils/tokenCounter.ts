// Função simples para estimar tokens (aproximadamente 4 caracteres = 1 token)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function formatTokenCount(tokens: number): string {
  // Sempre formatar em k
  return `${(tokens / 1000).toFixed(1)}k tokens`.replace('.0k', 'k');
} 