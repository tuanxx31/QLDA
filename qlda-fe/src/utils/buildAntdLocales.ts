import type { Locale } from 'antd/es/locale';
import viVN from 'antd/locale/vi_VN';


const buildAntdLocales = (locales: Record<string, Locale>) => {
  return Object.entries(locales).reduce((acc, [key, value]) => {
    const datePicker = value?.DatePicker;

    return {
      ...acc,
      [key]: {
        ...value,
        DatePicker: datePicker
          ? {
              ...datePicker,
              lang: {
                ...datePicker.lang,
                dateFormat: 'DD-MM-YYYY',
                dateTimeFormat: 'DD-MM-YYYY HH:mm:ss',
                fieldDateFormat: 'DD-MM-YYYY',
                fieldDateTimeFormat: 'DD-MM-YYYY HH:mm:ss',
              },
            }
          : undefined,
      },
    };
  }, {});
};


export const antdLocales: Record<string, Locale> = buildAntdLocales({
  vi: viVN,
});


export default antdLocales.vi;
