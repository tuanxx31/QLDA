import { viVNIntl } from '@ant-design/pro-components';
import dayjs from 'dayjs';

/**
 * Cấu hình quốc tế hóa và định dạng ngày mặc định cho ProComponents
 */
export const proConfig = {
  intl: viVNIntl,
  valueTypeMap: {
    date: {
      render: (text: string) => (text ? dayjs(text).format('DD-MM-YYYY') : '-'),
    },
    dateTime: {
      render: (text: string) =>
        text ? dayjs(text).format('DD-MM-YYYY HH:mm:ss') : '-',
    },
    dateRange: {
      render: (text: string[]) =>
        text && text.length === 2
          ? `${dayjs(text[0]).format('DD-MM-YYYY')} ~ ${dayjs(text[1]).format('DD-MM-YYYY')}`
          : '-',
    },
    dateTimeRange: {
      render: (text: string[]) =>
        text && text.length === 2
          ? `${dayjs(text[0]).format('DD-MM-YYYY HH:mm:ss')} ~ ${dayjs(text[1]).format('DD-MM-YYYY HH:mm:ss')}`
          : '-',
    },
  },
};
