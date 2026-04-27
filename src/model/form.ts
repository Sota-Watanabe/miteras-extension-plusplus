export type LocalBucket = {
  workStart?: string;
  workEnd?: string;
  breakStart?: string;
  breakEnd?: string;
  projects: { value: string; workTime: string }[];
};
