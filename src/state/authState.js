import { useReducer } from 'react';

type AuthState = {
  isAuthenticated: boolean;
  user: string | null;
};

type AuthAction = 
  | { type: 'LOGIN'; payload: string }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
}

export function useAuthState() {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (user: string) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return {
    state,
    login,
    logout,
  };
}