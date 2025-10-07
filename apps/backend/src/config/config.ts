import { ConfigType } from './config.types';

export const config = (): ConfigType => ({
  nest: {
    port: 3001,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-token',
    jwtExpiresIn: '2d',
    bcryptSaltRounds: 10,
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/koperasi_umb',
  },
});