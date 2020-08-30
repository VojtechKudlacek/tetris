import { createDomElement, createStructuredDom } from 'tetris/utils/dom';
import { AVAILABLE_KEYS } from 'tetris/const';
import Score from './Score';

interface Properties {
	score: string;
	highScore: string;
	keys: KeysReference;
}

const GameOver: Component<Properties> = ({ score, highScore, keys }) => {
	const availableOptions = [
		['Left', keys.holdableKeys.LEFT],
		['Right', keys.holdableKeys.RIGHT],
		['Rotate Left', keys.pressableKeys.ROTATE_LEFT],
		['Rotate Right', keys.pressableKeys.ROTATE_RIGHT],
		['Speed Up', keys.holdableKeys.DOWN],
		['Pause', keys.pressableKeys.PAUSE],
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
							Score(highScore)
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

export default GameOver;
