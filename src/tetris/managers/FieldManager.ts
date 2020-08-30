import Block from 'tetris/classes/Block';
import * as utils from 'tetris/utils';
import { ROW_COUNT, COL_COUNT } from 'tetris/const';

/** 2D array of given type */
type Field<T> = Array<Array<T>>;

/** Class to manage game field and colisions in it */
class FieldManager {

	/** Colision field - `1` = block placed; `0` = empty */
	private field: Field<number> = [];
	/** 2D array with color strings that matches the `field` values */
	private colors: Field<string> = [];

	/** Create field with predefined sizes based on constants */
	public init(): void {
		this.field = utils.create2DArray(ROW_COUNT, COL_COUNT, 0);
		// For typescript reasons it is easier to place here empty string than `null` :MEH:
		this.colors = utils.create2DArray(ROW_COUNT, COL_COUNT, '');
	}

	/**
	 * Iterate through the 2D array and for every cell call given function
	 * @param fn Function called for every field cell with given position, colision value and color
	 */
	public iterate(fn: (row: number, col: number, value: number, color: string) => void): void {
		// Using constants values rather than array length for better readability
		for (let row = 0; row < ROW_COUNT; row++) {
			for (let col = 0; col < COL_COUNT; col++) {
				fn(row, col, this.field[row][col], this.colors[row][col]);
			}
		}
	}

	/**
	 * Iterate through the field rows and call given function for every row
	 * @param fn Function called for every row with propriet row index
	 */
	public iterateRows(fn: (rowIndex: number) => void): void {
		for (let row = 0; row < ROW_COUNT; row++) {
			fn(row);
		}
	}

	/**
	 * Iterate through the field columns in given row and call given function for every cell
	 * @param row Index of iterated row
	 * @param fn Function called for every cell in the iterated row
	 */
	public iterateCols(row: number, fn: (col: number, value: number, color: string) => void): void {
		// This should never happend if used properly, but it prevents some possible errors
		if (!this.field[row]) { return; }
		for (let col = 0; col < COL_COUNT; col++) {
			fn(col, this.field[row][col], this.colors[row][col]);
		}
	}

	/**
	 * Return if row with given index if full filled with blocks
	 * @param row Index of row to be checked
	 */
	public isRowFilled(row: number): boolean {
		let count = 0;
		for (let col = 0; col < COL_COUNT; col++) {
			if (this.field[row][col]) { count++; }
		}
		// Using constants values rather than array length for better readability
		return count === COL_COUNT;
	}

	/**
	 * Add the block to the colision field
	 * @param block Block instance
	 */
	public placeBlock(block: Block): void {
		block.iterate((row, col, value) => {
			if (value && (row + block.y) >= 0) {
				this.field[row + block.y][col + block.x] = 1;
				this.colors[row + block.y][col + block.x] = block.color;
			}
		});
	}

	/**
	 * Clear row by removing it and placing a new one to the top
	 * @param row Row index
	 */
	public clearRow(row: number): void {
		this.field.splice(row, 1);
		this.field.unshift(utils.createArray(COL_COUNT, 0));
		this.colors.splice(row, 1);
		this.colors.unshift(utils.createArray(COL_COUNT, ''));
	}

	/**
	 * Return is block will be coliding with given position
	 * @param block Block instance
	 * @param x Columns position of the request
	 * @param y Row position of the request
	 */
	public isColiding(block: Block, x: number, y: number): boolean {
		let coliding: boolean = false;
		block.iterate((row, col, value) => {
			if (value) { // Check if block has value at current iterated position, it is still 2D array with possible empty cells
				if ( // Colission system
					(x + col < 0) || // If block is offscreen (left)
					(x + col >= COL_COUNT) || // If block is offscreen (right)
					(y + row >= ROW_COUNT) || // If block is offscreen (bottom)
					(this.field[y + row] && this.field[y + row][x + col]) // If block coliding with another placed block
				) {
					// Set the coliding value to true and break
					coliding = true;
					// `true` here is for breaking the iteration
					return true;
				}
			}
			return false;
		});
		return coliding;
	};

	/**
	 * Iterate through the field and clear filled rows
	 * @param fn Function called for every cleared row
	 */
	public clearFilledRows(fn: (row: number, cleared: number) => void): void {
		let cleared = 0;
		this.iterateRows((row) => {
			if (this.isRowFilled(row)) {
				this.clearRow(row);
				// Reason of this function is only for particles generation on row clear
				fn(row, ++cleared);
			}
		});
	}

	/**
	 * Check if there is a block in the first row
	 * Probably not to best way to check game over :MEH:
	 */
	public get isBlockInFirstRow(): boolean {
		const firstRow = this.field[0];
		return firstRow.includes(1);
	}

}

export default FieldManager;
