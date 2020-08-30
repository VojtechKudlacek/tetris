import * as utils from 'tetris/utils';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../const';

/** Particle structure */
interface Particle extends Vector {
	vx: number;
	vy: number;
	radius: number;
	color: string;
}

/** Class for managing particles */
class ParticleFactory {

	/** Particle list */
	public particles: Array<Particle> = [];

	/**
	 * Creates a particle
	 * @param x X position to spawn particle
	 * @param y Y position to spawn particle
	 * @param color Color of the particle
	 * @param sizeIncrement Increment from default particle size
	 */
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

	/**
	 * Creates multiple particles
	 * @param x X position to spawn particles
	 * @param y Y position to spawn particles
	 * @param color Color of the particles
	 * @param amount Particle number
	 * @param sizeIncrement Increment from default particle size
	 */
	public createParticles(x: number, y: number, color: string, amount: number, sizeIncrement: number = 0): void {
		for (let i = 0; i < amount; i++) {
			this.createParticle(x, y, color, sizeIncrement);
		}
	}

	/** Process particle movement and fade */
	public processParticles(): void {
		for (let i = 0; i < this.particles.length; i++) {
			const particle = this.particles[i];
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.radius -= .02;
			if (particle.radius < 0 || particle.x < 0 || particle.y < 0 || particle.x > CANVAS_WIDTH || particle.y > CANVAS_HEIGHT) {
				this.particles.splice(i, 1);
				i--; // Don't forget to lower the index when removing record from array
			}
		}
	}

	/**
	 * Render particles
	 * @param ctx Context to draw particles to
	 */
	public drawParticles(ctx: CanvasRenderingContext2D): void {
		ctx.lineWidth = 2;
		for (let i = 0; i < this.particles.length; i++) {
			const particle = this.particles[i];
			ctx.strokeStyle = particle.color;
			ctx.strokeRect(particle.x, particle.y, particle.radius, particle.radius);
		}
	}

}

export default ParticleFactory;
