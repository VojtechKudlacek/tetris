interface HoldableOptionsBase<T = boolean> {
	LEFT: T;
	RIGHT: T;
	DOWN: T;
	UP: T;
}

interface PressableOptionsBase<T = boolean> {
	PAUSE: T;
	ROTATE_LEFT: T;
	ROTATE_RIGHT: T;
}

interface StoredCustomKeys {
	holdableKeys: HoldableOptions<number>;
	pressableKeys: PressableOptions<number>;
}

type HoldableOptions<T> = HoldableOptionsBase<T> & Dictionary<T>;

type PressableOptions<T> = PressableOptionsBase<T> & Dictionary<T>;

type KeyValues = HoldableOptions<boolean | null> & PressableOptions<boolean | null>;

class ControlManager {

	//* Private readonly

	private readonly STORAGE_KEY: string = 'controls';

	private readonly DEFAULT_HOLDABLE_KEYS: HoldableOptions<number> = {
		LEFT: 37,
		RIGHT: 39,
		DOWN: 40,
		UP: 38,
	};

	private readonly DEFAULT_PRESSABLE_KEYS: PressableOptions<number> = {
		PAUSE: 80,
		ROTATE_LEFT: 65,
		ROTATE_RIGHT: 83,
	};

	//* Private

	private holdableKeys!: HoldableOptions<number>;
	private pressableKeys!: PressableOptions<number>;

	private keyValues: KeyValues = {
		LEFT: null,
		RIGHT: null,
		DOWN: null,
		UP: null,
		PAUSE: null,
		ROTATE_LEFT: null,
		ROTATE_RIGHT: null,
	};

	private keyDownListener!: KeyboardListener;
	private keyUpListener!: KeyboardListener;

	//* Private

	private initKeys(): void {
		const customKeys = localStorage.getItem(this.STORAGE_KEY);
		if (customKeys) {
			const parsedCustomKeys: StoredCustomKeys = JSON.parse(customKeys);
			this.holdableKeys = parsedCustomKeys.holdableKeys;
			this.pressableKeys = parsedCustomKeys.pressableKeys;
		} else {
			this.holdableKeys = this.DEFAULT_HOLDABLE_KEYS;
			this.pressableKeys = this.DEFAULT_PRESSABLE_KEYS;
		}
	}

	private initListeners(): void {
		const holdableKeysKeyCodes: NumDictionary = {};
		Object.keys(this.holdableKeys).forEach((key) => { holdableKeysKeyCodes[this.holdableKeys[key]] = key; })

		const pressableKeysKeyCodes: NumDictionary = {};
		Object.keys(this.pressableKeys).forEach((key) => { pressableKeysKeyCodes[this.pressableKeys[key]] = key; })

		this.keyDownListener = ({ keyCode }) => {
			if (holdableKeysKeyCodes[keyCode]) {
				this.keyValues[holdableKeysKeyCodes[keyCode]] = true;
			}
			if (pressableKeysKeyCodes[keyCode]) {
				this.keyValues[pressableKeysKeyCodes[keyCode]] = true;
			}
		};

		this.keyUpListener = ({ keyCode }) => {
			if (holdableKeysKeyCodes[keyCode]) {
				this.keyValues[holdableKeysKeyCodes[keyCode]] = false;
			}
		};

		window.addEventListener('keydown', this.keyDownListener);
		window.addEventListener('keyup', this.keyUpListener);
	}

	//* Public

	public init(): void {
		this.initKeys();
		this.initListeners();
	}

	public clearKey(key: keyof (HoldableOptionsBase & PressableOptionsBase)): void {
		this.keyValues[key] = null;
	}

	//* Getters

	public get keyPressed(): KeyValues {
		return this.keyValues;
	}

}

export default ControlManager;
