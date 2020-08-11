interface Properties {
	minSize: number;
	maxSize: number;
	value: Array<Array<number>>;
	color: ColorSchema;
}

class Block {

	public minSize: number;
	public maxSize: number;
	public value: Array<Array<number>>;
	public color: ColorSchema;

	constructor(props: Properties) {
		this.minSize = props.minSize;
		this.maxSize = props.maxSize;
		this.value = props.value;
		this.color = props.color;
	}

	public rotateLeft(): void {
		const newValue = [];
		for (let i = 0; i < this.value[0].length; i++) {
			const newRow = this.value.map((row) => row[i]);
			newValue.push(newRow);
		}
		this.value = newValue;
	}

	public rotateRight(): void {
		const newValue = [];
		for (let i = 0; i < this.value[0].length; i++) {
			const newRow = this.value.map((row) => row[i]).reverse();
			newValue.push(newRow);
		}
		this.value = newValue;
	}

	public duplicate(): Block {
		return new Block({
			...this,
			value: JSON.parse(JSON.stringify(this.value))
		});
	}

}

export default Block;
