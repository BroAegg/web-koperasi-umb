(async () => {
  const auth = await import('./lib/auth.js');
  const { signDeveloperToken, verifyToken } = auth;

  const token = signDeveloperToken('dev-reyvan-1760960375620', 'DEVELOPER', {
    actualRole: 'DEVELOPER',
    activeRole: 'ADMIN',
    isProduction: false,
    switchedAt: new Date().toISOString(),
  });

  console.log('Token:', token);
  const payload = verifyToken(token);
  console.log('Payload:', payload);
})();
