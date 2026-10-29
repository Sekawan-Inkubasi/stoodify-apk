import { useStoodify } from '../context/StoodifyContext';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    error,
    login,
    loginDemo,
    register,
    logout,
    clearError,
  } = useStoodify();

  return {
    user,
    isAuthenticated,
    isLoading: isLoadingAuth,
    error,
    login,
    loginDemo,
    register,
    logout,
    clearError,
  };
}

export default useAuth;
