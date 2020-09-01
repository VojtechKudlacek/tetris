/** Class to manage controls and register event listeners */
class ControlManager {

	/** Key to store custom user settings in local storage */
	private readonly STORAGE_KEY: string = 'controls';
	/** Default controls */
	private readonly DEFAULT_CONTROLS: Controls = {
		LEFT: 37, // Arrow left
		RIGHT: 39, // Arrow right
		DOWN: 40, // Arrow down
		UP: 38, // Arrow up
		DROP: 32, // Space
		PAUSE: 80, // P
		ROTATE_LEFT: 65, // A
		ROTATE_RIGHT: 83, // S
	};

	/** Event listeners called for according events */
	private listeners: Dictionary<ControlListener> = {};
	/** Actual game controls */
	public controls!: Controls;

	/** Initialize constrols from custom keys or default ones */
	private initControls(): void {
		this.controls = { ...this.DEFAULT_CONTROLS };
		const customControls = localStorage.getItem(this.STORAGE_KEY);
		if (customControls) {
			// I believe that users doesn't modify the local storage. :)
			this.controls = {
				...this.controls,
				...JSON.parse(customControls) as Controls
			};
		}
	}

	/** Initialize used event listeners on whole window */
	private initListeners(): void {
		window.addEventListener('keydown', ({ keyCode }) => this.listeners.keydown && this.listeners.keydown(keyCode, this.controls));
		window.addEventListener('keyup', ({ keyCode }) => this.listeners.keyup && this.listeners.keyup(keyCode, this.controls));
	}

	/**
	 * Set custom key
	 * @param key Key you want to change
	 * @param value New value of the key
	 */
	public updateKey = (key: keyof Controls, value: number): void => {
		this.controls[key] = value;
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.controls));
	}

	/** Restart settings to original ones */
	public restartKeys = (): void => {
		this.controls = { ...this.DEFAULT_CONTROLS };
		localStorage.removeItem(this.STORAGE_KEY);
	}

	/**
	 * Set listener for given event
	 * @param event Event to be listened for
	 * @param listener Listener function
	 */
	public setListener(event: AvailableEvent, listener: ControlListener): void {
		this.listeners[event] = listener;
	}

	/** Initialize controls and listeners */
	public init(): void {
		this.initControls();
		this.initListeners();
	}

}

export default ControlManager;
