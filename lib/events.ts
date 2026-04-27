export function dispatchAgentPrompt(prompt: string, imageUrl?: string) {
  window.dispatchEvent(new CustomEvent("agent-prompt", { detail: { prompt, imageUrl } }));
}
