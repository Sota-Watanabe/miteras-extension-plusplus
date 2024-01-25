import { LocalBucket } from '../model/form';
import { LogError, LogWarn, LogInfo } from './use-logger';

// const workStart = '10:00';
// const workEnd = '19:00';
// const breakStart = '12:00';
// const breakEnd = '13:00';

// const assignProjects: Project[] = [
//   {
//     value: 'PFTSR12A40',
//     label: 'PFTSR12A40 HiProDirect_追加開発7.0(資産化)',
//     workTime: '220',
//   },
//   {
//     value: 'SDEVD07B90',
//     label: 'SDEVD07B90 [SD]サビ開：部署を超える業務',
//     workTime: '100',
//   },
// ];

export const useMiterasSet = (storage: LocalBucket) => {
  // // 開始時間、終了時間、休憩時間、出社状況をセット
  // const workStartElem =
  //   document.querySelector<HTMLInputElement>('#work-time-in');
  // const workEndElem =
  //   document.querySelector<HTMLInputElement>('#work-time-out');
  // const breakStartElem = document.getElementsByClassName(
  //   'formsTxtBox formsTxtBox--time break-time-input time-input work-time-in'
  // )[0] as HTMLInputElement;
  // const breakEndElem = document.getElementsByClassName(
  //   'formsTxtBox formsTxtBox--time break-time-input time-input work-time-out'
  // )[0] as HTMLInputElement;

  // const workTypeElem = document.getElementById(
  //   'arriveAtWorkId'
  // ) as HTMLSelectElement;

  // if (
  //   !workEndElem ||
  //   !workStartElem ||
  //   !breakStartElem ||
  //   !breakEndElem ||
  //   !workTypeElem
  // ) {
  //   LogError('開始時間、終了時間、休憩時間、出社状況の要素がありません');
  //   return;
  // }
  // if (storage.workStart) workStartElem.value = storage.workStart;
  // if (storage.workEnd) workEndElem.value = storage.workEnd;
  // if (storage.breakStart) breakStartElem.value = storage.breakStart;
  // if (storage.breakEnd) breakEndElem.value = storage.breakEnd;
  // workTypeElem.value = '3'; // リモートワーク

  const assignProjects = storage.projects;
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

  // select要素のセット
  const select = containerElem.getElementsByClassName(
    'formsPulldown formsPulldown--S project-select select2-hidden-accessible'
  )[0] as HTMLSelectElement | undefined;
  if (!select) {
    LogError('select要素がありません');
    return;
  }

  for (var i = 0; i < select.options.length; i++) {
    if (select.options[i].value === value) {
      select.options[i].selected = true;
    }
  }

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
