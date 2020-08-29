import * as utils from 'tetris/utils';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../const';

interface Particle extends Vector {
	vx: number;
	vy: number;
	radius: number;
	color: string;
}

class ParticleFactory {

	private ctx: CanvasRenderingContext2D;

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	public particles: Array<Particle> = [];

	public createParticle(x: number, y: number, color: string, sizeIncrement: number): void {
		this.particles.push({
			x,
			y,
			radius: utils.randomFromTo(2 + sizeIncrement, 5 + sizeIncrement),
			vx: utils.randomFromTo(-5, 5),
			vy: utils.randomFromTo(-5, 5),
			color
		});
	}

	public createParticles(x: number, y: number, color: string, amount: number, sizeIncrement: number = 0): void {
		for (let i = 0; i < amount; i++) {
			this.createParticle(x, y, color, sizeIncrement);
		}
	}

	public processParticles(): void {
		for(let i = 0; i < this.particles.length; i++){
			const particle = this.particles[i];
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.radius -= .02;
			if(particle.radius < 0 || particle.x < 0 || particle.y < 0 || particle.x > CANVAS_WIDTH || particle.y > CANVAS_HEIGHT) {
				this.particles.splice(i, 1);
				i--; // Don't forget to lower the index when removing record from array
			}
		}
	}

	public drawParticles(): void {
		this.ctx.lineWidth = 2;
		for(let i = 0; i < this.particles.length; i++){
			const particle = this.particles[i];
			this.ctx.strokeStyle = particle.color;
			this.ctx.strokeRect(particle.x, particle.y, particle.radius, particle.radius);
		}
	}

}

export default ParticleFactory;
