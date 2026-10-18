export type ThemeMode = 'light' | 'dark';

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  resume?: string;
  twitter?: string;
  portfolio?: string;
  devto?: string;
}

export interface DashboardPreferences {
  theme?: ThemeMode;
  links?: Partial<SocialLinks>;
}

export interface AnalysisSessionData {
  signature: string;
  profile: unknown;
}

export interface DashboardSessionData {
  preferences?: DashboardPreferences;
  analysis?: AnalysisSessionData;
}
