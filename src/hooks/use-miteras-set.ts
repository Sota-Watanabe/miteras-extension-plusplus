import { LocalBucket } from '../model/form';
import { LogError, LogWarn, LogInfo } from './use-logger';
import { sleep } from './use-utils';

export const setProjectValue = (projects: LocalBucket['projects']) => {
  const assignProjects = projects;
  LogInfo('assignProjects', assignProjects);
  // 工数が0のプロジェクトの用意する
  setProjectForms(assignProjects);

  // 対象となるプロジェクトフォームを取得する
  const projectContainers = Array.from(
    document.querySelectorAll(
      '.project-entry-div:has(.task-project-worktime:not([disabled]))'
    )
  ) as HTMLElement[];
  const availableProjectContainer = projectContainers.filter(
    (proj) => (proj.querySelector('input') as HTMLInputElement).value === '0'
  );

  // プロジェクトフォームに工数をセットする
  availableProjectContainer.forEach((projectContainer, index) => {
    setProjectWorkTime(projectContainer, assignProjects[index]);
  });
};

const setProjectForms = (targetProjects: LocalBucket['projects']) => {
  targetProjects.forEach((targetProject) => {
    // 一旦すべてのフォームを取得
    const settingProjectTexts = document.querySelectorAll(
      '[role="textbox"]'
    ) as NodeListOf<HTMLSelectElement>;
    LogInfo('settingProjectTexts', settingProjectTexts);
    // targetProjectがすでにフォームにセットされているか確認する
    const alreadySetElem = Array.from(settingProjectTexts).find((text) =>
      text.textContent?.startsWith(targetProject.value)
    );

    if (alreadySetElem) {
      LogInfo(
        `プロジェクト ${targetProject.value} はすでにフォームにセットされているので、一旦削除`,
        alreadySetElem
      );
      alreadySetElem.closest('div')!.querySelector('button')!.click();
    }
    setProjectValueToForm(targetProject.value);
  });
};

const setProjectValueToForm = (value: string) => {
  LogInfo('setProjectValueToForm');
  // 一番最後（DOMでは最後から2番目）のフォームを取得する
  // 最後のフォームは必ず未入力のフォームなので、ここに値をセットする
  const elements = document.querySelectorAll('.project-select');
  const select = elements[elements.length - 2] as HTMLSelectElement | undefined;

  if (!select) {
    LogError('select要素がありません');
    return;
  }

  select.value = value;

  // select2:opening
  select.dispatchEvent(
    new CustomEvent('select2:opening', {
      bubbles: true,
    })
  );

  // change
  select.dispatchEvent(
    new Event('change', {
      bubbles: true,
    })
  );
};

const setProjectWorkTime = (
  containerElem: HTMLElement,
  assignProject: LocalBucket['projects'][number]
) => {
  LogInfo('assignProject', assignProject);
  const { value, workTime } = assignProject;
  // サイトの構成が複雑なのでこっちもごちゃごちゃ設定する必要がある
  // select要素のセット
  const select = containerElem.getElementsByClassName(
    'formsPulldown formsPulldown--S project-select select2-hidden-accessible'
  )[0] as HTMLSelectElement | undefined;
  if (!select) {
    LogError('select要素がありません');
    return;
  }
  LogInfo('select要素を見つけました', select);

  // valueからlabelを取得
  const existingOption = Array.from(select.options).find(
    (opt) => opt.value === value
  );
  if (!existingOption) {
    LogError(`value: ${value} に対応するoption要素がありません`);
    return;
  }
  const label = existingOption.text;

  // 裏側のselectコンポーネントの更新
  LogInfo('裏側のselectコンポーネントの更新');
  LogInfo('selectedを取り除く');
  Array.from(select.options).forEach((option) => {
    option.removeAttribute('selected');
  });

  //   こんなん作る↓
  //   <option class="option-TSGCT03A20" value="TSGCT03A20">
  //   TSGCT03A20 [TS共通]HiPro ALL_MVP開発(資産化)
  //   </option>
  const dummyOptionNode = document.createElement('option');
  dummyOptionNode.innerHTML = label;
  dummyOptionNode.className = value;
  dummyOptionNode.value = value;
  dummyOptionNode.setAttribute('selected', 'selected');
  select.appendChild(dummyOptionNode);

  // selectの表示用の要素をセット
  const selectView = containerElem.getElementsByClassName(
    'select2-selection__rendered'
  )[0] as HTMLSpanElement | undefined;
  if (!selectView) {
    LogError('selectの表示用の要素がありません');
    return;
  }
  selectView.innerHTML = label;
  selectView.title = label;

  // 工数をセット
  const workTimeElem = containerElem.getElementsByClassName(
    'formsTxtBox formsTxtBox--S task-project-worktime'
  )[0] as HTMLInputElement;
  if (!workTimeElem) {
    LogError('workTime要素がありません');
    return;
  }
  workTimeElem.value = workTime;
};
