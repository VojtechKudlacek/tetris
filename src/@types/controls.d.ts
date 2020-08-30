interface Controls<T = number> {
	LEFT: T;
	RIGHT: T;
	DOWN: T;
	UP: T;
	PAUSE: T;
	ROTATE_LEFT: T;
	ROTATE_RIGHT: T;
}

type AvailableEvent = 'keydown' | 'keyup';

type ControlListener = (keyCode: number, controls: Controls) => void;
