import { createDomElement, createStructuredDom } from 'tetris/utils/dom';

interface Properties {
	child: HTMLElement;
	bonusClassName?: string;
}

const Overlay: Component<Properties> = ({ child, bonusClassName }) => {
	let className = 'tetris-overlay';

	if (bonusClassName) {
		className += (' ' + bonusClassName);
	}

	return createStructuredDom({
		parent: createDomElement('div', className),
		children: [{
			parent: createDomElement('div', 'tetris-aligner'),
			children: [child]
		}]
	});
};

export default Overlay;
