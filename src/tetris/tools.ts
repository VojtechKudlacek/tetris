class Tools {

	private ctx: CanvasRenderingContext2D;

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	public clear(width: number, height: number, color: string): void {
		this.ctx.clearRect(0, 0, width, height);
		this.setColor(color);
		this.ctx.fillRect(0, 0, width, height);
	}

	public setColor(color: string): void {
		this.ctx.fillStyle = color;
	}

	public draw(x: number, y: number, w: number, h: number): void {
		this.ctx.fillRect(x, y, w, h)
	}

	public write(x: number, y: number, text: string): void {
		this.ctx.font = '14px monospace';
		this.ctx.fillText(text, x, y);
	}

}

export default Tools;
