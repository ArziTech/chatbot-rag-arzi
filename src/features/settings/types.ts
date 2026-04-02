export interface AppSettings {
  siteName: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  allowRegistration: boolean;
  defaultRole?: number;
  sessionTimeout: number;
}

export interface SettingsInput {
  siteName?: string;
  siteUrl?: string;
  logo?: string;
  favicon?: string;
  allowRegistration?: boolean;
  defaultRole?: number;
  sessionTimeout?: number;
}

// ============================================
// User AI Preferences
// ============================================

export interface UserPreferences {
  defaultModel: string;
  defaultProvider: string;
  hasOpenAIKey: boolean;
  hasAnthropicKey: boolean;
}

export interface UpdatePreferencesInput {
  openaiKey?: string | null;
  anthropicKey?: string | null;
  defaultModel?: string;
  defaultProvider?: string;
}

export const AVAILABLE_MODELS = [
  // OpenAI
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "openai" },
  // Anthropic
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "anthropic" },
  { id: "claude-3-opus-20240229", name: "Claude 3 Opus", provider: "anthropic" },
  { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", provider: "anthropic" },
  // Ollama
  { id: "llama3", name: "Llama 3", provider: "ollama" },
  { id: "mistral", name: "Mistral", provider: "ollama" },
  { id: "nomic-embed-text", name: "Nomic Embed Text", provider: "ollama" },
] as const;

export const PROVIDERS = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "ollama", name: "Ollama (Local)" },
] as const;
