import Block from 'tetris/classes/Block';
import * as utils from 'tetris/utils';
import { ROW_COUNT, COL_COUNT } from 'tetris/const';

type Field<T> = Array<Array<T>>;

class FieldManager {

	private field: Field<number> = [];
	private colors: Field<string> = [];

	public init(): void {
		this.field = utils.create2DArray(ROW_COUNT, COL_COUNT, 0);
		this.colors = utils.create2DArray(ROW_COUNT, COL_COUNT, '');
	}

	public iterate(fn: (row: number, col: number, value: number, color: string) => void): void {
		for (let row = 0; row < ROW_COUNT; row++) {
			for (let col = 0; col < COL_COUNT; col++) {
				fn(row, col, this.field[row][col], this.colors[row][col]);
			}
		}
	}

	public iterateRows(fn: (row: number) => void): void {
		for (let row = 0; row < ROW_COUNT; row++) {
			fn(row);
		}
	}

	public iterateCols(row: number, fn: (col: number, value: number, color: string) => void): void {
		for (let col = 0; col < COL_COUNT; col++) {
			fn(col, this.field[row][col], this.colors[row][col]);
		}
	}

	public isRowFilled(row: number): boolean {
		let count = 0;
		for (let col = 0; col < COL_COUNT; col++) {
			if (this.field[row][col]) { count++; }
		}
		return count === COL_COUNT;
	}

	public colorAt(row: number, col: number): string {
		return this.colors[row][col];
	}

	public placeBlock(block: Block): void {
		block.iterate((row, col, value) => {
			if (value && (row + block.y) >= 0) {
				this.field[row + block.y][col + block.x] = 1;
				this.colors[row + block.y][col + block.x] = block.color;
			}
		});
	}

	public clearRow(row: number): void {
		this.field.splice(row, 1);
		this.field.unshift(utils.createArray(COL_COUNT, 0));
		this.colors.splice(row, 1);
		this.colors.unshift(utils.createArray(COL_COUNT, ''));
	}

	public isColiding (block: Block, x: number, y:number): boolean {
		let coliding: boolean = false;
		block.iterate((row, col, value) => {
			if (value) { // If block has value at current iterated position
				if (
					(x + col < 0) || // If block is offscreen (left)
					(x + col >= COL_COUNT) || // If block is offscreen (right)
					(y + row >= ROW_COUNT) || // If block is offscreen (bottom)
					(this.field[y + row] && this.field[y + row][x + col]) // If block coliding with another placed block
				) {
					coliding = true;
					return true;
				}
			}
			return false;
		});
		return coliding;
	};

	public checkAndClearFilledRows(fn: (row: number, cleared: number) => void): void {
		let cleared = 0;
		this.iterateRows((row) => {
			if (this.isRowFilled(row)) {
				this.clearRow(row);
				fn(row, ++cleared);
			}
		});
	}

	public get isBlockInFirstRow(): boolean {
		for (let i = 0; i < this.field[0].length; i++) {
			if (this.field[0][i]) {
				return true;
			}
		}
		return false;
	}

}

export default FieldManager;
