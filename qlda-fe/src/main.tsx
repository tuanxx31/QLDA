import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { ProConfigProvider, viVNIntl } from '@ant-design/pro-components';
import { ConfigProvider, App as AntdApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import dayjs from 'dayjs';
import 'dayjs/locale/vi';
dayjs.locale('vi');

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ProConfigProvider intl={viVNIntl}>
            <ConfigProvider locale={viVN}>
              <AntdApp>
                <App />
              </AntdApp>
            </ConfigProvider>
          </ProConfigProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
