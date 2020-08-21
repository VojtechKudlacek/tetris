import Block from 'tetris/classes/Block';
import PreRenderer from 'tetris/classes/PreRenderer';
import Tools from 'tetris/classes/Tools';
import FieldManager from 'tetris/managers/FieldManager';
import * as CONST from 'tetris/const';

class RenderingTools {

	private ctx: CanvasRenderingContext2D;

	private gamePreRenderer: PreRenderer = new PreRenderer({ height: CONST.CANVAS_HEIGHT, width: CONST.CANVAS_WIDTH });
	private nextBlockPreRenderer: PreRenderer = new PreRenderer({ height: CONST.NEXT_BLOCK_AREA, width: CONST.NEXT_BLOCK_AREA });

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	//* Public

	public preDrawGame(fieldManager: FieldManager): void {
		this.gamePreRenderer.draw((ctx, w, h) => {
			// Fill are with black color
			Tools.fill(ctx, w, h, '#000000');
			// Draw filled blocks with its color
			fieldManager.iterate((row, col, value, color) => {
				if (value) {
					Tools.drawBlock(ctx, col * CONST.TILE_SIZE, row * CONST.TILE_SIZE, color);
				}
			});
			// Draw sidebar border
			Tools.drawRect(ctx, CONST.GAME_WIDTH, 0, CONST.SIDEBAR_BORDER_WIDTH, CONST.CANVAS_HEIGHT, '#ffffff');
		});
	}

	public preDrawNextBlock(block: Block): void {
		this.nextBlockPreRenderer.draw((ctx, w, h) => {
			// Fill are with black color
			Tools.fill(ctx, w, h, '#000000');
			Tools.strokeRect(ctx, 1, 1, w - 2, h - 2, '#ffffff', 2);
			// Draw the next block
			const drawTileSize = (CONST.NEXT_BLOCK_AREA - (CONST.NEXT_BLOCK_AREA_PADDING * 2)) / CONST.NEXT_BLOCK_ARE_TILE_COUNT;
			// This is a bit of a hack, since all of the blocks are always vertically longer than horizontally
			const horizontalPadding = ((drawTileSize * (CONST.NEXT_BLOCK_ARE_TILE_COUNT - block.preview[0].length)) / 2) + CONST.NEXT_BLOCK_AREA_PADDING;
			const verticalPadding = ((drawTileSize * (CONST.NEXT_BLOCK_ARE_TILE_COUNT - block.preview.length)) / 2) + CONST.NEXT_BLOCK_AREA_PADDING;
			for (let row = 0; row < block.preview.length; row++) {
				for (let col = 0; col < block.preview[0].length; col++) {
					if (block.preview[row][col]) {
						const x = (col * drawTileSize) + horizontalPadding;
						const y = (row * drawTileSize) + verticalPadding;
						Tools.drawBlock(ctx, x, y, block.color, drawTileSize);
					}
				}
			}
		});
	}

	public drawCurrentBlock(block: Block): void {
		block.iterate((row, col, value, block) => {
			if (value) {
				const x = (block.x + col) * CONST.TILE_SIZE;
				const y = (block.y + row) * CONST.TILE_SIZE;
				Tools.drawBlock(this.ctx, x, y, block.color);
			}
		});
	}


	public drawNextBlock(): void {
		Tools.drawPreRender(this.ctx, this.nextBlockPreRenderer.image, CONST.GAME_WIDTH + 7, 25);
	}

	public drawGame(): void {
		Tools.drawPreRender(this.ctx, this.gamePreRenderer.image, 0, 0);
	}

	public clear(): void {
		Tools.clear(this.ctx, CONST.CANVAS_WIDTH, CONST.CANVAS_HEIGHT);
	}

}

export default RenderingTools;
