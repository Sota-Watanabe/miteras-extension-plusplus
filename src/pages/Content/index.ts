import { LogInfo, LogWarn } from '../../hooks/use-logger';
import { useMiterasSet } from '../../hooks/use-miteras-set';
import { getBucket } from '@extend-chrome/storage';
import { LocalBucket } from '../../model/form';

chrome.runtime.onMessage.addListener(async (request, sender) => {
  const bucket = getBucket<LocalBucket>('bucket');
  LogInfo('addListener');
  if (request.type === 'setMiteras') {
    if (!document.querySelector('[id=daily-detail-body]')) {
      LogWarn('対象の画面ではありません');
      return;
    }
    const value = await bucket.get();
    LogInfo('value', value);
    useMiterasSet(value);
  }
});
