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
