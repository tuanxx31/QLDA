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
  };
};

export default useAuth;
