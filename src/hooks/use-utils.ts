export const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

export const imagePath = (name: string) => chrome.runtime.getURL(name);

export const autoInputButton = `<button class="btn btnAction btnAction--L">
<img height="19" src="${imagePath(
  'hipro.png'
)}" width="19" alt="Calt It!"><span> Calc It! </span>
</button>&nbsp;&nbsp;`;

export const resetButton = `<button class="btn btnAction btnAction--L">
<img height="19" src="${imagePath(
  'hipro.png'
)}" width="19" alt="set 0!"><span> Set 0! </span>
</button>&nbsp;&nbsp;`;
