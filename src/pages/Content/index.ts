import { LogError, LogInfo, LogWarn } from '../../hooks/use-logger';
import { setProjectValue } from '../../hooks/use-miteras-set';
import { resetWorkTime } from '../../hooks/use-reset-work-time';
import {
  autoInputButton,
  autoRunButton,
  resetButton,
  setPcTimeButton,
  sleep,
} from '../../hooks/use-utils';
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
      LogInfo('x', x);
      x.addEventListener('click', () => handler(x));
    });
});

let time = 0;
const handler = async (buttonElement: Element) => {
  // モーダル出現待ち
  await sleep(500);
  setAutoInputButton();
  setWorkTimeResetButton();
  setPcTimeSetButton();
  setAutoRunButton();
  deleteSaveButtonAlert();

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
    setPcTimeSetButton();
    setAutoRunButton();
    deleteSaveButtonAlert();
  });
  observer.observe(modalElem, {
    childList: true,
    subtree: true,
  });
};

const deleteSaveButtonAlert = () => {
  const saveButton = document.getElementById('request-approval-all');

  if (saveButton != null) {
    // mouseoverイベントを削除
    LogInfo('保存ボタンのmouseoverイベントを削除', saveButton);
    saveButton.addEventListener(
      'mouseover',
      (event) => {
        event.stopImmediatePropagation();
      },
      true
    );
  }
};

const setAutoRunButton = () => {
  // クラス modalAction__btnBox を持つ要素を取得
  const modalActionBtnBox = document.querySelector('.modalAction__btnBox');
  // 最後の子要素に自動実行ボタンを追加
  if (!modalActionBtnBox) {
    LogWarn('自動実行ボタンを配置する要素がありません');
    return;
  }
  LogInfo('自動実行ボタンを用意');
  const dummyButtonNode = document.createElement('span');
  dummyButtonNode.innerHTML = autoRunButton;
  dummyButtonNode.onclick = async () => {
    LogInfo('自動実行ボタンがクリックされました');
    // copy-previous-day
    const copyButtonNode = document.querySelector(
      '[id="copy-previous-day"]'
    ) as HTMLButtonElement;
    if (!copyButtonNode) {
      LogError('前日をコピーボタンが見つかりません');
      return;
    }
    copyButtonNode.click();

    const isCopyCompleted = await checkCopyCompletion();
    if (!isCopyCompleted) {
      LogError('前日をコピーが完了しませんでした');
      return;
    }

    // set-pc-time-button
    await sleep(100);
    const setPcTimeButton = document.querySelector(
      '#set-pc-time-button'
    ) as HTMLButtonElement;
    if (setPcTimeButton) {
      setPcTimeButton.click();
    } else {
      LogError('PC時間設定ボタンが見つかりません');
    }

    // set-pc-time-button
    await sleep(100);
    const resetButton = document.querySelector(
      '#reset-button'
    ) as HTMLButtonElement;
    if (resetButton) {
      resetButton.click();
    } else {
      LogError('リセットボタンが見つかりません');
    }

    // auto-input-button
    await sleep(100);
    const autoInputButton = document.querySelector(
      '#auto-input-button'
    ) as HTMLButtonElement;
    if (autoInputButton) {
      autoInputButton.click();
    } else {
      LogError('自動入力ボタンが見つかりません');
    }
  };
  // 最後に追加
  const children = modalActionBtnBox.children;
  if (children.length > 1) {
    modalActionBtnBox.insertBefore(dummyButtonNode, children[children.length]);
  } else {
    LogWarn('ボタンが1つしかありません。ダミーボタンを追加できません');
  }
};

// 0.5秒ごとにボタンの状態をチェックし、disabledになったら次の処理へ
// 10秒経ってもdisabledにならなければエラー
const checkCopyCompletion = async () => {
  const maxAttempts = 20; // 10秒 ÷ 0.5秒 = 20回
  let attempts = 0;

  while (attempts < maxAttempts) {
    await sleep(500); // 0.5秒待機
    attempts++;

    const afterCopyButtonNode = document.querySelector(
      '[id="copy-previous-day"]'
    ) as HTMLButtonElement;

    if (
      afterCopyButtonNode &&
      afterCopyButtonNode.getAttribute('disabled') === 'disabled'
    ) {
      LogInfo('前日をコピーが完了しました');
      return true;
    }
  }

  return false; // 10秒経ってもdisabledにならなかった場合
};

const setPcTimeSetButton = () => {
  // fieldsetタグのscheduler-borderクラスを取得
  const fieldsetElem = document.querySelector('fieldset.scheduler-border');
  if (!fieldsetElem) {
    LogWarn('pc時間自動入力ボタンを配置する要素がありません');
    return;
  }
  LogInfo('pc時間自動入力ボタンを用意');
  const dummyButtonNode = document.createElement('span');
  dummyButtonNode.innerHTML = setPcTimeButton;
  dummyButtonNode.onclick = onClickPcTimeSetButton;
  // fieldsetElemの1番目のdiv要素の3番目にdummyButtonNodeを追加
  const firstDiv = fieldsetElem.querySelector('div');
  if (firstDiv && firstDiv.children.length >= 2) {
    firstDiv.insertBefore(dummyButtonNode, firstDiv.children[2]);
  } else if (firstDiv) {
    firstDiv.appendChild(dummyButtonNode);
  }
};

const onClickPcTimeSetButton = () => {
  // 日付文字列
  const dateElem = document.querySelector('#daily-entry-date');
  if (!dateElem) {
    LogWarn('日付要素がありません');
    return;
  }
  const date = dateElem.textContent?.trim().slice(-2) || '';
  // dateの後ろに文字を取得

  // table01__cell--dateクラスの要素で、テキストの先頭2文字がdateと一致する要素を取得
  const dateNode = Array.from(
    document.querySelectorAll('.table01__cell--date')
  ).find((elem) => {
    const text = elem.textContent?.trim() || '';
    return text.startsWith(date);
  });
  if (!dateNode) {
    LogWarn('日付ノードが見つかりません');
    return;
  }

  // bottonElementの親の要素と同じ階層の table01__cell--time クラスの3つ目と4つ目のテキストを取得
  const parentRow = dateNode.closest('tr');

  const timeCells = parentRow?.querySelectorAll('.table01__cell--time');
  const pcStartTimeText = timeCells?.[2]?.textContent?.trim() || '';
  const pcEndTimeText = timeCells?.[3]?.textContent?.trim() || '';
  LogInfo('3つ目の時間テキスト:', pcStartTimeText);
  LogInfo('4つ目の時間テキスト:', pcEndTimeText);

  // idがwork-time-inのinput要素にpcStartTimeTextをセット
  const workTimeInNode = document.querySelector<HTMLInputElement>(
    '[id="work-time-in"]'
  );
  if (workTimeInNode) {
    workTimeInNode.value = pcStartTimeText;
  }
  // idがwork-time-outのinput要素にpcEndTimeTextをセット
  const workTimeOutNode = document.querySelector<HTMLInputElement>(
    '[id="work-time-out"]'
  );
  if (workTimeOutNode) {
    workTimeOutNode.value = pcEndTimeText;
    // 一度選択状態にする。しないと実働時間が更新されず500エラーが発生する
    workTimeOutNode.focus();
    workTimeOutNode.blur();
  }
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
  const rate_7 = Math.round((splitTime / 10) * 7);
  LogInfo('rate_8', rate_7);
  const rate_3 = splitTime - rate_7;
  const projects = [
    {
      value: targetProjects.hiproToB.value,
      label: targetProjects.hiproToB.label,
      workTime: String(rate_3),
    },
    {
      value: targetProjects.hiproToC.value,
      label: targetProjects.hiproToC.label,
      workTime: String(rate_7),
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
