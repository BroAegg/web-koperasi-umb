import { signDeveloperToken, verifyToken } from './lib/auth';

const token = signDeveloperToken('dev-reyvan-1760960375620', 'DEVELOPER', {
  actualRole: 'DEVELOPER',
  activeRole: 'ADMIN',
  isProduction: false,
  switchedAt: new Date().toISOString(),
});

console.log('Token:', token);
console.log('Payload:', verifyToken(token));
