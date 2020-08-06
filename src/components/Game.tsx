import React, { FunctionComponent, useEffect, useRef, RefObject } from 'react';
import Tetris from 'tetris';

const Game: FunctionComponent = () => {
	const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (canvasRef.current) {
			const tetris = new Tetris(canvasRef.current);
			tetris.init();
			tetris.start();
		}
	}, [canvasRef]);

	return <canvas width={400} height={600} ref={canvasRef} />;
}

export default Game;
