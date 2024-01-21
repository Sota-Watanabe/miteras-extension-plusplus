import { LogInfo, LogWarn } from '../../hooks/use-logger';
import { useMiterasSet } from '../../hooks/use-miteras-set';

chrome.runtime.onMessage.addListener((request, sender) => {
  LogInfo('addListener');
  if (request.type === 'setMiteras') {
    if (!document.querySelector('[id=daily-detail-body]')) {
      LogWarn('対象の画面ではありません');
      return;
    }
    LogInfo('start useMiterasSet');
    useMiterasSet();
    LogInfo('endof useMiterasSet');
  }
});
