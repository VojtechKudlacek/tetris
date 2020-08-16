import { SIZES } from 'tetris/const';

class Tools {

	static drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
		ctx.fillStyle = color;
		ctx.fillRect(x, y, w, h);
	}

	static fill(ctx: CanvasRenderingContext2D, w: number, h: number, color: string): void {
		this.drawRect(ctx, 0, 0, w, h, color);
	}

	static drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: Color, tileSize: number = SIZES.TILE): void {
		ctx.fillStyle = color.dark;
		ctx.fillRect(x, y, tileSize, tileSize);
		ctx.fillStyle = color.light;
		ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
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
