class ControlManager {

	private readonly STORAGE_KEY: string = 'controls';

	private readonly DEFAULT_CONTROLS: Controls = {
		LEFT: 37, // Arrow left
		RIGHT: 39, // Arrow right
		DOWN: 40, // Arrow down
		UP: 38, // Arrow up
		PAUSE: 80, // P
		ROTATE_LEFT: 65, // A
		ROTATE_RIGHT: 83, // S
	};

	private listeners: Dictionary<ControlListener> = {};

	public controls!: Controls;

	private initControls(): void {
		const customControls = localStorage.getItem(this.STORAGE_KEY);
		if (customControls) {
			this.controls = JSON.parse(customControls) as Controls;
		} else {
			this.controls = this.DEFAULT_CONTROLS;
		}
	}

	private initListeners(): void {
		window.addEventListener('keydown', ({ keyCode }) => this.listeners.keydown && this.listeners.keydown(keyCode, this.controls));
		window.addEventListener('keyup', ({ keyCode }) => this.listeners.keyup && this.listeners.keyup(keyCode, this.controls));
	}

	public setListener(event: AvailableEvent, listener: ControlListener): void {
		this.listeners[event] = listener;
	}

	public init(): void {
		this.initControls();
		this.initListeners();
	}

}

export default ControlManager;
