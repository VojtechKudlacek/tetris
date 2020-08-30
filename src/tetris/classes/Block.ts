import { COL_COUNT } from 'tetris/const';

/** 2D Arrays */
type BlockValue = Array<Array<number>>;

/** Default block settings */
interface Properties {
	minSize: number;
	maxSize: number;
	tiles: number;
	value: BlockValue;
	color: string;
	preview?: BlockValue;
	x?: number;
	y?: number;
}

/** Class to create block instances */
class Block implements Vector {

	/** Length of shorter side of the block */
	public minSize: number;
	/** Length of longer side of the block */
	public maxSize: number;
	/** Size of the block in cells */
	public tiles: number;
	/** Coliding model */
	public value: BlockValue;
	/** Cropped coliding model for rendering preview */
	public preview: BlockValue;
	/** Color of the block */
	public color: string;
	/** Current columns position */
	public x: number;
	/** Current row position */
	public y: number;

	constructor(props: Properties) {
		this.tiles = props.tiles;
		this.color = props.color;
		this.minSize = props.minSize;
		this.maxSize = props.maxSize;
		this.value = props.value;
		// Preview can be passed in to reduce calculations
		this.preview = props.preview || this.value.filter((row) => row.includes(1));
		// Use given X and Y position or calculate default one
		this.x = props.x ?? (COL_COUNT / 2) - Math.floor(this.tiles / 2);
		this.y = props.y ?? Math.ceil(this.tiles / 2) * (-1);
	}

	/** Rotate block value anti-clockwise */
	public rotateLeft(): void {
		const newValue = [];
		for (let col = 0; col < this.value[0].length; col++) {
			const newRow = this.value.map((row) => row[col]).reverse();
			newValue.push(newRow);
		}
		this.value = newValue;
	}

	/** Rotate block value clockwise */
	public rotateRight(): void {
		const newValue = [];
		for (let col = 0; col < this.value[0].length; col++) {
			const newRow = this.value.map((row) => row[this.value[0].length - col - 1])
			newValue.push(newRow);
		}
		this.value = newValue;
	}

	/** Return new instance based on this block */
	public duplicate(): Block {
		return new Block({
			minSize: this.minSize,
			maxSize: this.maxSize,
			tiles: this.tiles,
			value: JSON.parse(JSON.stringify(this.value)) as BlockValue,
			color: this.color,
			preview: this.preview,
			x: this.x,
			y: this.y,
		});
	}

	/**
	 * Iterate through the block and call given function for every cell
	 * @param fn Function called for every cell with given position, colision value and reference of the block
	 */
	public iterate(fn: (row: number, col: number, value: number, block: Block) => void | boolean): void {
		let stopIterating: void | boolean = false;
		for (let row = 0; row < this.tiles; row++) {
			if (stopIterating) { break; }
			for (let col = 0; col < this.tiles; col++) {
				stopIterating = fn(row, col, this.value[row][col], this);
				if (stopIterating) { break; }
			}
		}
	}

}

export default Block;
