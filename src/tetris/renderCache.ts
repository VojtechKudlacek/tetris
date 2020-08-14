class RenderCache {

	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	constructor() {
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
	}

	get() {

	}

}
