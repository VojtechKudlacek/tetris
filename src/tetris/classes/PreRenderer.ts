import { createDomElement } from 'tetris/utils/dom';

/** PreRenderer construction options */
interface Properties {
	width: number;
	height: number;
}

/** Class to cache rendering contexts to save performance */
class PreRenderer {

	/** Canvas element to be rendered as "image" */
	private canvas: HTMLCanvasElement;
	/** Rendering context */
	private ctx: CanvasRenderingContext2D;
	/** Width of the image */
	private width: number;
	/** Height of the image */
	private height: number;

	constructor(props: Properties) {
		this.canvas = createDomElement('canvas');
		// I dont like this either, so I don't know why it's here ¯\_(ツ)_/¯
		this.canvas.width = this.width = props.width;
		this.canvas.height = this.height = props.height;
		// Disabled alpha for some small performance boost
		this.ctx = this.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
	}

	/** Clear the cached context */
	public clear(): void {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	/**
	 * Draw the image
	 * @param fn Drawing function with given rendering context and image width and height
	 */
	public draw(fn: (ctx: CanvasRenderingContext2D, width: number, height: number) => void): void {
		// Yes, clear the image first - so it's basically "overdraw" instead of "draw" ¯\_(ツ)_/¯
		this.clear();
		// It looks better from outside of the class :'D
		fn(this.ctx, this.width, this.height);
	}

	/** Returns image to be rendered */
	public get image(): HTMLCanvasElement {
		return this.canvas;
	}

}

export default PreRenderer;
