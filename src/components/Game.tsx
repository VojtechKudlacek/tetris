import React, { FunctionComponent, useEffect, useRef, useState, RefObject, useMemo } from 'react';
import Tetris from 'tetris';
import { SIZES } from 'tetris/const';

const Game: FunctionComponent = () => {
	const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);

	const [inMenu, setInMenu] = useState<boolean>(false);
	const canvasSizes = useMemo<Size>(() => ({ w: (SIZES.COL_COUNT * SIZES.TILE) + SIZES.SIDEBAR, h: SIZES.ROW_COUNT * SIZES.TILE }), []);

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
