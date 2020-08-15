interface Properties {
	width: number;
	height: number;
}

class PreRenderer {

	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private width: number;
	private height: number;

	constructor(props: Properties) {
		this.canvas = document.createElement('canvas');
		this.canvas.width = props.width;
		this.width = props.width;
		this.canvas.height = props.height;
		this.height = props.height;
		this.ctx = this.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
	}

	public clear(): void {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	public draw(fn: (ctx: CanvasRenderingContext2D) => void): void {
		this.clear();
		fn(this.ctx)
	}

	public get() {
		return this.canvas;
	}

}

export default PreRenderer;
