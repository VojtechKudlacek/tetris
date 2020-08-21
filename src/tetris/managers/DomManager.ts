import { CANVAS_WIDTH, CANVAS_HEIGHT, AVAILABLE_KEYS } from 'tetris/const';

interface Actions {
	onLevelSelect: (level: number) => void;
	onRestart: VoidFunction;
	onMenu: VoidFunction;
}

class DomManager {

	//* Private readonly

	private readonly LEVEL_COUNT = 18;

	//* Private

	private parent: HTMLElement;
	private scoreElement!: HTMLElement;
	private highScoreElement!: HTMLElement;

	private menuScreen!: HTMLElement;
	private gameOverScreen!: HTMLElement;
	private pauseScreen!: HTMLElement;
	private uiScreen!: HTMLElement;

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

	private createScoreElements(): void {
		const scoreElement = document.createElement('span');
		scoreElement.className = 'tetris-value';
		scoreElement.innerText = '0';
		this.scoreElement = scoreElement;

		const highScoreElement = document.createElement('span');
		highScoreElement.className = 'tetris-value';
		highScoreElement.innerText = '0';
		this.highScoreElement = highScoreElement;
	}

	private createMenu(onLevelSelect: (level: number) => void): void {
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
			button.addEventListener('click', () => onLevelSelect(level + 1))
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

	private createGameOver(onMenu: VoidFunction, onRestart: VoidFunction): void {
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
		retryButton.addEventListener('click', () => onRestart());

		const mainMenuButton = document.createElement('button');
		mainMenuButton.className = 'tetris-button';
		mainMenuButton.innerText = 'Main Menu';
		mainMenuButton.addEventListener('click', () => onMenu());

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

		const gameStats = document.createElement('div');
		gameStats.className = 'tetris-stats';

		const nextBlockLabel = document.createElement('span');
		nextBlockLabel.className = 'tetris-label tetris-next-block';
		nextBlockLabel.innerText = 'NEXT BLOCK';

		const scoreLabel = document.createElement('span');
		scoreLabel.className = 'tetris-label';
		scoreLabel.innerText = 'SCORE';

		const highScoreLabel = document.createElement('span');
		highScoreLabel.className = 'tetris-label';
		highScoreLabel.innerText = 'HIGH SCORE';

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

		gameStats.appendChild(nextBlockLabel);
		gameStats.appendChild(scoreLabel);
		gameStats.appendChild(this.scoreElement);
		gameStats.appendChild(highScoreLabel);
		gameStats.appendChild(this.highScoreElement);
		ui.appendChild(gameStats);
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
		// Update given element
		this.parent.className = 'tetris';
		this.parent.style.width = `${CANVAS_WIDTH}px`;
		this.parent.style.height = `${CANVAS_HEIGHT}px`;
		// Create screens
		this.createScoreElements();
		this.createUI(keys);
		this.createMenu(actions.onLevelSelect);
		this.createGameOver(actions.onMenu, actions.onRestart);
		this.createPause();
		// Add screens to the DOM
		this.parent.innerHTML = '';
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
				this.uiScreen.style.display = '';
			default:
				break;
		}
	}

	public setScore(score: number): void {
		if (this.scoreElement) {
			this.scoreElement.innerText = String(score);
		}
	}

	public setHighScore(score: number): void {
		if (this.highScoreElement) {
			this.highScoreElement.innerText = String(score);
		}
	}

}

export default DomManager;
