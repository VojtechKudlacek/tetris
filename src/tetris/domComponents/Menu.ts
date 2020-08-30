import { createDomElement, createStructuredDom } from 'tetris/utils/dom';
import { LEVEL_COUNT } from 'tetris/const';
import Overlay from './Overlay';

interface Properties {
	onLevelSelect: (level: number) => void;
}

const Menu: Component<Properties> = ({ onLevelSelect }) => {
	const view = createStructuredDom({
		parent: createDomElement('div', 'tetris-menu-box'),
		children: [
			createDomElement('div', 'tetris-title', 'CHOOSE LEVEL!'),
			{
				parent: createDomElement('div', 'tetris-levels'),
				children: Array.from({ length: LEVEL_COUNT }, (_, level) => {
					const button = createDomElement('button', 'tetris-button tetris-level', String(level + 1));
					button.addEventListener('click', () => onLevelSelect(level + 1));
					return button;
				})
			}
		]
	})

	return Overlay({ child: view });
};

export default Menu;
