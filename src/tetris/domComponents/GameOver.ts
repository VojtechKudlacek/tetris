import { createDomElement, createStructuredDom } from 'tetris/utils/dom';
import Score from './Score';
import Overlay from './Overlay';

interface Properties {
	onMenu: VoidFunction;
	onRestart: VoidFunction;
	score: string;
	highScore: string;
}

const GameOver: Component<Properties> = ({ score, highScore, onMenu, onRestart }) => {
	const retryButton = createDomElement('button', 'tetris-button', 'RETRY');
	retryButton.addEventListener('click', onRestart);

	const mainMenuButton = createDomElement('button', 'tetris-button', 'MAIN MENU');
	mainMenuButton.addEventListener('click', onMenu);

	const view = createStructuredDom({
		parent: createDomElement('div', 'tetris-game-over'),
		children: [
			createDomElement('div', 'tetris-title', 'GAME OVER!'),
			{
				parent: createDomElement('div', 'tetris-game-over-score'),
				children: [
					{
						parent: createDomElement('div', 'tetris-game-over-score-box'),
						children: [
							createDomElement('span', 'tetris-label', 'SCORE'),
							Score(score)
						]
					}, {
						parent: createDomElement('div', 'tetris-game-over-score-box'),
						children: [
							createDomElement('span', 'tetris-label', 'HIGH SCORE'),
							Score(highScore)
						]
					}
				]
			}, {
				parent: createDomElement('div', 'tetris-buttons'),
				children: [
					retryButton,
					mainMenuButton
				]
			}
		]
	})

	return Overlay({ child: view, bonusClassName: 'tetris-dark-overlay' });
};

export default GameOver;
