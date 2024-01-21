import React from 'react';

const setValue = async () => {
  console.log('setValue');
  const queryOptions = { active: true, currentWindow: true };
  const tab = await chrome.tabs.query(queryOptions);
  chrome.tabs.sendMessage(tab[0].id as number, {
    type: 'setMiteras',
  });
};

const Popup = () => {
  return (
    <div>
      <button onClick={setValue}>セット</button>
    </div>
  );
};

export default Popup;
