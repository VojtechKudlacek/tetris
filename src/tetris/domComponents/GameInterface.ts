import { createDomElement, createStructuredDom } from 'tetris/utils/dom';
import { AVAILABLE_KEYS } from 'tetris/const';
import Score from './Score';

interface Properties {
	score: string;
	highScore: string;
	keys: Controls;
	level: string;
	clearedRows: string;
}

const GameInterface: Component<Properties> = ({ score, highScore, keys, level, clearedRows }) => {
	const availableOptions = [
		['Left', keys.LEFT],
		['Right', keys.RIGHT],
		['Rotate Left', keys.ROTATE_LEFT],
		['Rotate Right', keys.ROTATE_RIGHT],
		['Speed Up', keys.DOWN],
		['Hard Drop', keys.DROP],
		['Pause', keys.PAUSE],
	];

	return createStructuredDom({
		parent: createDomElement('div', 'tetris-overlay'),
		children: [
			{
				parent: createDomElement('div', 'tetris-ui'),
				children: [
					{
						parent: createDomElement('div', 'tetris-stats'),
						children: [
							createDomElement('span', 'tetris-label tetris-next-block', 'NEXT BLOCK'),
							createDomElement('span', 'tetris-label', 'SCORE'),
							Score(score),
							createDomElement('span', 'tetris-label', 'HIGH SCORE'),
							Score(highScore),
							createDomElement('span', 'tetris-label', 'LEVEL'),
							createDomElement('span', 'tetris-value', level),
							createDomElement('span', 'tetris-label', 'ROWS'),
							createDomElement('span', 'tetris-value', clearedRows),
						]
					}, {
						parent: createDomElement('div', 'tetris-controls'),
						children: availableOptions.map(([label, key]) => {
							const el = createDomElement(
								'div',
								'tetris-controls-label',
								`<span class="tetris-label">${label}</span><span class="tetris-value">${AVAILABLE_KEYS[key]}</span>`
							);
							return el;
						})
					}
				]
			}
		]
	});
};

export default GameInterface;
