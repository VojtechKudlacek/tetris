import React, { RefObject, Component, ReactNode, createRef } from 'react';
import Tetris from 'tetris';
import { SIZES } from 'tetris/const';

interface Properties { }

interface State {
	inMenu: boolean;
	gameOver: boolean;
}

class Game extends Component<Properties, State> {

	private canvasRef: RefObject<HTMLCanvasElement> = createRef<HTMLCanvasElement>();
	private tetris!: Tetris;

	constructor(props: Properties) {
		super(props);
		this.state = {
			inMenu: true,
			gameOver: false
		};
	}

	componentDidMount(): void {
		this.tetris = new Tetris(this.canvasRef.current as HTMLCanvasElement, this.onGameOver);
		this.tetris.init();
		this.tetris.start();
		(window as any).tetris = this.tetris;
	}

	onGameOver = () => {
		this.setState({ gameOver: true });
	}

	onRetry = () => {
		this.setState({ gameOver: false });
		this.tetris.restart();
	}

	onMainMenu = () => {
		this.setState({ gameOver: false, inMenu: true });
	}

	renderGameOver(): ReactNode {
		return (
			<div style={{ background: 'rgba(0, 0, 0, 0.9)', width: '100%', height: '100%', display: 'table', position: 'absolute', top: 0, left: 0 }}>
				<div style={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'center' }}>
					<div style={{ fontSize: 20 }}>GAME OVER!</div>
					<div style={{ marginTop: 20 }}>
						<button onClick={this.onRetry} style={{ marginRight: 20 }}>Retry</button>
						<button onClick={this.onMainMenu}>Main Menu</button>
					</div>
				</div>
			</div>
		);
	}

	render(): ReactNode {
		return (
			<div style={{ position: 'relative', width: SIZES.GAME_WIDTH, height: SIZES.GAME_HEIGHT, margin: 'auto', border: '5px solid #00c4ff', boxSizing: 'content-box' }}>
				<canvas width={SIZES.GAME_WIDTH} height={SIZES.GAME_HEIGHT} ref={this.canvasRef} style={{ display: 'block' }} />
				{this.state.gameOver && this.renderGameOver()}
			</div>
		);
	}

}

export default Game;
