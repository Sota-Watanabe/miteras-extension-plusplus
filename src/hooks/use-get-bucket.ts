import { useEffect, useState } from 'react';
import { getBucket } from '@extend-chrome/storage';
import { LocalBucket } from '../model/form';

export const useLocalStorage = (): [LocalBucket | undefined, typeof bucket] => {
  const [storage, setStorage] = useState<LocalBucket>();

  const bucket = getBucket<LocalBucket>('bucket');

  useEffect(() => {
    bucket.get().then((value) => {
      setStorage(value);
    });
  }, []);

  return [storage, bucket];
};
