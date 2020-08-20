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

interface KeysReference {
	holdableKeys: HoldableOptions;
	pressableKeys: PressableOptions;
}

type HoldableOptions<T = number> = HoldableOptionsBase<T> & Dictionary<T>;

type PressableOptions<T = number> = PressableOptionsBase<T> & Dictionary<T>;

type KeyValues = HoldableOptions<boolean | null> & PressableOptions<boolean | null>;
