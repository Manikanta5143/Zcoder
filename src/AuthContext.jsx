import React, { createContext, useEffect, useReducer } from 'react';

export const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isEdited: false,
};

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'signup':
      // usually signup means user is authenticated after signup
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'login':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isEdited: false,
      };
    case 'profileEdit':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload, // merge updated fields
        },
        isEdited: true,
      };
    case 'logout':
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      dispatch({ type: 'login', payload: user });
    }
  }, []);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [state.user]);

  console.log('AuthContext state:', state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
