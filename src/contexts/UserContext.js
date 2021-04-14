import React, {createContext, useReducer} from 'react';
import {intialState, UserReducer} from '../reducers/UserReducer';

export const UserContext = createContext();

export default ({children}) => {
  const [state, dispatch] = useReducer(UserReducer, intialState);

  return (
    <UserContext.Provider value={{state, dispatch}}>
      {children}
    </UserContext.Provider>
  );
};
