import { LogInfo } from '../../hooks/use-logger';
import { LocalBucket } from '../../model/form';
import { getBucket } from '@extend-chrome/storage';

LogInfo('background');
const bucket = getBucket<LocalBucket>('bucket');
const value = await bucket.get();
if (!value) {
  bucket.set({
    workStart: '10:00',
    workEnd: '19:00',
    breakStart: '12:00',
    breakEnd: '13:00',
  });
}
