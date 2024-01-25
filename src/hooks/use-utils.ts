export const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

export const imagePath = (name: string) => chrome.runtime.getURL(name);

export const buttonTemplate = `<button class="btn btnAction btnAction--L">
<img height="19" src="${imagePath(
  'hipro.png'
)}" width="19" alt="Calt It!"><span> Calc It! </span>
</button>&nbsp;&nbsp;`;
