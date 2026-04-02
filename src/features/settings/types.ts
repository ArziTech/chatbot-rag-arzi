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
