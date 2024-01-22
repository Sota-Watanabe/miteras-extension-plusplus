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

type Form = { hiproWorkTime?: string };

const Popup = () => {
  const [storage, bucket] = useLocalStorage();
  LogInfo('popup', storage);
  const { register, handleSubmit } = useForm<Form>();
  // useEffect(() => {
  //   reset(storage);
  // }, [storage]);

  const onsubmit = async (value: Form) => {
    LogInfo('onsubmit', value);
    const sumTime = Number(value.hiproWorkTime);
    LogInfo('sumTime', sumTime);
    const rate_8 = Math.round((sumTime / 10) * 8);
    LogInfo('rate_8', rate_8);
    const rate_2 = sumTime - rate_8;
    const projects = [
      {
        value: 'TSGCT03A20',
        label: 'TSGCT03A20 [TS共通]HiPro ALL_MVP開発(資産化)',
        workTime: String(rate_8),
      },
      {
        value: 'PFTSR12A40',
        label: 'PFTSR12A40 HiProDirect_追加開発7.0(資産化)',
        workTime: String(rate_2),
      },
    ];
    await bucket.set((prev) => ({ ...prev, projects }));

    setValue();
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onsubmit)}>
        <div>
          <p>
            「HiPro
            ALL_MVP開発(資産化)」と「HiProDirect_追加開発7.0(資産化)」を8:2にする時間を入力
          </p>
          <input {...register('hiproWorkTime')} />
        </div>
        <input type="submit" value="保存" />
      </form>
    </div>
  );
};

export default Popup;
