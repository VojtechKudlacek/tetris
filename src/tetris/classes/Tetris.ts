import Block from 'tetris/classes/Block';
import RenderingTools from 'tetris/classes/RenderingTools';
import DomManager from 'tetris/managers/DomManager';
import ScoreManager from 'tetris/managers/ScoreManager';
import ControlManager from 'tetris/managers/ControlManager';
import FieldManager from 'tetris/managers/FieldManager';
import AudioManager from 'tetris/managers/AudioManager';
import ParticleFactory from 'tetris/factories/ParticleFactory';
import BlockFactory from 'tetris/factories/BlockFactory';
import * as constants from 'tetris/const';
import * as utils from 'tetris/utils';
import * as components from 'tetris/domComponents';

/** Game itself. Start with `.init()` method */
class Tetris {

	/** Game renderer */
	private ctx: CanvasRenderingContext2D;
	/** Class for rendering screens and manipulating DOM */
	private domManager: DomManager;
	/** Class for managing audio */
	private audioManager: AudioManager;
	/** Class for managing controls */
	private controlManager: ControlManager;
	/** Class for managing score */
	private scoreManager: ScoreManager;
	/** Class for managing game field */
	private fieldManager: FieldManager;
	/** Class for creating and managing blocks */
	private blockFactory: BlockFactory;
	/** Class for creating and managing particles */
	private particleFactory: ParticleFactory;
	/** Class for rendering everything */
	private renderingTools: RenderingTools;

	/** Control key for left move is pressed */
	private pressedLeft: boolean = false;
	/** Control key for right move is pressed */
	private pressedRight: boolean = false;
	/** Ticks before movement process */
	private movementDelay: number = 0;

	/** Game is running (or in menu) */
	private isInGame: boolean = false;
	/** Game ended */
	private isGameOver: boolean = false;
	/** Game is paused */
	private isPaused: boolean = false;

	/** Level the game started on */
	private initialLevel: number = 0;
	/** Current game level */
	private level: number = 0;
	/** Last process time */
	private lastUpdateTime: number = 0;
	/** Current processing interval */
	private interval: number = 200;
	/** Base processing interval */
	private originalInterval: number = 200;

	constructor(parent: HTMLElement) {
		this.domManager = new DomManager(parent);
		this.domManager.createCanvas();
		// Since when does `.getContext('2d')` can return undefined? ¯\_(ツ)_/¯
		this.ctx = this.domManager.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
		this.renderingTools = new RenderingTools(this.ctx);
		this.audioManager = new AudioManager();
		this.controlManager = new ControlManager();
		this.scoreManager = new ScoreManager();
		this.fieldManager = new FieldManager();
		this.particleFactory = new ParticleFactory();
		this.blockFactory = new BlockFactory();
	}

	/** End the game and show game over screen */
	private endTheGame(): void {
		this.scoreManager.updateHighScore();
		this.renderGameOverScreen();
		this.isGameOver = true;
	}

	/** Returns if level should be increased */
	private get shouldIncreaseLevel(): boolean {
		// First condition is for optimization to not recalculate in the last level
		// However how many people clears 60 rows in the last level ¯\_(ツ)_/¯
		return (this.level < constants.LEVEL_COUNT) &&
			(Math.floor(this.scoreManager.clearedRows / constants.ROWS_TO_INCREASE_LEVEL) > (this.level - this.initialLevel));
	}

	/** Recalculate interval based on current level */
	private recalculateInterval(): void {
		this.originalInterval = 475 - (this.level * 25);
		this.interval = this.originalInterval;
	}

	/** Increases current level and recalculates interval */
	private increaseLevel(): void {
		this.level++;
		this.recalculateInterval();
	}

	/** Moves block one column left if possible */
	private moveBlockLeft(): void {
		const currentBlock = this.blockFactory.currentBlock;
		if (!this.fieldManager.isColiding(currentBlock, currentBlock.x - 1, currentBlock.y)) {
			currentBlock.x--;
		}
	}

	/** Moves block one column right if possible */
	private moveBlockRight(): void {
		const currentBlock = this.blockFactory.currentBlock;
		if (!this.fieldManager.isColiding(currentBlock, currentBlock.x + 1, currentBlock.y)) {
			currentBlock.x++;
		}
	}

	//* Game processing

	/** Process block movement */
	private processMove(): void {
		const currentBlock = this.blockFactory.currentBlock;

		if (!this.fieldManager.isColiding(currentBlock, currentBlock.x, currentBlock.y + 1)) {
			// If moved block isn't coliding, move the block down
			currentBlock.y++;
		} else {
			// Otherwise place the block
			this.fieldManager.placeBlock(this.blockFactory.currentBlock);
			// Draw particles for slaming the block
			if (this.interval <= constants.SLAM_INTERVAL) {
				this.blockFactory.currentBlock.iterate((row, col, block) => {
					this.particleFactory.createParticles(
						((col + block.x) * constants.TILE_SIZE) + constants.HALF_TILE_SIZE,
						((row + block.y) * constants.TILE_SIZE) + constants.HALF_TILE_SIZE,
						block.color, 3, -1
					);
				})
			}
			// Clear filled rows from the field
			const clearedRows = this.fieldManager.clearFilledRows((row, cleared) => {
				this.fieldManager.iterateCols(row, (col, color) => {
					this.particleFactory.createParticles(
						(col * constants.TILE_SIZE) + constants.HALF_TILE_SIZE,
						(row * constants.TILE_SIZE) + constants.HALF_TILE_SIZE,
						color, 5, (cleared * 3)
					);
				});
				// Adding score in loop for easier combo counting
				this.scoreManager.add(this.level, cleared - 1);
			});

			if (this.fieldManager.isBlockInFirstRow) {
				// End the game if there is a block in the first row
				this.endTheGame();
			} else {
				// Switch to next block
				this.blockFactory.useNextBlock();
				// Update game to render placed block
				this.renderingTools.preDrawGame(this.fieldManager);
				// Update next block preview
				this.renderingTools.preDrawNextBlock(this.blockFactory.nextBlock);
				if (clearedRows) {
					// This is behind the cleared rows condition for little optimization
					if (this.shouldIncreaseLevel) {
						// Level increment logic
						this.increaseLevel();
					}
					// Optimization to not re-render every time block is placed
					this.renderGameInterface();
				}
			}
		}
	}

	/** Process block movement for smoother controls */
	private processControls(): void {
		// Condition for tick delay between movements
		if (this.movementDelay === 0) {
			if (this.pressedLeft) {
				this.moveBlockLeft();
				this.movementDelay = 1;
			}
			if (this.pressedRight) {
				this.moveBlockRight();
				this.movementDelay = 1;
			}
		} else if (this.movementDelay > 0) {
			this.movementDelay--;
		}
	}

	/**
	 * Process game tick in propriate interval
	 * @param time Time in game to calculate delta
	 */
	private processGame(time: number): void {
		if (time - this.lastUpdateTime > this.interval) {
			this.processMove();
			this.lastUpdateTime = time;
		}
	}

	/** Generates particles in menu */
	private processMenu(): void {
		if (this.particleFactory.count >= constants.MENU_PARTICLE_COUNT) { return; }
		// Predefined colors in hex string
		const colors = Object.values(constants.COLORS);
		// I dont use 'createParticles', because I want to randomize the color
		for (let count = this.particleFactory.count; count < constants.MENU_PARTICLE_COUNT; count++) {
			// Creates particle at the center of the screen
			this.particleFactory.createParticle(
				Math.floor(constants.CANVAS_WIDTH / 2),
				Math.floor(constants.CANVAS_HEIGHT / 2),
				colors[utils.randomFromTo(0, colors.length - 1, true)],
				utils.randomFromTo(0, 10)
			);
		}
	}

	/** Render everything needed for current state */
	private render(): void {
		this.renderingTools.clear();
		if (this.isInGame) {
			// Draw game
			this.renderingTools.drawGame();
			// Draw next block
			if (!this.isGameOver) {
				this.renderingTools.drawNextBlock();
			}
			// Draw current block
			this.renderingTools.drawCurrentBlock(this.blockFactory.currentBlock);
		}
		// Draw particles
		this.particleFactory.drawParticles(this.ctx);
	}

	/**
	 * Game loop for rendering and game processing
	 * @param time Time spent in game
	 */
	private loop = (time: number): void => {
		requestAnimationFrame(this.loop);
		if (this.isPaused) { return; }
		// Process particles
		this.particleFactory.processParticles();
		// Check if state is running game or menu
		if (this.isInGame && !this.isGameOver) {
			this.processControls();
			this.processGame(time);
		} else if (!this.isInGame) {
			this.processMenu();
		}
		this.render();
	}

	/**
	 * Rotate block if possible
	 * @param rotatedBlock Already rotated block
	 */
	private tryRotatedBlock(rotatedBlock: Block): void {
		if (!this.fieldManager.isColiding(rotatedBlock, rotatedBlock.x, rotatedBlock.y)) {
			// Simply use rotated block
			this.blockFactory.currentBlock = rotatedBlock;
		} else if (rotatedBlock.x < 0 && !this.fieldManager.isColiding(rotatedBlock, 0, rotatedBlock.y)) {
			// Kick block form left wall
			rotatedBlock.x = 0;
			this.blockFactory.currentBlock = rotatedBlock;
		} else if (rotatedBlock.x + rotatedBlock.tiles > constants.COL_COUNT && !this.fieldManager.isColiding(rotatedBlock, constants.COL_COUNT - rotatedBlock.tiles, rotatedBlock.y)) {
			// Kick block form right wall
			rotatedBlock.x = constants.COL_COUNT - rotatedBlock.tiles;
			this.blockFactory.currentBlock = rotatedBlock;
		}
	}

	/** Init keyboard listeners */
	private initListeners(): void {
		// Keydown for basically everything
		this.controlManager.setListener('keydown', (keyCode, controls) => {
			const currentBlock = this.blockFactory.currentBlock;
			switch (keyCode) {
				case controls.PAUSE:
					if (this.isInGame) {
						this.isPaused = !this.isPaused;
						this.isPaused ? this.renderPauseScreen() : this.renderGameInterface();
					}
					break;
				case controls.DOWN:
					this.interval = constants.SLAM_INTERVAL;
					break;
				case controls.UP:
					this.interval = Infinity; // TODO: Remove this
					break;
				case controls.LEFT:
					if (!this.pressedLeft) {
						this.pressedLeft = true;
						this.movementDelay = constants.MOVEMENT_DELAY;
						this.moveBlockLeft();
					}
					break;
				case controls.RIGHT:
					if (!this.pressedRight) {
						this.pressedRight = true;
						this.movementDelay = constants.MOVEMENT_DELAY;
						this.moveBlockRight();
					}
					break;
				case controls.ROTATE_LEFT: {
					const newBlock = currentBlock.duplicate();
					newBlock.rotateLeft();
					this.tryRotatedBlock(newBlock);
					break;
				}
				case controls.ROTATE_RIGHT: {
					const newBlock = currentBlock.duplicate();
					newBlock.rotateRight();
					this.tryRotatedBlock(newBlock);
					break;
				}
			}
		});
		// Keyup for block movement processing and removing fall boost
		this.controlManager.setListener('keyup', (keyCode, controls) => {
			switch (keyCode) {
				case controls.DOWN:
				case controls.UP:
					this.interval = this.originalInterval;
					break;
				case controls.LEFT:
					this.pressedLeft = false;
					break;
				case controls.RIGHT:
					this.pressedRight = false;
					break;
			}
		});
	}

	/** Start the game with initial setup and last selected level */
	private startGame(): void {
		this.gameSetup();
		this.renderGameInterface();
		this.isInGame = true;
	}

	/** Restart the game to it's initial setup */
	private gameSetup(): void {
		this.isGameOver = false;
		this.isInGame = false;
		this.isPaused = false;
		this.level = this.initialLevel;
		this.recalculateInterval();
		this.fieldManager.init();
		this.blockFactory.init();
		this.scoreManager.init();
		this.renderingTools.preDrawGame(this.fieldManager);
		this.renderingTools.preDrawNextBlock(this.blockFactory.nextBlock);
	}

	//* Methods for dom manager

	/**
	 * Select level and start the game
	 * @param level Selected level
	 */
	private onLevelSelect = (level: number): void => {
		this.initialLevel = level;
		this.level = level;
		this.startGame();
	}

	/** End the game and render menu screen */
	private onMenu = (): void => {
		this.isInGame = false;
		this.renderMenuScreen();
	}

	/** Start new game with same selected level */
	private onRestart = (): void => {
		this.startGame();
	}

	//* Component rendering

	private renderGameInterface(): void {
		this.domManager.renderComponent(components.GameInterface, {
			score: String(this.scoreManager.score),
			highScore: String(this.scoreManager.highScore),
			keys: this.controlManager.controls,
			clearedRows: String(this.scoreManager.clearedRows),
			level: String(this.level),
		});
	}

	/** Render menu with level select */
	private renderMenuScreen(): void {
		this.domManager.renderComponent(components.Menu, {
			onLevelSelect: this.onLevelSelect
		});
	}

	/** Renders pause to not see the game */
	private renderPauseScreen(): void {
		this.domManager.renderComponent(components.Pause, {});
	}

	/** Renders game over screen with score and buttons */
	private renderGameOverScreen(): void {
		this.domManager.renderComponent(components.GameOver, {
			score: String(this.scoreManager.score),
			highScore: String(this.scoreManager.highScore),
			onMenu: this.onMenu,
			onRestart: this.onRestart,
		});
	}

	//* Exposed methods

	/** Init listeners, create dom elements and setup the game */
	public init(): void {
		this.domManager.init();
		this.controlManager.init();
		this.audioManager.init();
		this.initListeners();
		this.renderMenuScreen();
		requestAnimationFrame(this.loop);
	}

}

export default Tetris;
