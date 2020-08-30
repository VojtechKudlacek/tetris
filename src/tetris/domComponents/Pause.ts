import { createDomElement } from 'tetris/utils/dom';
import Overlay from './Overlay';

const Score: Component = () => {
	return Overlay({ child: createDomElement('div', 'tetris-title', 'PAUSE') });
};

export default Score;
