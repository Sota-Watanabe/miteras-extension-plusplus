const logPrefix = '[MiTERAS++]';

export const LogError = (text: any) => console.log(`${logPrefix} ERROR:`, text);
export const LogWarn = (text: any) => console.log(`${logPrefix} WARN:`, text);
export const LogInfo = (text: any) => console.log(`${logPrefix} INFO:`, text);
