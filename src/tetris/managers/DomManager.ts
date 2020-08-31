import { CANVAS_WIDTH, CANVAS_HEIGHT } from 'tetris/const';
import { createDomElement } from 'tetris/utils/dom';
import { randomFromTo } from 'tetris/utils';

/** Class to manage DOM */
class DomManager {

	/** Root element to render the game and UI layer */
	private parent: HTMLElement;
	/** Element to render the components */
	private uiRenderer!: HTMLElement;

	/** Game renderer */
	public canvas!: HTMLCanvasElement;

	constructor(element: HTMLElement) {
		this.parent = element;
	}

	/** Create game renderer */
	public createCanvas(): void {
		this.canvas = createDomElement('canvas', 'tetris-renderer');
		this.canvas.width = CANVAS_WIDTH;
		this.canvas.height = CANVAS_HEIGHT;
	}
	/**
	 * Render UI component
	 * @param component Function to create HTML element
	 * @param args Function arguments
	 */
	public renderComponent<P>(component: Component<P>, args: P): void {
		this.uiRenderer.innerHTML = '';
		this.uiRenderer.appendChild(component(args));
	}

	/**
	 * Shake with the parent element to shake everything
	 * @param shakes Number of shakes
	 */
	public shake(shakes: number = 10): void {
		if (shakes > 0) {
			this.parent.style.left = `${randomFromTo(-5, 5, true)}px`;
			this.parent.style.top = `${randomFromTo(-5, 5, true)}px`;
			setTimeout(() => this.shake(shakes - 1), 50);
		} else {
			this.parent.style.left = '';
			this.parent.style.top = '';
		}
	}

	/** Set root sizes and append renderer and UI layer */
	public init(): void {
		// Update given element
		this.parent.className = 'tetris';
		this.parent.style.width = `${CANVAS_WIDTH}px`;
		this.parent.style.height = `${CANVAS_HEIGHT}px`;
		// Create components root
		this.uiRenderer = createDomElement('div', 'tetris-ui-renderer');
		// Add renderers to the root
		this.parent.innerHTML = '';
		this.parent.appendChild(this.canvas);
		this.parent.appendChild(this.uiRenderer);
	}

}

export default DomManager;
