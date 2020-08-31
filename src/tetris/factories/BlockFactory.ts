import Block from 'tetris/classes/Block';
import * as utils from 'tetris/utils';
import { COLORS } from 'tetris/const';

/** Class for generating blocks */
class BlockFactory {

	/** List of default blocks */
	private readonly BLOCKS: Array<Block> = [
		new Block({
			value: [
				[0, 0, 0, 0],
				[1, 1, 1, 1],
				[0, 0, 0, 0],
				[0, 0, 0, 0]
			],
			color: COLORS.BLUE
		}),
		new Block({
			value: [
				[0, 0, 0],
				[1, 1, 1],
				[0, 0, 1]
			],
			color: COLORS.GREEN
		}),
		new Block({
			value: [
				[0, 0, 0],
				[1, 1, 1],
				[1, 0, 0]
			],
			color: COLORS.PURPLE
		}),
		new Block({
			value: [
				[1, 1],
				[1, 1]
			],
			color: COLORS.ORANGE
		}),
		new Block({
			value: [
				[0, 1, 1],
				[1, 1, 0],
				[0, 0, 0]
			],
			color: COLORS.PINK
		}),
		new Block({
			value: [
				[0, 0, 0],
				[1, 1, 1],
				[0, 1, 0]
			],
			color: COLORS.RED
		}),
		new Block({
			value: [
				[1, 1, 0],
				[0, 1, 1],
				[0, 0, 0]
			],
			color: COLORS.YELLOW
		})
	];

	/** List of available blocks */
	private picker: Array<Block> = [];

	/** Next playable block */
	public nextBlock!: Block;
	/** Curent playable block */
	public currentBlock!: Block;

	/** Fill list of available blocks */
	private fillPicker(): void {
		this.picker = this.BLOCKS.map((block) => block.duplicate());
	}

	/** Returns a pseudo random block */
	private pickRandomBlock(): Block {
		if (!this.picker.length) {
			// If picker is empty, refill it
			this.fillPicker();
		}
		// Remove one block from the picker and return it
		return this.picker.splice(utils.randomFromTo(0, this.picker.length - 1, true), 1)[0];
	}

	/** Initialize block picker and playable blocks */
	public init(): void {
		this.fillPicker();
		this.currentBlock = this.pickRandomBlock();
		this.nextBlock = this.pickRandomBlock();
	}

	/** Set curent block from next one and pick new block for next one */
	public useNextBlock(): void {
		this.currentBlock = this.nextBlock;
		this.nextBlock = this.pickRandomBlock();
	}

}

export default BlockFactory;
