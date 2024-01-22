import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { LogInfo } from '../../hooks/use-logger';
import { useLocalStorage } from '../../hooks/use-get-bucket';

const setValue = async () => {
  const queryOptions = { active: true, currentWindow: true };
  const tab = await chrome.tabs.query(queryOptions);
  chrome.tabs.sendMessage(tab[0].id as number, {
    type: 'setMiteras',
  });
};

const Popup = () => {
  const [storage, bucket] = useLocalStorage();
  LogInfo('popup', storage);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: storage,
  });
  useEffect(() => {
    reset(storage);
  }, [storage]);

  const onsubmit = async (value: any) => {
    LogInfo('onsubmit', value);
    await bucket.set((prev) => ({ ...prev, ...value }));

    setValue();
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onsubmit)}>
        <div>
          開始時間:&emsp;
          <input {...register('workStart')} />
        </div>
        <div>
          終了時間:&emsp;
          <input {...register('workEnd')} />
        </div>
        <input type="submit" value="保存" />
      </form>
    </div>
  );
};

export default Popup;
