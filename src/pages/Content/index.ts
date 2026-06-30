import { LogError, LogInfo, LogWarn } from '../../hooks/use-logger';
import { setProjectValue } from '../../hooks/use-miteras-set';
import {
  autoInputButton,
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
  setPcTimeSetButton();
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
    LogInfo('前日をコピー時に勤務終了時間を自動でセット');
    autoWorkTimeOutSet();
    setPcTimeSetButton();
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

  // breaktime1配下の休憩開始・終了時刻に12:00と13:00を入力
  const breaktime1Elem = document.querySelector('#breaktime1');
  if (breaktime1Elem) {
    const breakTimeInNode = breaktime1Elem.querySelector<HTMLInputElement>('.work-time-in');
    const breakTimeOutNode = breaktime1Elem.querySelector<HTMLInputElement>('.work-time-out');
    if (breakTimeInNode) {
      breakTimeInNode.value = '12:00';
      breakTimeInNode.focus();
      breakTimeInNode.blur();
    }
    if (breakTimeOutNode) {
      breakTimeOutNode.value = '13:00';
      breakTimeOutNode.focus();
      breakTimeOutNode.blur();
    }
  } else {
    LogWarn('breaktime1要素がありません');
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
  const AllWorkTimeTextBox = Array.from(
    document.querySelectorAll(
      '.task-project-worktime:not([disabled])'
    ) as NodeListOf<HTMLInputElement>
  );
  let otherTotalTime = 0;

  if (AllWorkTimeTextBox.length !== 0) {
    // 計算対象外のプロジェクトを除外した工数のテキストボックスを取得する
    const OtherWorkTimeTextBox = AllWorkTimeTextBox.filter((textBox) => {
      const text = textBox
        .closest('div')!
        .querySelector('[role="textbox"]')!.textContent;
      const projectValues = targetProjects.map((project) => project.value);
      return !projectValues.some((value) => text?.startsWith(value));
    });
    otherTotalTime = OtherWorkTimeTextBox.reduce(
      (sum, textBox) => sum + Number(textBox.value),
      0
    );
  }

  LogInfo('otherTotalTime', otherTotalTime);

  const splitTime = totalWorkTime - otherTotalTime;
  LogInfo('splitTime', splitTime);
  const totalRatio = targetProjects.reduce((sum, p) => sum + p.ratio, 0);
  if (totalRatio !== 100) {
    LogError(`ratioの合計が100ではありません: ${totalRatio}`);
    return;
  }
  const allocated = targetProjects.map((p, i) => {
    if (i === targetProjects.length - 1) return 0; // 最後は余りで計算
    return Math.round((splitTime / totalRatio) * p.ratio);
  });
  const lastTime =
    splitTime - allocated.slice(0, -1).reduce((s, v) => s + v, 0);
  allocated[allocated.length - 1] = lastTime;
  const projects = targetProjects.map((p, i) => ({
    value: p.value,
    workTime: String(allocated[i]),
  }));

  setProjectValue(projects);
};
