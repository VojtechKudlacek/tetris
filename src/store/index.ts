import { createOvermind as createStore } from 'overmind';
import { createStateHook, createActionsHook, createEffectsHook } from 'overmind-react'
import state from 'store/state';
import actions from 'store/actions';
import effects from 'store/effects';

export const useStore = createStateHook<Store.Self>();
export const useActions = createActionsHook<Store.Self>();
export const useEffects = createEffectsHook<Store.Self>();

const store = createStore<Store.Self>({ state, actions, effects }, { devtools: false, logProxies: false });

export default store;
