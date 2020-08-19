import { TILE_SIZE } from 'tetris/const';

class Tools {

	static clear(ctx: CanvasRenderingContext2D, w: number, h: number): void {
		ctx.clearRect(0, 0, w, h);
	}

	static drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
		ctx.fillStyle = color;
		ctx.fillRect(x, y, w, h);
	}

	static strokeRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, width: number): void {
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.strokeRect(x, y, w, h);
	}

	static fill(ctx: CanvasRenderingContext2D, w: number, h: number, color: string): void {
		this.drawRect(ctx, 0, 0, w, h, color);
	}

	static drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width: number = 2): void {
		ctx.lineWidth = width;
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	static drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, tileSize: number = TILE_SIZE): void {
		this.drawLine(ctx, x + 2, y + 2, x + tileSize - 2, y + tileSize - 2, color, 2);
		this.drawLine(ctx, x + 2, y + tileSize - 2, x + tileSize - 2, y + 2, color, 2);
		this.strokeRect(ctx, x + 2, y + 2, tileSize - 4, tileSize - 4, color, 2);
	}

	static write(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string): void {
		ctx.fillStyle = color;
		ctx.font = '14px monospace';
		ctx.fillText(text, x, y);
	}

	static drawPreRender(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, x: number, y: number): void {
		ctx.drawImage(canvas, x, y);
	}

}

export default Tools;