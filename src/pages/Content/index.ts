import { LogInfo, LogWarn } from '../../hooks/use-logger';
import { setProjectValue } from '../../hooks/use-miteras-set';
import { autoInputButton, resetButton, sleep } from '../../hooks/use-utils';

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
  });
  observer.observe(modalElem, {
    childList: true,
    subtree: true,
  });
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
      value: 'TSGCT03A20',
      label: 'TSGCT03A20 [TS共通]HiPro ALL_MVP開発(資産化)',
      workTime: String(rate_8),
    },
    {
      value: 'PFTSR12A40',
      label: 'PFTSR12A40 HiProDirect_追加開発7.0(資産化)',
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
  dummyButtonNode.onclick = workTimeReset;
  tabBarElem.insertBefore(dummyButtonNode, tabBarElem.firstChild);
};

const workTimeReset = () => {
  LogInfo('workTimeReset');
  const workTimeElems = document.querySelectorAll(
    '[class="btnAction btnAction--S char2 clear-btn project-extra-clear-button"]'
  ) as NodeListOf<HTMLButtonElement>;
  workTimeElems.forEach((elem) => elem.click());
};
