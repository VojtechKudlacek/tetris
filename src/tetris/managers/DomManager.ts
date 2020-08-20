import { CANVAS_WIDTH, CANVAS_HEIGHT, AVAILABLE_KEYS } from 'tetris/const';

type OnLevelSelect = (level: number) => void;
type OnRestart = () => void;
type OnMenu = () => void;

interface Actions {
	onLevelSelect: OnLevelSelect;
	onRestart: OnRestart;
	onMenu: OnMenu;
}

class DomManager {

	//* Private readonly

	private readonly LEVEL_COUNT = 18;

	//* Private

	private parent: HTMLElement;

	private menuScreen!: HTMLElement;
	private gameOverScreen!: HTMLElement;
	private pauseScreen!: HTMLElement;
	private uiScreen!: HTMLElement;

	private onLevelSelect!: OnLevelSelect;
	private onRestart!: OnRestart;
	private onMenu!: OnMenu;

	//* Public

	public canvas!: HTMLCanvasElement;

	//* Construct

	constructor(element: HTMLElement) {
		this.parent = element;
	}

	//* Private

	private hideScreens(): void {
		this.menuScreen.style.display = 'none';
		this.gameOverScreen.style.display = 'none';
		this.pauseScreen.style.display = 'none';
		this.uiScreen.style.display = 'none';
	}

	private createMenu(): void {
		const parent = document.createElement('div');
		parent.className = 'tetris-overlay';
		parent.style.display = 'none';

		const aligner = document.createElement('div');
		aligner.className = 'tetris-aligner';

		const menuBox = document.createElement('div');
		menuBox.className = 'tetris-menu-box';

		const title = document.createElement('div');
		title.className = 'tetris-title';
		title.innerText = 'CHOOSE LEVEL!';

		const buttons = document.createElement('div');
		buttons.className = 'tetris-levels';
		for (let level = 0; level < this.LEVEL_COUNT; level++) {
			const button = document.createElement('button');
			button.addEventListener('click', () => this.onLevelSelect(level + 1))
			button.innerText = String(level + 1);
			button.className = 'tetris-button tetris-level';
			buttons.appendChild(button);
		}

		menuBox.appendChild(title)
		menuBox.appendChild(buttons)
		aligner.appendChild(menuBox);
		parent.appendChild(aligner);

		this.menuScreen = parent;
	}

	private createGameOver(): void {
		const parent = document.createElement('div');
		parent.className = 'tetris-overlay tetris-dark-overlay';
		parent.style.display = 'none';

		const aligner = document.createElement('div');
		aligner.className = 'tetris-aligner';

		const title = document.createElement('div');
		title.className = 'tetris-title';
		title.innerText = 'GAME OVER!';

		const buttons = document.createElement('div');
		buttons.className = 'tetris-buttons';

		const retryButton = document.createElement('button');
		retryButton.className = 'tetris-button';
		retryButton.innerText = 'Retry';
		retryButton.addEventListener('click', () => this.onRestart());

		const mainMenuButton = document.createElement('button');
		mainMenuButton.className = 'tetris-button';
		mainMenuButton.innerText = 'Main Menu';
		mainMenuButton.addEventListener('click', () => this.onMenu());

		buttons.appendChild(retryButton);
		buttons.appendChild(mainMenuButton);
		aligner.appendChild(title);
		aligner.appendChild(buttons);
		parent.appendChild(aligner);

		this.gameOverScreen = parent;
	}

	private createPause(): void {
		const parent = document.createElement('div');
		parent.className = 'tetris-overlay tetris-black-overlay';
		parent.style.display = 'none';

		const aligner = document.createElement('div');
		aligner.className = 'tetris-aligner';

		const title = document.createElement('div');
		title.className = 'tetris-title';
		title.innerText = 'PAUSE';

		aligner.appendChild(title);
		parent.appendChild(aligner);

		this.pauseScreen = parent;
	}

	private createUI(keys: KeysReference): void {
		const parent = document.createElement('div');
		parent.className = 'tetris-overlay';
		parent.style.display = 'none';

		const ui = document.createElement('div');
		ui.className = 'tetris-ui';

		const controls = document.createElement('div');
		controls.className = 'tetris-controls';

		const availableOptions = [
			['Left', keys.holdableKeys.LEFT],
			['Right', keys.holdableKeys.RIGHT],
			['Rotate Left', keys.pressableKeys.ROTATE_LEFT],
			['Rotate Right', keys.pressableKeys.ROTATE_RIGHT],
			['Speed Up', keys.holdableKeys.DOWN],
			['Pause', keys.pressableKeys.PAUSE],
		];

		availableOptions.forEach(([label, key]) => {
			const el = document.createElement('div');
			el.className = 'tetris-controls-label';
			el.innerHTML = `<span class="tetris-label">${label}</span><span class="tetris-value">${AVAILABLE_KEYS[key]}</span>`;
			controls.appendChild(el);
		});

		ui.appendChild(controls);
		parent.appendChild(ui);

		this.uiScreen = parent;
	}

	//* Public

	public createCanvas(): void {
		const canvas = document.createElement('canvas');
		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;
		canvas.className = 'tetris-renderer';
		this.canvas = canvas;
	}

	public init(actions: Actions, keys: KeysReference): void {
		// Save actions
		this.onMenu = actions.onMenu;
		this.onRestart = actions.onRestart;
		this.onLevelSelect = actions.onLevelSelect;
		// Update given element
		this.parent.className = 'tetris';
		this.parent.style.width = `${CANVAS_WIDTH}px`;
		this.parent.style.height = `${CANVAS_HEIGHT}px`;
		// Create screens
		this.createUI(keys);
		this.createMenu();
		this.createGameOver();
		this.createPause();
		// Add screens to the DOM
		this.parent.appendChild(this.canvas);
		this.parent.appendChild(this.uiScreen);
		this.parent.appendChild(this.menuScreen);
		this.parent.appendChild(this.gameOverScreen);
		this.parent.appendChild(this.pauseScreen);
	}

	public showScreen(screen: 'ui' | 'menu' | 'gameOver' | 'pause'): void {
		this.hideScreens();
		switch (screen) {
			case 'gameOver':
				this.gameOverScreen.style.display = '';
				this.uiScreen.style.display = '';
				break;
			case 'menu':
				this.menuScreen.style.display = '';
				break;
			case 'pause':
				this.pauseScreen.style.display = '';
				break;
			case 'ui':
			default:
				this.uiScreen.style.display = '';
				break;
		}
	}

}

export default DomManager;
