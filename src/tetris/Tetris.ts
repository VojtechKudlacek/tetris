import RenderingTools from 'tetris/classes/RenderingTools';
import DomManager from 'tetris/managers/DomManager';
import ScoreManager from 'tetris/managers/ScoreManager';
import ControlManager from 'tetris/managers/ControlManager';
import FieldManager from 'tetris/managers/FieldManager';
import AudioManager from 'tetris/managers/AudioManager';
import ParticleFactory from 'tetris/factories/ParticleFactory';
import BlockFactory from 'tetris/factories/BlockFactory';
import * as CONST from 'tetris/const';
import * as utils from 'tetris/utils';

class Tetris {
	// DOM
	private ctx: CanvasRenderingContext2D;
	private domManager: DomManager;
	private audioManager: AudioManager = new AudioManager();
	private controlManager: ControlManager = new ControlManager();
	private renderingTools: RenderingTools;
	// Render
	private animating: boolean = false;
	private inGame: boolean = false;
	// Score
	private scoreManager: ScoreManager = new ScoreManager();
	// Game
	private fieldManager: FieldManager = new FieldManager();
	// Level
	private level: number = 0;
	private lastUpdateTime: number = 0;
	private interval: number = 200;
	private originalInterval: number = 200;
	// Block
	private blockFactory: BlockFactory = new BlockFactory();
	// Particles
	private particleFactory: ParticleFactory = new ParticleFactory();

	constructor(parent: HTMLElement) {
		this.domManager = new DomManager(parent);
		this.domManager.createCanvas();
		this.ctx = this.domManager.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
		this.renderingTools = new RenderingTools(this.ctx);
	}

	private loose(): void {
		this.scoreManager.updateHighScore();
		this.domManager.setHighScore(this.scoreManager.highScore);
		this.animating = false;
		this.domManager.showScreen('gameOver');
	}

	// Game processing

	private processMove(): void {
		const currentBlock = this.blockFactory.currentBlock;
		if (!this.fieldManager.isColiding(currentBlock, currentBlock.x, currentBlock.y + 1)) {
			currentBlock.setY(currentBlock.y + 1);
		} else {
			this.fieldManager.placeBlock(this.blockFactory.currentBlock);
			if (this.interval <= CONST.SLAM_INTERVAL) {
				this.blockFactory.currentBlock.iterate((row, col, value, block) => {
					if (value) {
						const x = ((col + block.x) * CONST.TILE_SIZE) + CONST.HALF_TILE_SIZE;
						const y = ((row + block.y) * CONST.TILE_SIZE) + CONST.HALF_TILE_SIZE;
						this.particleFactory.createParticles(x, y, block.color, 3, -1);
					}
				})
			}
			this.fieldManager.checkAndClearFilledRows((row, cleared) => {
				this.fieldManager.iterateCols(row, (col, _, color) => {
					const x = (col * CONST.TILE_SIZE) + CONST.HALF_TILE_SIZE;
					const y = (row * CONST.TILE_SIZE) + CONST.HALF_TILE_SIZE;
					this.particleFactory.createParticles(x, y, color, 5, (cleared * 3));
				});
				this.scoreManager.add(this.level, cleared - 1);
			});

			if (this.fieldManager.isBlockInFirstRow) {
				this.loose();
			} else {
				this.blockFactory.useNextBlock();
				this.domManager.setScore(this.scoreManager.score);
				this.renderingTools.preDrawGame(this.fieldManager);
				this.renderingTools.preDrawNextBlock(this.blockFactory.nextBlock);
			}
		}
	}

	/**
	 * Rendering
	 */
	private render(): void {
		this.renderingTools.clear();
		if (this.inGame) {
			// Draw game
			this.renderingTools.drawGame();
			// Draw next block
			this.renderingTools.drawNextBlock();
			// Draw particles
			this.particleFactory.drawParticles(this.ctx);
			// Draw current block
			this.renderingTools.drawCurrentBlock(this.blockFactory.currentBlock);
		} else {
			// Draw particles
			this.particleFactory.drawParticles(this.ctx);
		}
	}

	/**
	 * Game processing
	 */
	private processControls(): void {
		const keyPressed = this.controlManager.keyPressed;
		const currentBlock = this.blockFactory.currentBlock;
		// Pause or unpause
		if (keyPressed.PAUSE) {
			if (this.animating) {
				this.animating = false;
				this.domManager.showScreen('pause');
			} else {
				this.animating = true;
				this.domManager.showScreen('ui');
			}
			this.controlManager.clearKey('PAUSE');
		}
		// Speed up the block or disable bonus speed
		if (keyPressed.DOWN) {
			this.interval = CONST.SLAM_INTERVAL;
		} else if (keyPressed.DOWN === false) {
			this.interval = this.originalInterval;
			this.controlManager.clearKey('DOWN');
		}
		// Freeze the block
		if (keyPressed.UP) {
			this.interval = Infinity;
		} else if (keyPressed.UP === false) {
			this.interval = this.originalInterval;
			this.controlManager.clearKey('UP');
		}
		// Move the block left
		if (keyPressed.LEFT) {
			if (!this.fieldManager.isColiding(currentBlock, currentBlock.x - 1, currentBlock.y)) {
				currentBlock.setX(currentBlock.x - 1);
			}
			this.controlManager.clearKey('LEFT');
		}
		// Move the block right
		if (keyPressed.RIGHT) {
			if (!this.fieldManager.isColiding(currentBlock, currentBlock.x + 1, currentBlock.y)) {
				currentBlock.setX(currentBlock.x + 1);
			}
			this.controlManager.clearKey('RIGHT');
		}
		// Rotate the block anticlockwise
		if (keyPressed.ROTATE_LEFT) {
			const newBlock = currentBlock.duplicate();
			newBlock.rotateLeft();
			if (!this.fieldManager.isColiding(newBlock, newBlock.x, newBlock.y)) {
				this.blockFactory.currentBlock = newBlock;
			}
			this.controlManager.clearKey('ROTATE_LEFT');
		}
		// Rotate the block clockwise
		if (keyPressed.ROTATE_RIGHT) {
			const newBlock = currentBlock.duplicate();
			newBlock.rotateRight();
			if (!this.fieldManager.isColiding(newBlock, newBlock.x, newBlock.y)) {
				this.blockFactory.currentBlock = newBlock;
			}
			this.controlManager.clearKey('ROTATE_RIGHT');
		}
	}

	private processGame(delta: number): void {
		this.particleFactory.processParticles();
		if (delta - this.lastUpdateTime > this.interval) {
			this.processMove();
			this.lastUpdateTime = delta;
		}
	}

	private processMenu(): void {
		this.particleFactory.processParticles();
		if (this.particleFactory.particles.length < CONST.MENU_PARTICLE_COUNT) {
			const colors = Object.values(CONST.COLORS);
			for (let i = this.particleFactory.particles.length; i < CONST.MENU_PARTICLE_COUNT; i++) {
				this.particleFactory.createParticle(
					Math.floor(CONST.CANVAS_WIDTH / 2),
					Math.floor(CONST.CANVAS_HEIGHT / 2),
					colors[utils.randomFromTo(0, colors.length - 1, true)],
					utils.randomFromTo(0, 10)
				);
			}
		}
	}

	/**
	 * Game loop
	 * @param delta Time spent in game
	 */
	private loop = (delta: number): void => {
		if (this.inGame) {
			this.processControls();
		}
		if (this.animating) {
			this.render();
			if (this.inGame) {
				this.processGame(delta);
			} else {
				this.processMenu();
			}
		}
		requestAnimationFrame(this.loop)
	}

	private gameSetup(): void {
		this.fieldManager.init();
		this.blockFactory.init();
		this.audioManager.init();
		this.scoreManager.init();
		this.controlManager.init();
		this.domManager.setScore(this.scoreManager.score);
		this.renderingTools.preDrawGame(this.fieldManager);
		this.renderingTools.preDrawNextBlock(this.blockFactory.nextBlock);
	}

	private setLevel(level: number): void {
		this.level = level;
		const newInterval = 475 - (level * 25);
		this.originalInterval = newInterval;
		this.interval = newInterval;
	}

	private startGame(): void {
		this.animating = true;
		this.inGame = true;
		this.domManager.showScreen('ui');
		this.gameSetup();
	}

	private endGame(): void {
		this.animating = true;
		this.inGame = false;
	}

	private onLevelSelect(level: number): void {
		this.setLevel(level);
		this.startGame();
	}

	private onMenu(): void {
		this.endGame();
		this.domManager.showScreen('menu');
	}

	// EXPOSED

	public init(): void {
		this.animating = true;
		this.gameSetup();
		this.domManager.init({
			onLevelSelect: this.onLevelSelect.bind(this),
			onRestart: this.startGame.bind(this),
			onMenu: this.onMenu.bind(this),
		}, this.controlManager.options);
		this.domManager.setHighScore(this.scoreManager.highScore);
		this.domManager.showScreen('menu');
		requestAnimationFrame(this.loop);
	}

}

export default Tetris;
