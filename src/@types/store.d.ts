declare namespace Store {
	interface Self {
		state: State;
		actions: Actions;
		effects: Effects;
	}

	interface State {
		isPaused: boolean;
		inGame: boolean;
		inMenu: boolean;
	}

	type Action<Value = void, ReturnValue = void> = (store: Self, value: Value) => ReturnValue;

	interface Actions {
		setIsPaused: Action<boolean>;
		setInGame: Action<boolean>;
		setInMenu: Action<boolean>;
	}

	interface Effects { }
}
