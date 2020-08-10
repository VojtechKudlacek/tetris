import React, { FunctionComponent, useEffect, useRef, RefObject } from 'react';
import Tetris from 'tetris';
import { useStore } from 'store';

const Game: FunctionComponent = () => {
	const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
	const store = useStore();
	console.log(store);
	useEffect(() => {
		if (canvasRef.current) {
			const tetris = new Tetris(canvasRef.current);
			tetris.init();
			tetris.start();
			(window as any).tetris = tetris;
		}
	}, [canvasRef]);

	return <canvas width={400} height={600} ref={canvasRef} />;
}

export default Game;
