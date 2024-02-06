import { LogError, LogInfo, LogWarn } from '../../hooks/use-logger';
import { setProjectValue } from '../../hooks/use-miteras-set';
import { resetWorkTime } from '../../hooks/use-reset-work-time';
import { autoInputButton, resetButton, sleep } from '../../hooks/use-utils';
import { targetProjects } from '../../model/target-projects';

LogInfo('content');
document.addEventListener('DOMContentLoaded', (_) => {
  LogInfo('DOMContentLoaded');

  // 「入力」のボタン群
  document
    .querySelectorAll(
      '#attendance-table-body > table > tbody > tr > td.table01__cell--status > button'
    )
    .forEach((x, i, o) => {
      LogInfo(`Add event handler ${i + 1}/${o.length}`);
      x.addEventListener('click', handler);
    });
});

let time = 0;
const handler = async () => {
  LogInfo('setAutoInputButton');
  // モーダル出現待ち
  await sleep(500);

  setAutoInputButton();
  setWorkTimeResetButton();

  // モーダル上で更新が走った場合もダミーボタンをセットする

  // const modalElem = document.querySelector('[id="daily-detail-body"]');
  const modalElem = document.querySelector(
    'div:has(>[id="daily-detail-content"])'
  );
  if (!modalElem) {
    LogWarn('モーダル要素がありません');
    return;
  }
  LogInfo('モーダル', modalElem);

  const observer = new MutationObserver((mutations) => {
    // 無限ループになる可能性があるので一応制限を設ける
    time = time + 1;
    if (time > 100) observer.disconnect();

    // ボタンが追加されていなければ追加する
    const dummyButtonNode = document.querySelector('[id="dummyButtonNode"');
    if (dummyButtonNode) return;
    LogInfo('ボタン追加');
    setAutoInputButton();
    setWorkTimeResetButton();
    LogInfo('前日をコピー時に勤務終了時間を自動でセット');
    autoWorkTimeOutSet();
  });
  observer.observe(modalElem, {
    childList: true,
    subtree: true,
  });
};

const autoWorkTimeOutSet = () => {
  const copyButtonNode = document.querySelector('[id="copy-previous-day"]');
  if (!copyButtonNode) {
    LogWarn('「前日をコピー」ボタンがありません');
    return;
  }
  if (copyButtonNode.getAttribute('disabled') === 'disabled') {
    LogInfo('「前日をコピー」ボタンを押下した状態');
    const workTimeOutNode = document.querySelector<HTMLInputElement>(
      '[id="work-time-out"'
    );
    if (!workTimeOutNode) {
      LogError('勤務終了ノードがありません');
      return;
    }
    const now = new Date();
    workTimeOutNode.value = `${now.getHours()}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    // 一度選択状態にする。しないと実働時間が更新されず500エラーが発生する
    workTimeOutNode.focus();
    workTimeOutNode.blur();
  }
};

const setAutoInputButton = () => {
  const tabBarElem = document.querySelector('.modalAction__PJtotal');
  if (!tabBarElem) {
    LogWarn('自動入力ボタンを配置する要素がありません');
    return;
  }
  LogInfo('ダミーのボタンを用意');
  const dummyButtonNode = document.createElement('span');
  dummyButtonNode.innerHTML = autoInputButton;
  dummyButtonNode.onclick = onClickAutoInputButton;
  dummyButtonNode.id = 'dummyButtonNode'; // オブザーバーで利用
  tabBarElem.insertBefore(dummyButtonNode, tabBarElem.firstChild);
};

const onClickAutoInputButton = () => {
  // セットする情報を作成する
  const totalWorkTimeElem = document.querySelector(
    '[id="total-worktime"]'
  ) as HTMLSpanElement;
  if (!totalWorkTimeElem) {
    LogWarn('総作業時間が取得できません');
    return;
  }
  // '510m' → 510
  const totalWorkTime = Number(totalWorkTimeElem.innerHTML.slice(0, -1));
  LogInfo('totalWorkTime', totalWorkTime);
  // 現在記入済みの工数の累計
  const _otherTotalTime = Array.from(
    document.querySelectorAll(
      '.task-project-worktime:not([disabled])'
    ) as NodeListOf<HTMLInputElement>
  ).map((elem) => Number(elem.value));
  const otherTotalTime = _otherTotalTime.length
    ? _otherTotalTime.reduce((sum, value) => sum + value)
    : 0;
  LogInfo('otherTotalTime', otherTotalTime);
  // 8:2にする工数
  const splitTime = totalWorkTime - otherTotalTime;
  LogInfo('splitTime', splitTime);
  const rate_8 = Math.round((splitTime / 10) * 8);
  LogInfo('rate_8', rate_8);
  const rate_2 = splitTime - rate_8;
  const projects = [
    {
      value: targetProjects.hiproAll.value,
      label: targetProjects.hiproAll.label,
      workTime: String(rate_8),
    },
    {
      value: targetProjects.hiproDirect.value,
      label: targetProjects.hiproDirect.label,
      workTime: String(rate_2),
    },
  ];

  setProjectValue(projects);
};

const setWorkTimeResetButton = () => {
  const tabBarElem = document.querySelector('.modalAction__PJtotal');
  if (!tabBarElem) {
    LogWarn('リセットボタンを配置する要素がありません');
    return;
  }
  LogInfo('ダミーのボタンを用意');
  const dummyButtonNode = document.createElement('span');
  dummyButtonNode.innerHTML = resetButton;
  dummyButtonNode.onclick = resetWorkTime;
  tabBarElem.insertBefore(dummyButtonNode, tabBarElem.firstChild);
};
