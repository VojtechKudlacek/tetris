import Tetris from 'tetris';
import * as workers from 'services/workers';

const tetris: Tetris = new Tetris(document.getElementById('tetris') as HTMLElement);
tetris.init();

workers.unregister();
