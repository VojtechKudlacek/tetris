import { CANVAS_WIDTH, CANVAS_HEIGHT, AVAILABLE_KEYS } from 'tetris/const';

class DomManager {

	// Private properties

	private readonly LEVEL_COUNT = 18;

	private parent: HTMLElement;
	private uiRenderer!: HTMLElement;

	// Public properties

	public canvas!: HTMLCanvasElement;

	// Constructor

	constructor(element: HTMLElement) {
		this.parent = element;
	}

	// Private methods

	private createElement<T extends keyof HTMLElementTagNameMap>(type: T, className?: string, value?: string): HTMLElementTagNameMap[T] {
		const element = document.createElement(type);
		if (className) { element.className = className; }
		if (value) { element.innerText = value; }
		return element;
	}

	private overrideUiRenderer(element: HTMLElement): void {
		this.uiRenderer.innerHTML = '';
		this.uiRenderer.appendChild(element);
	}

	private createOverlay(child: HTMLElement, className: string = ''): HTMLDivElement {
		let cn = 'tetris-overlay';
		if (className) { cn += (' ' + className); }
		const parent = this.createElement('div', cn);
		const aligner = this.createElement('div', 'tetris-aligner');
		aligner.appendChild(child);
		parent.appendChild(aligner);
		return parent;
	}

	private createScoreElement(score: string): HTMLElement {
		const el = document.createElement('span');
		el.className = 'tetris-value';
		el.innerText = score;
		return el;
	}

	// Public methods

	public renderGameInterface(props: { score: string, highScore: string, keys: KeysReference }): void {
		const { score, highScore, keys } = props;

		const view = this.createElement('div', 'tetris-overlay');
		const ui = this.createElement('div', 'tetris-ui');
		const gameStats = this.createElement('div', 'tetris-stats');
		const nextBlockLabel = this.createElement('span', 'tetris-label tetris-next-block', 'NEXT BLOCK');
		const scoreLabel = this.createElement('span', 'tetris-label', 'SCORE');
		const highScoreLabel = this.createElement('span', 'tetris-label', 'HIGH SCORE');
		const controls = this.createElement('div', 'tetris-controls');

		const availableOptions = [
			['Left', keys.holdableKeys.LEFT],
			['Right', keys.holdableKeys.RIGHT],
			['Rotate Left', keys.pressableKeys.ROTATE_LEFT],
			['Rotate Right', keys.pressableKeys.ROTATE_RIGHT],
			['Speed Up', keys.holdableKeys.DOWN],
			['Pause', keys.pressableKeys.PAUSE],
		];

		for (const [label, key] of availableOptions) {
			const el = this.createElement('div');
			el.className = 'tetris-controls-label';
			el.innerHTML = `<span class="tetris-label">${label}</span><span class="tetris-value">${AVAILABLE_KEYS[key]}</span>`;
			controls.appendChild(el);
		}

		gameStats.appendChild(nextBlockLabel);
		gameStats.appendChild(scoreLabel);
		gameStats.appendChild(this.createScoreElement(score));
		gameStats.appendChild(highScoreLabel);
		gameStats.appendChild(this.createScoreElement(highScore));
		ui.appendChild(gameStats);
		ui.appendChild(controls);
		view.appendChild(ui);

		this.overrideUiRenderer(view);
	}

	public renderMenu(props: { onLevelSelect: (level: number) => void }): void {
		const { onLevelSelect } = props;

		const menuBox = this.createElement('div', 'tetris-menu-box');
		const title = this.createElement('div', 'tetris-title', 'CHOOSE LEVEL!');
		const buttons = this.createElement('div', 'tetris-levels');

		for (let level = 0; level < this.LEVEL_COUNT; level++) {
			const button = this.createElement('button', 'tetris-button tetris-level', String(level + 1));
			button.addEventListener('click', () => onLevelSelect(level + 1))
			buttons.appendChild(button);
		}

		menuBox.appendChild(title)
		menuBox.appendChild(buttons)

		const view = this.createOverlay(menuBox);
		this.overrideUiRenderer(view);
	}

	public renderPause(): void {
		const title = this.createElement('div', 'tetris-title', 'PAUSE');
		const view = this.createOverlay(title, 'tetris-black-overlay');
		this.overrideUiRenderer(view);
	}

	public renderGameOver(props: { onMenu: VoidFunction, onRestart: VoidFunction, score: string, highScore: string }): void {
		const { onMenu, onRestart } = props;

		const gameOver = this.createElement('div', 'tetris-gameover');
		const title = this.createElement('div', 'tetris-title', 'GAME OVER!');
		const score = this.createElement('div', 'tetris-gameover-score');
		const scoreBox = this.createElement('div', 'tetris-gameover-score-box');
		const highScoreBox = this.createElement('div', 'tetris-gameover-score-box');
		const scoreLabel = this.createElement('span', 'tetris-label', 'SCORE');
		const highScoreLabel = this.createElement('span', 'tetris-label', 'HIGH SCORE');
		const buttons = this.createElement('div', 'tetris-buttons');
		const retryButton = this.createElement('button', 'tetris-button', 'Retry');
		retryButton.addEventListener('click', onRestart);
		const mainMenuButton = this.createElement('button', 'tetris-button', 'Main Menu');
		mainMenuButton.addEventListener('click', onMenu);

		buttons.appendChild(retryButton);
		buttons.appendChild(mainMenuButton);
		scoreBox.appendChild(scoreLabel);
		scoreBox.appendChild(this.createScoreElement(props.score))
		highScoreBox.appendChild(highScoreLabel);
		highScoreBox.appendChild(this.createScoreElement(props.highScore));
		score.appendChild(scoreBox);
		score.appendChild(highScoreBox);
		gameOver.appendChild(title);
		gameOver.appendChild(score);
		gameOver.appendChild(buttons);

		const view = this.createOverlay(gameOver, 'tetris-dark-overlay');
		this.overrideUiRenderer(view);
	}

	public createCanvas(): void {
		const canvas = document.createElement('canvas');
		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;
		canvas.className = 'tetris-renderer';
		this.canvas = canvas;
	}

	public init(): void {
		// Update given element
		this.parent.className = 'tetris';
		this.parent.style.width = `${CANVAS_WIDTH}px`;
		this.parent.style.height = `${CANVAS_HEIGHT}px`;
		// Create screens
		this.uiRenderer = this.createElement('div', 'tetris-ui-renderer');
		// Add screens to the DOM
		this.parent.innerHTML = '';
		this.parent.appendChild(this.canvas);
		this.parent.appendChild(this.uiRenderer);
	}

}

export default DomManager;
