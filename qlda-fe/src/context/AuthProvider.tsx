import Provider from 'react-auth-kit';
import type { ReactNode } from 'react';
import createAuthStore from 'react-auth-kit/store/createAuthStore';
interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  return (
    <Provider
      store={createAuthStore('localstorage', {
        authName: 'token',
        cookieDomain: window.location.hostname,
        cookieSecure: window.location.protocol === 'https:',
      })}
    >
      {children}
    </Provider>
  );
};
