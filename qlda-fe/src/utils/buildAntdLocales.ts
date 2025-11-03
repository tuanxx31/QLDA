import type { Locale } from 'antd/es/locale';
import viVN from 'antd/locale/vi_VN';

/**
 * Tự động thêm định dạng ngày DD-MM-YYYY cho tất cả DatePicker của Ant Design
 * để đồng bộ hiển thị trong toàn bộ ứng dụng.
 */
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

// ✅ Tạo object locales có thể mở rộng thêm en_US, fr_FR... sau này
export const antdLocales: Record<string, Locale> = buildAntdLocales({
  vi: viVN,
});

// ✅ Export ra để dùng trong ConfigProvider
export default antdLocales.vi;
