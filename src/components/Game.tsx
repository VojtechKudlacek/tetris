import React, { FunctionComponent, useEffect, useRef, useState, RefObject, useMemo } from 'react';
import Tetris from 'tetris';
import { SIZES } from 'tetris/const';

interface State {
	isPaused: boolean;
	inGame: boolean;
	inMenu: boolean;
}

interface CanvasSizes {
	w: number;
	h: number;
}

const Game: FunctionComponent = () => {
	const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
	const [state, setState] = useState<State>({ isPaused: false, inGame: false, inMenu: false });

	const canvasSizes = useMemo<CanvasSizes>(() => ({ w: (SIZES.COLS * SIZES.TILE) + SIZES.SIDEBAR, h: SIZES.ROWS * SIZES.TILE }), []);

	useEffect(() => {
		if (canvasRef.current) {
			const tetris = new Tetris(canvasRef.current);
			tetris.init();
			tetris.start();
			(window as any).tetris = tetris;
		}
	}, [canvasRef]);

	return (
		<div className="game">
			<canvas width={canvasSizes.w} height={canvasSizes.h} ref={canvasRef} />
		</div>
	);
}

export default Game;
