import React, { createContext, useReducer, FunctionComponent, Dispatch, useContext } from 'react';
import initialState from 'store/state';
import reducer from 'store/reducer';

const Context = createContext<[Store.State, Dispatch<Store.Action>]>([initialState, () => null]);

export const useStore = () => useContext(Context);

const Store: FunctionComponent = ({ children }) => {
	const [state, update] = useReducer(reducer, initialState);
	return (
		<Context.Provider value={[state, update]} >
			{children}
		</Context.Provider>
	)
};

export default Store;
