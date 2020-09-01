import Block from 'tetris/classes/Block';
import PreRenderer from 'tetris/classes/PreRenderer';
import FieldManager from 'tetris/managers/FieldManager';
import * as constants from 'tetris/const';

/** Class used for rendering the game */
class RenderingTools {

	/** Rendering context */
	private ctx: CanvasRenderingContext2D;
	/** Prerendered game screen for optimization */
	private gamePreRenderer: PreRenderer = new PreRenderer({ height: constants.CANVAS_HEIGHT, width: constants.CANVAS_WIDTH });
	/** Prerendered next block for optimization */
	private nextBlockPreRenderer: PreRenderer = new PreRenderer({ height: constants.NEXT_BLOCK_AREA, width: constants.NEXT_BLOCK_AREA });

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	/**
	 * Draw line from one vector to another
	 * @param ctx Context for rendering
	 * @param x1 Start vector X position
	 * @param y1 Start vector Y position
	 * @param x2 End vector X position
	 * @param y2 End vector Y position
	 * @param color Line color
	 * @param width Line widht
	 */
	private drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width: number = 2): void {
		ctx.lineWidth = width;
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	/**
	 * Draw rectangle
	 * @param ctx Context for rendering
	 * @param x X position in the context
	 * @param y Y position in the context
	 * @param w Width of the rectangle
	 * @param h Height of the rectangle
	 * @param color Color of the rectangle
	 */
	private drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
		ctx.fillStyle = color;
		ctx.fillRect(x, y, w, h);
	}

	/**
	 * Stroke rectangle
	 * @param ctx Context for rendering
	 * @param x X position in the context
	 * @param y Y position in the context
	 * @param w Width of the rectangle
	 * @param h Height of the rectangle
	 * @param color Color of the rectangle
	 * @param width Line witdth
	 */
	private strokeRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, width: number): void {
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.strokeRect(x, y, w, h);
	}

	/**
	 * Draw tetris block
	 * @param ctx Context for rendering
	 * @param x X position in the context
	 * @param y Y position in the context
	 * @param color Color of the block
	 * @param tileSize Size of the tile
	 */
	private drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, tileSize: number = constants.TILE_SIZE): void {
		this.drawLine(ctx, x + 2, y + 2, x + tileSize - 2, y + tileSize - 2, color, 2);
		this.drawLine(ctx, x + 2, y + tileSize - 2, x + tileSize - 2, y + 2, color, 2);
		this.strokeRect(ctx, x + 2, y + 2, tileSize - 4, tileSize - 4, color, 2);
	}

	/**
	 * Draw shadow from the block to the bottom
	 * @param ctx Context for rendering
	 * @param x X position in the context
	 * @param y Y position in the context
	 * @param color Color of the block
	 */
	private drawBlockShadow(ctx: CanvasRenderingContext2D, x: number, y1: number, y2: number, color: string): void {
		// Adding the opacity to the color
		this.drawRect(ctx, x, y1, constants.TILE_SIZE, y2, color + '22');
	}

	/**
	 *
	 * @param ctx Context for rendering
	 * @param image Image to be rendered to the context
	 * @param x X position in the context
	 * @param y Y position in the context
	 */
	private drawPreRender(ctx: CanvasRenderingContext2D, image: HTMLCanvasElement, x: number, y: number): void {
		ctx.drawImage(image, x, y);
	}

	/**
	 * Cache the game to the image
	 * @param fieldManager Source of the game field to be drawn
	 */
	public preDrawGame(fieldManager: FieldManager): void {
		this.gamePreRenderer.draw((ctx, w, h) => {
			//* Fill are with black color
			this.drawRect(ctx, 0, 0, w, h, '#000000');
			//* Draw blocks with its color
			fieldManager.iterate((row, col, color) => {
				this.drawBlock(ctx, col * constants.TILE_SIZE, row * constants.TILE_SIZE, color);
			});
			//* Draw sidebar border
			// Yes, I rather use rect than a line ¯\_(ツ)_/¯
			this.drawRect(ctx, constants.GAME_WIDTH, 0, constants.SIDEBAR_BORDER_WIDTH, h, '#ffffff');
		});
	}

	/**
	 * Cache the next block to the image
	 * @param block Source of the next block
	 */
	public preDrawNextBlock(block: Block): void {
		this.nextBlockPreRenderer.draw((ctx, w, h) => {
			//* Fill with black color
			this.drawRect(ctx, 0, 0, w, h, '#000000');
			//* Draw white border
			this.strokeRect(ctx, 1, 1, w - 2, h - 2, '#ffffff', 2);
			//* Draw the next block
			const drawTileSize = (constants.NEXT_BLOCK_AREA - (constants.NEXT_BLOCK_AREA_PADDING * 2)) / constants.NEXT_BLOCK_ARE_TILE_COUNT;
			// This is a bit of a hack, since all of the blocks are always vertically longer than horizontally
			const horizontalPadding = ((drawTileSize * (constants.NEXT_BLOCK_ARE_TILE_COUNT - block.preview[0].length)) / 2) + constants.NEXT_BLOCK_AREA_PADDING;
			const verticalPadding = ((drawTileSize * (constants.NEXT_BLOCK_ARE_TILE_COUNT - block.preview.length)) / 2) + constants.NEXT_BLOCK_AREA_PADDING;
			for (let row = 0; row < block.preview.length; row++) {
				for (let col = 0; col < block.preview[0].length; col++) {
					if (block.preview[row][col]) {
						const x = (col * drawTileSize) + horizontalPadding;
						const y = (row * drawTileSize) + verticalPadding;
						this.drawBlock(ctx, x, y, block.color, drawTileSize);
					}
				}
			}
		});
	}

	/**
	 * Draw current block to the renderer
	 * @param block Source of the block
	 * @param fieldManager Source of the game field to calculate shadow
	 */
	public drawCurrentBlock(block: Block, fieldManager: FieldManager): void {
		const shadows: NumDictionary<number> = {};

		block.iterate((row, col) => {
			const x = block.x + col;
			const y = block.y + row;
			this.drawBlock(this.ctx, x * constants.TILE_SIZE, y * constants.TILE_SIZE, block.color);
			if (!shadows[x] || shadows[x] < y) { shadows[x] = y; }
		});

		for (let key in shadows) {
			const x = Number(key);
			const y = shadows[x];
			const endOfShadow = (fieldManager.firstValueInCol(x, Math.max(y, 0)) - y) * constants.TILE_SIZE;
			this.drawBlockShadow(this.ctx, x * constants.TILE_SIZE, y * constants.TILE_SIZE, endOfShadow, block.color);
		}
	}

	/** Draw cached game to the renderer */
	public drawGame(): void {
		this.drawPreRender(this.ctx, this.gamePreRenderer.image, 0, 0);
	}

	/** Draw cached next block to the renderer */
	public drawNextBlock(): void {
		this.drawPreRender(this.ctx, this.nextBlockPreRenderer.image, constants.GAME_WIDTH + 7, 25);
	}

	/** Clear the game renderer */
	public clear(): void {
		this.ctx.clearRect(0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);
	}

}

export default RenderingTools;
