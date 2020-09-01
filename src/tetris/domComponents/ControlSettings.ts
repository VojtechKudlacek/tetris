import { createDomElement, createStructuredDom } from 'tetris/utils/dom';
import { AVAILABLE_KEYS } from 'tetris/const';
import Overlay from './Overlay';

interface Properties {
	updateKey: (key: keyof Controls, value: number) => void;
	onRestart: () => void;
	onMenu: () => void;
	keys: Controls;
}

const ControlSettings: Component<Properties> = ({ updateKey, onRestart, onMenu, keys }) => {
	const controls = [
		['Left', keys.LEFT, 'LEFT'],
		['Right', keys.RIGHT, 'RIGHT'],
		['Rotate Left', keys.ROTATE_LEFT, 'ROTATE_LEFT'],
		['Rotate Right', keys.ROTATE_RIGHT, 'ROTATE_RIGHT'],
		['Speed Up', keys.DOWN, 'DOWN'],
		['Hard Drop', keys.DROP, 'DROP'],
		['Pause', keys.PAUSE, 'PAUSE'],
	];

	const retryButton = createDomElement('button', 'tetris-button', 'RESTART');
	retryButton.addEventListener('click', onRestart);

	const mainMenuButton = createDomElement('button', 'tetris-button', 'MAIN MENU');
	mainMenuButton.addEventListener('click', onMenu);

	const view = createStructuredDom({
		parent: createDomElement('div', 'tetris-controls-settings'),
		children: [
			{
				parent: createDomElement('div', 'tetris-title', 'CONTROLS'),
			}, {
				parent: createDomElement('div', 'tetris-controls-edit'),
				children: controls.map(([label, value, controlKey], index) => {
					const wrapElement = createDomElement('div', 'tetris-controls-row');
					const labelElement = createDomElement('span', 'tetris-controls-label', label as string);
					const editButton = createDomElement('button', 'tetris-button tetris-controls-button', AVAILABLE_KEYS[value as number]);

					const windowKeyPressed = ({ keyCode }: KeyboardEvent) => {
						if (AVAILABLE_KEYS[keyCode]) {
							controls[index][1] = keyCode;
							editButton.innerHTML = AVAILABLE_KEYS[keyCode];
							updateKey(controlKey as keyof Controls, keyCode);
						}
						editButton.className = 'tetris-button tetris-controls-button';
						window.removeEventListener('keydown', windowKeyPressed);
					}

					editButton.addEventListener('click', () => {
						editButton.className = 'tetris-button tetris-controls-button tetris-active';
						window.addEventListener('keydown', windowKeyPressed);
					});

					wrapElement.appendChild(labelElement);
					wrapElement.appendChild(editButton);
					return wrapElement;
				})
			}, {
				parent: createDomElement('div', 'tetris-controls-buttons'),
				children: [retryButton, mainMenuButton]
			}
		]
	});
	return Overlay({ child: view });
};

export default ControlSettings;
