export interface DeveloperSession {
  actualRole: 'DEVELOPER';
  activeRole: string; // one of ADMIN|SUPER_ADMIN|SUPPLIER|USER|DEVELOPER
  isProduction: boolean;
  switchedAt?: string;
}

export interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role: string;
  developerSession?: DeveloperSession;
}
