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
	/** Variable to prevent continuous droping */
	private ableToDrop: boolean = true;

	/** Rows to be cleared after delay */
	private rowsToClear: Array<number> = [];
	/** Number of blinks before clearing the lines */
	private clearDelayIterations: number = 0;

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
		this.ctx = this.domManager.canvas.getContext('2d') as CanvasRenderingContext2D;
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
		this.audioManager.play('GAME_OVER');
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

	/** Hard drop the block */
	private hardDrop(): void {
		const currentBlock = this.blockFactory.currentBlock;
		for (let y = currentBlock.y; y <= constants.ROW_COUNT; y++) {
			if (this.fieldManager.isColiding(currentBlock, currentBlock.x, y + 1)) {
				this.blockFactory.currentBlock.y = y;
				this.placeBlock(true);
				break;
			}
		}
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

	/** Clear the rows after a delay */
	private async clearRows(clearDelayIterations: number = constants.CLEAR_DELAY_ITERATIONS): Promise<number> {
		if (!this.rowsToClear.length) { return 0; }
		this.clearDelayIterations = clearDelayIterations;
		while (this.clearDelayIterations > 0) {
			// Await in while D:<
			await utils.delay(constants.CLEAR_DELAY);
			this.clearDelayIterations--;
		}
		const clearedRows = this.fieldManager.clearRows(this.rowsToClear, (row, cleared) => {
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
		this.rowsToClear = [];
		return clearedRows;
	}

	/** Place the block and do everything else */
	private async placeBlock(slamed: boolean = false): Promise<void> {
		this.fieldManager.placeBlock(this.blockFactory.currentBlock);
		this.audioManager.play('FALL');
		// Draw particles for slaming the block
		if (slamed) { this.domManager.shake(3); }
		if (slamed || this.interval <= constants.SLAM_INTERVAL) {
			this.blockFactory.currentBlock.iterate((row, col, block) => {
				this.particleFactory.createParticles(
					((col + block.x) * constants.TILE_SIZE) + constants.HALF_TILE_SIZE,
					((row + block.y) * constants.TILE_SIZE) + constants.HALF_TILE_SIZE,
					block.color, 3, -1
				);
			})
		}
		// Clear filled rows from the field
		this.rowsToClear = this.fieldManager.getFilledRows();
		// It's async so there can be the animation
		let clearedRows = 0;
		if (slamed && this.rowsToClear.length >= 4) {
			clearedRows = await this.clearRows(0);
		} else {
			clearedRows = await this.clearRows();
		}

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
				if (clearedRows >= 4 && slamed) {
					this.audioManager.play('BOOM');
				} else {
					this.audioManager.play('CLEAR');
				}
				// Shake for TETRIS
				// There could be `===`, this is just to be sure ¯\_(ツ)_/¯
				if (clearedRows >= 4) {
					this.domManager.shake(slamed ? 20 : 10);
				}
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

	//* Game processing

	/** Process block movement */
	private async processMove(): Promise<void> {
		// Just to make the next line shorter ¯\_(ツ)_/¯
		const { x, y } = this.blockFactory.currentBlock;
		if (!this.fieldManager.isColiding(this.blockFactory.currentBlock, x, y + 1)) {
			// If moved block isn't coliding, move the block down
			this.blockFactory.currentBlock.y++;
		} else {
			// Otherwise place the block
			await this.placeBlock();
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
	private async processGame(time: number): Promise<void> {
		if (time - this.lastUpdateTime > this.interval) {
			await this.processMove();
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
			this.renderingTools.drawCurrentBlock(this.blockFactory.currentBlock, this.fieldManager);
			// Row removing animation
			if (this.clearDelayIterations % 2) {
				this.renderingTools.hideRows(this.rowsToClear);
			}
		}
		// Draw particles
		this.particleFactory.drawParticles(this.ctx);
	}

	/**
	 * Game loop for rendering and game processing
	 * @param time Time spent in game
	 */
	private loop = async (time: number): Promise<void> => {
		requestAnimationFrame(this.loop);
		if (this.isPaused) { return; }
		// Process particles
		this.particleFactory.processParticles();
		// Check if state is running game or menu
		if (this.isInGame && !this.isGameOver && this.clearDelayIterations === 0) {
			this.processControls();
			await this.processGame(time);
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
			if (!this.isInGame || this.isGameOver) { return; }
			switch (keyCode) {
				case controls.PAUSE:
					this.isPaused = !this.isPaused;
					this.isPaused ? this.renderPauseScreen() : this.renderGameInterface();
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
				case controls.DROP:
					if (this.ableToDrop) {
						this.ableToDrop = false;
						this.hardDrop();
					}
					break;
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
				case controls.DROP:
					this.ableToDrop = true;
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
		this.audioManager.play('CLICK');
		this.initialLevel = level;
		this.level = level;
		this.startGame();
	}

	/** End the game and render menu screen */
	private onMenu = (): void => {
		this.audioManager.play('CLICK');
		this.isInGame = false;
		this.renderMenuScreen();
	}

	/** Start new game with same selected level */
	private onRestart = (): void => {
		this.audioManager.play('CLICK');
		this.startGame();
	}

	/** Show controls edit screen */
	private onControls = (): void => {
		this.audioManager.play('CLICK');
		this.renderControlsEditScreen();
	}

	/** Reset controls to defaults */
	private onControlsReset = (): void => {
		this.audioManager.play('CLICK');
		this.controlManager.restartKeys();
		// It is easier to rerender :)
		this.renderControlsEditScreen();
	}

	/**
	 * Change volume and play sample
	 * @param value Volume value from 0 to 1
	 */
	private onVolumeChange = (value: number): void => {
		this.audioManager.changeVolume(value);
		this.audioManager.play('CLICK');
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
			onLevelSelect: this.onLevelSelect,
			onControls: this.onControls,
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

	/** Renders screen for managing custom keys */
	private renderControlsEditScreen(): void {
		this.domManager.renderComponent(components.ControlSettings, {
			keys: this.controlManager.controls,
			updateKey: this.controlManager.updateKey,
			onMenu: this.onMenu,
			onReset: this.onControlsReset,
		})
	}

	//* Exposed methods

	/** Init listeners, create dom elements and setup the game */
	public init(): void {
		this.audioManager.init();
		this.domManager.init();
		this.domManager.createVolumeControl(this.audioManager.volume, this.onVolumeChange);
		this.controlManager.init();
		this.initListeners();
		this.renderMenuScreen();
		requestAnimationFrame(this.loop);
	}

}

export default Tetris;
