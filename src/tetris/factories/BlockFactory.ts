import Block from 'tetris/classes/Block';
import * as utils from 'tetris/utils';
import { COLORS } from 'tetris/const';

class BlockFactory {

	private readonly BLOCKS: Array<Block> = [
		new Block({
			minSize: 1,
			maxSize: 4,
			tiles: 4,
			value: [
				[0, 0, 0, 0],
				[1, 1, 1, 1],
				[0, 0, 0, 0],
				[0, 0, 0, 0]
			],
			color: COLORS.BLUE
		}),
		new Block({
			minSize: 2,
			maxSize: 3,
			tiles: 3,
			value: [
				[0, 0, 0],
				[1, 1, 1],
				[0, 0, 1]
			],
			color: COLORS.GREEN
		}),
		new Block({
			minSize: 2,
			maxSize: 3,
			tiles: 3,
			value: [
				[0, 0, 0],
				[1, 1, 1],
				[1, 0, 0]
			],
			color: COLORS.PURPLE
		}),
		new Block({
			minSize: 2,
			maxSize: 2,
			tiles: 2,
			value: [
				[1, 1],
				[1, 1]
			],
			color: COLORS.ORANGE
		}),
		new Block({
			minSize: 2,
			maxSize: 3,
			tiles: 3,
			value: [
				[0, 1, 1],
				[1, 1, 0],
				[0, 0, 0]
			],
			color: COLORS.PINK
		}),
		new Block({
			minSize: 2,
			maxSize: 3,
			tiles: 3,
			value: [
				[0, 0, 0],
				[1, 1, 1],
				[0, 1, 0]
			],
			color: COLORS.RED
		}),
		new Block({
			minSize: 2,
			maxSize: 3,
			tiles: 3,
			value: [
				[1, 1, 0],
				[0, 1, 1],
				[0, 0, 0]
			],
			color: COLORS.YELLOW
		})
	];

	private picker: Array<Block> = [];

	public nextBlock!: Block;
	public currentBlock!: Block;

	private fillPicker(): void {
		this.picker = this.BLOCKS.map((block) => block.duplicate());
	}

	private pickRandomBlock(): Block {
		if (!this.picker.length) {
			// If picker is empty, refill it
			this.fillPicker();
		}
		// Remove one block from the picker and return it
		return this.picker.splice(utils.randomFromTo(0, this.picker.length - 1, true), 1)[0];
	}

	public init(): void {
		this.nextBlock = this.pickRandomBlock();
		this.currentBlock = this.pickRandomBlock();
	}

	public useNextBlock(): void {
		this.currentBlock = this.nextBlock;
		this.nextBlock = this.pickRandomBlock();
	}

}

export default BlockFactory;
