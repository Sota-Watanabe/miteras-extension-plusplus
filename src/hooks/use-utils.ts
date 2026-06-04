export const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

export const imagePath = (name: string) => chrome.runtime.getURL(name);

export const autoInputButton = `<button class="btn btnAction btnAction--L" id="auto-input-button">
<img height="19" src="${imagePath(
  'hipro.png'
)}" width="19" alt="Calt It!"><span> Set It! </span>
</button>&nbsp;&nbsp;`;

export const setPcTimeButton = `<button type="button" class="btn btnAction btnAction--S u_maL7 char2 delete-breaktime-btn" id="set-pc-time-button">
<span style="line-height: normal;">PC時間 <span>
<img height="15" src="${imagePath('pc.png')}" width="19" alt="set 0!">
</button>`;
