const logPrefix = '[MiTERAS++]';

export const LogError = (...props: any[]) =>
  console.log(`${logPrefix} ERROR:`, ...props);
export const LogWarn = (...props: any[]) =>
  console.log(`${logPrefix} WARN:`, ...props);
export const LogInfo = (...props: any[]) =>
  console.log(`${logPrefix} INFO:`, ...props);
