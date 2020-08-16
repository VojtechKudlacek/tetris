interface Properties {
	minSize: number;
	maxSize: number;
	defaultX: number;
	defaultY: number;
	tiles: number;
	value: Array<Array<number>>;
	color: Color;
}

class Block implements Vector {

	public minSize: number;
	public maxSize: number;
	public tiles: number;

	public value: Array<Array<number>>;
	public preview: Array<Array<number>>;
	public color: Color;

	public defaultX: number;
	public defaultY: number;
	public x: number;
	public y: number;

	constructor(props: Properties) {
		this.x = props.defaultX;
		this.y = props.defaultY;
		this.defaultX = props.defaultX;
		this.defaultY = props.defaultY;
		this.minSize = props.minSize;
		this.maxSize = props.maxSize;
		this.tiles = props.tiles;
		this.color = props.color;
		this.value = props.value;
		this.preview = this.value.filter((row) => row.includes(1));
	}

	public rotateLeft(): void {
		const newValue = [];
    for (let col = 0; col < this.value[0].length; col++) {
			const newRow = this.value.map((row) => row[this.value[0].length - col - 1])
			newValue.push(newRow);
		}
		this.value = newValue;
	}

	public rotateRight(): void {
		const newValue = [];
		for (let col = 0; col < this.value[0].length; col++) {
			const newRow = this.value.map((row) => row[col]).reverse();
			newValue.push(newRow);
		}
		this.value = newValue;
	}

	public setX(x: number): void {
		this.x = x;
	}

	public setY(y: number): void {
		this.y = y;
	}

	public getPosition(): Vector {
		return {
			x: this.x,
			y: this.y
		};
	}

	public duplicate(): Block {
		return new Block({
			...this,
			defaultX: this.x,
			defaultY: this.y,
			value: JSON.parse(JSON.stringify(this.value))
		});
	}

}

export default Block;
