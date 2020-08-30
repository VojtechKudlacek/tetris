import { createDomElement } from 'tetris/utils/dom';
import Overlay from './Overlay';

const Score: Component = () => {
	return Overlay({ child: createDomElement('div', 'tetris-title', 'PAUSE'), bonusClassName: 'tetris-black-overlay' });
};

export default Score;
