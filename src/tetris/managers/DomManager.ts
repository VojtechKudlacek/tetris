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
			this.parent.style.left = `${randomFromTo(-10, 10, true)}px`;
			this.parent.style.top = `${randomFromTo(-10, 10, true)}px`;
			setTimeout(() => this.shake(shakes - 1), 50);
		} else {
			this.parent.style.left = '';
			this.parent.style.top = '';
		}
	}

	private get volumeIcon(): SVGSVGElement {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('class', 'volume-icon');
		svg.setAttribute('viewBox', '0 0 27.717 27.717');
		svg.innerHTML = `<g fill="#ffffff">
		<path d="M4.637,8.725H0v10.33h4.637l8.766,6.502c0,0,1.611,1.346,1.611-0.045c0-1.395,0-22.177,0-23.446
			c0-1.092-1.418-0.025-1.418-0.025L4.637,8.725z"/>
		<path d="M20.006,6.709c-0.461-0.46-1.207-0.46-1.668,0c-0.461,0.462-0.461,1.211,0,1.666c1.518,1.521,2.27,3.495,2.273,5.484
			c-0.004,1.993-0.756,3.979-2.273,5.495c-0.461,0.459-0.461,1.211,0,1.672c0.23,0.23,0.531,0.344,0.836,0.344
			c0.301,0,0.602-0.113,0.832-0.344c1.977-1.979,2.965-4.578,2.963-7.167C22.971,11.273,21.98,8.682,20.006,6.709z"/>
		<path d="M23.207,2.994c-0.467-0.463-1.211-0.463-1.676,0c-0.457,0.463-0.457,1.208,0,1.671c2.549,2.548,3.822,5.869,3.824,9.206
			c-0.002,3.352-1.27,6.694-3.824,9.25c-0.459,0.461-0.457,1.207,0,1.67c0.232,0.229,0.537,0.344,0.838,0.344
			c0.303,0,0.607-0.115,0.838-0.344c3.006-3.018,4.51-6.973,4.51-10.92C27.717,9.937,26.203,5.996,23.207,2.994z"/>
		</g>`;
		return svg;
	}

	/**
	 * Create volume controls
	 * @param volume Initial volume
	 * @param onChange Update function
	 */
	public createVolumeControl(volume: number, onChange: (volume: number) => void): void {
		const wrap = createDomElement('div', 'volume-controls');
		const input = createDomElement('input', 'volume-input');
		input.type = 'range';
		input.min = '0';
		input.max = '1';
		input.step = '0.01';
		input.value = String(volume);

		input.addEventListener('change', ({ target }) => {
			const { value } = target as HTMLInputElement;
			onChange(Number(value));
		});

		wrap.appendChild(input);
		wrap.appendChild(this.volumeIcon);
		this.parent.appendChild(wrap);
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
