import { targetProjects } from '../model/target-projects';
import { LogError, LogWarn, LogInfo } from './use-logger';

const projectValues = targetProjects.map((p) => p.value);
export const resetWorkTime = () => {
  const projectContainer = Array.from(
    document.querySelectorAll(
      '.project-entry-div:has(.task-project-worktime:not([disabled]))'
    )
  ) as HTMLElement[];
  projectContainer.forEach((projectElem) => {
    // 対象のプロジェクトだった場合、クリアボタンを押下
    const select = projectElem.querySelector(
      '.project-select'
    ) as HTMLSelectElement;
    if (projectValues.includes(select?.value)) {
      const clearButton = projectElem.querySelector(
        '[class="btnAction btnAction--S char2 clear-btn project-extra-clear-button"]'
      ) as HTMLButtonElement;
      if (!clearButton) {
        LogError('クリアボタンがみつかりません');
        return;
      }
      clearButton.click();
    }
  });
};
