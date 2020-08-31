import Tetris from 'tetris';
import * as workers from 'services/workers';

const tetris: Tetris = new Tetris(document.getElementById('tetris') as HTMLElement);
tetris.init();

const versionRenderer = document.getElementById('version');
if (versionRenderer) {
	versionRenderer.innerHTML = '0.1.1';
}

workers.unregister();
