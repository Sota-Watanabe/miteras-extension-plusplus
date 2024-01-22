export type LocalBucket = {
  workStart?: string;
  workEnd?: string;
  breakStart?: string;
  breakEnd?: string;
  projects: { value: string; label: string; workTime: string }[];
};
