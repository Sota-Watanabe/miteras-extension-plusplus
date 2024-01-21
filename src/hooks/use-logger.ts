const logPrefix = '[MiTERAS++]';

export const LogError = (text: string) =>
  console.log(`${logPrefix} ERROR:`, text);
export const LogWarn = (text: string) =>
  console.log(`${logPrefix} WARN:`, text);
export const LogInfo = (text: string) =>
  console.log(`${logPrefix} INFO:`, text);
