import useSignIn from 'react-auth-kit/hooks/useSignIn';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import type { User } from '@/types/user.type';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
const useAuth = () => {
  const signIn = useSignIn();
  const signOut = useSignOut();
  const isAuthenticated = useIsAuthenticated();
  const authUser = useAuthUser<User>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const login = (token: string, user?: User) => {
    return signIn({
      auth: {
        token,
        type: 'Bearer',
      },
      userState: user || {},
    });
  };

  const updateAuthUser = (user: User) => {
    
    const inputToken = localStorage.getItem('token_auth') || '';
    const regex = /(ey[A-Za-z0-9._-]+)/;
    const match = inputToken.match(regex);
    const token = match?.[1];
    
    if (token) {
      
      return signIn({
        auth: {
          token,
          type: 'Bearer',
        },
        userState: user,
      });
    }
    return false;
  };

  const logout = () => {
    signOut();
    queryClient.clear();
    navigate('/login');
  };

  return {
    isAuthenticated: isAuthenticated,
    authUser: authUser,
    login,
    logout,
    updateAuthUser,
  };
};

export default useAuth;
