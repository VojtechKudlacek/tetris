import { createDomElement } from 'tetris/utils/dom';

const Score: Component<string> = (value) => {
	return createDomElement('span', 'tetris-value', value);
};

export default Score;
