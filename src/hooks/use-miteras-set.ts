import { LogError, LogWarn, LogInfo } from './use-logger';

const workStart = '10:00';
const workEnd = '19:00';
const breakStart = '12:00';
const breakEnd = '13:00';

type Project = {
  value: string;
  label: string;
  workTime: string;
};
const projects: Project[] = [
  {
    value: 'PFTSR12A40',
    label: 'PFTSR12A40 HiProDirect_追加開発7.0(資産化)',
    workTime: '220',
  },
  {
    value: 'SDEVD07B90',
    label: 'SDEVD07B90 [SD]サビ開：部署を超える業務',
    workTime: '100',
  },
];

export const useMiterasSet = () => {
  // 開始時間、終了時間、休憩時間、出社状況をセット
  const workStartElem =
    document.querySelector<HTMLInputElement>('#work-time-in');
  const workEndElem =
    document.querySelector<HTMLInputElement>('#work-time-out');
  const breakStartElem = document.getElementsByClassName(
    'formsTxtBox formsTxtBox--time break-time-input time-input work-time-in'
  )[0] as HTMLInputElement;
  const breakEndElem = document.getElementsByClassName(
    'formsTxtBox formsTxtBox--time break-time-input time-input work-time-out'
  )[0] as HTMLInputElement;

  const workTypeElem = document.getElementById(
    'arriveAtWorkId'
  ) as HTMLSelectElement;

  if (
    !workEndElem ||
    !workStartElem ||
    !breakStartElem ||
    !breakEndElem ||
    !workTypeElem
  ) {
    LogError('開始時間、終了時間、休憩時間、出社状況の要素がありません');
    return;
  }
  workStartElem.value = workStart;
  workEndElem.value = workEnd;
  breakStartElem.value = breakStart;
  breakEndElem.value = breakEnd;
  workTypeElem.value = '3'; // リモートワーク

  // プロジェクトをセット
  const projectContainer = document.querySelectorAll(
    '[id=projects-holder] .project-entry-div'
  );
  if (projectContainer.length < projects.length) {
    LogWarn('事前に用意されるべきプロジェクトのフォームが不足しています');
    return;
  }
  projects.forEach((project, index) => {
    setProject(project, index);
  });
};

const setProject = (project: Project, projIndex: number) => {
  const { value, label, workTime } = project;
  // select要素のセット
  const select = document.getElementsByClassName(
    'formsPulldown formsPulldown--S project-select select2-hidden-accessible'
  )[projIndex] as HTMLSelectElement | undefined;
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
  const selectView = document.getElementsByClassName(
    'select2-selection__rendered'
  )[projIndex] as HTMLSpanElement | undefined;
  if (!selectView) {
    LogError('selectの表示用の要素がありません');
    return;
  }
  selectView.innerHTML = label;
  selectView.title = label;

  // 工数をセット
  const workTimeElem = document.getElementsByClassName(
    'formsTxtBox formsTxtBox--S task-project-worktime'
  )[projIndex] as HTMLInputElement | undefined;
  if (!workTimeElem) {
    LogError('workTime要素がありません');
    return;
  }
  workTimeElem.value = workTime;
  // post時に非表示のものは無視されてしまうため、表示する
  const workTimeContainer1 = document.getElementsByClassName(
    'modalAction__PJTable02 tasks-items-div display-none'
  )[projIndex];
  const workTimeContainer2 = document.getElementsByClassName(
    'u_w11 u_paR4 project-worktime-input hidden'
  )[projIndex];
  if (!workTimeContainer1 || !workTimeContainer2) {
    LogError('非表示要素がありません');
    return;
  }
  workTimeContainer1.classList.remove('display-none');
  workTimeContainer2.classList.remove('hidden');
};
