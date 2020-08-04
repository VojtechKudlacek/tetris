const BLOCKS = {
	I: [
		[1, 1, 1, 1]
	],
	J: [
		[1, 0, 0],
		[1, 1, 1]
	],
	L: [
		[0, 0, 1],
		[1, 1, 1]
	],
	O: [
		[1, 1],
		[1, 1]
	],
	S: [
		[0, 1, 1],
		[1, 1, 0]
	],
	T: [
		[0, 1, 0],
		[1, 1, 1]
	],
	Z: [
		[1, 1, 0],
		[0, 1, 1]
	]
}

const KEYS = {
	ARROW_LEFT: 37,
	ARROW_UP: 38,
	ARROW_RIGHT: 39,
	ARROW_DOWN: 40,
	SPACE: 32
}

class Tetris {

	/**
	 * @param {HTMLCanvasElement} canvas 
	 */
	constructor(canvas) {
		this.canvas = canvas
		this.ctx = canvas.getContext('2d')
		this.animating = false
		this.field = Array(20).fill().map(() => Array(10).fill(0))
		this.pickerA = Object.values(BLOCKS)
		this.pickerB = Object.values(BLOCKS)
	}

	start() {
		this.animating = true
		this.registerEvents()
		this.loop()
	}

	end() {
		this.animating = false
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.ctx.fillStyle = '#ffffff'
		this.ctx.fillRect(0, 0, 300, 600)
	}

	draw() {
		this.ctx.fillStyle = '#000000'
		for (let i = 0; i < this.field.length; i++) {
			for (let j = 0; j < this.field[i].length; j++) {
				if (this.field[i][j]) {
					this.ctx.fillRect(j * 30, i * 30, 30, 30)
				}
			}
		}
	}

	loop = (delta) => {
		this.clear()

		if (this.animating) {
			requestAnimationFrame(this.loop)
		}
	}

	randomFromTo(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	registerEvents() {
		window.addEventListener('keydown', (e) => {
			switch(e.keyCode) {
				case KEYS.ARROW_LEFT:
					break
				default:
					break
			}
		})
	}

}

export default Tetris
