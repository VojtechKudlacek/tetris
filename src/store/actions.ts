export default {
	setInGame: ({ state }, inGame) => {
		state.inGame = inGame;
	},
	setInMenu: ({ state }, inMenu) => {
		state.inMenu = inMenu;
	},
	setIsPaused: ({ state }, isPause) => {
		state.isPaused = isPause;
	}
} as Store.Actions;
