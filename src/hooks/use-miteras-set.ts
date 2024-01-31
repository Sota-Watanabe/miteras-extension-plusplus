import { LocalBucket } from '../model/form';
import { LogError, LogWarn, LogInfo } from './use-logger';

export const setProjectValue = (projects: LocalBucket['projects']) => {
  const assignProjects = projects;
  LogInfo('assignProjects', assignProjects);
  // プロジェクトをセット
  // 「工数が 0 のプロジェクト」の数を確認
  const projectContainer = getEnoughAvailableProjectContainer();
  LogInfo('projectContainer', projectContainer);
  if (projectContainer.length < assignProjects.length) {
    LogWarn('工数が 0 のプロジェクトのフォームが不足しています');
    return;
  }
  projectContainer.forEach((projectContainer, index) => {
    setProject(projectContainer, assignProjects[index]);
  });
};

// project コンテナの条件は「disabled ではない且つ、value が 0 ではない」もの
const getEnoughAvailableProjectContainer = () => {
  const projectContainer = Array.from(
    document.querySelectorAll(
      '.project-entry-div:has(.task-project-worktime:not([disabled]))'
    )
  ) as HTMLElement[];
  const availableProjectContainer = projectContainer.filter(
    (proj) => (proj.querySelector('input') as HTMLInputElement).value === '0'
  );
  return availableProjectContainer.filter((v) => !!v);
};

const setProject = (
  containerElem: HTMLElement,
  assignProject: LocalBucket['projects'][number]
) => {
  LogInfo('assignProject', assignProject);
  const { value, label, workTime } = assignProject;
  // サイトの構成が複雑なのでこっちもごちゃごちゃ設定する必要がある
  // select要素のセット
  const select = containerElem.getElementsByClassName(
    'formsPulldown formsPulldown--S project-select select2-hidden-accessible'
  )[0] as HTMLSelectElement | undefined;
  if (!select) {
    LogError('select要素がありません');
    return;
  }

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
