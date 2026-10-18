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

export interface StoredAnalysis {
  signature: string;
  profile: unknown;
  createdAt?: string;
}

export interface DashboardSessionData {
  preferences?: DashboardPreferences;
  analysis?: StoredAnalysis;
  resumeText?: string;
  resumeFileName?: string;
}
