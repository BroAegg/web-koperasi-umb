export interface ConfigType {
  nest: NestConfig;
  security: SecurityConfig;
  database: DatabaseConfig;
}

export interface NestConfig {
  port: number;
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;
}

export interface DatabaseConfig {
  url: string;
}