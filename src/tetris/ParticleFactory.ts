import { randomFromTo } from 'tetris/utils';
import { SIZES } from './const';

interface Particle extends Vector {
	vx: number;
	vy: number;
	radius: number;
	color: string;
}

class ParticleFactory {

	public particles: Array<Particle> = [];

	public createParticle(x: number, y: number, color: string, sizeIncrement: number): void {
		this.particles.push({
			x,
			y,
			radius: randomFromTo(2 + sizeIncrement, 5 + sizeIncrement),
			vx: randomFromTo(-5, 5),
			vy: randomFromTo(-5, 5),
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
			if(particle.radius < 0 || particle.x < 0 || particle.y < 0 || particle.x > SIZES.GAME_WIDTH || particle.y > SIZES.GAME_HEIGHT) {
				this.particles.splice(i, 1);
				i--; // Don't forget to lower the index when removing record from array
			}
		}
	}

	public drawParticles(ctx: CanvasRenderingContext2D): void {
		ctx.lineWidth = 2;
		for(let i = 0; i < this.particles.length; i++){
			const particle = this.particles[i];
			ctx.strokeStyle = particle.color;
			ctx.strokeRect(particle.x, particle.y, particle.radius, particle.radius);
		}
	}

}

export default ParticleFactory;
