import { randomFromTo } from 'tetris/utils';

class ParticleFactory {

	public particles: Array<Particle> = [];

	public createParticles(x: number, y: number, color: string, amount: number): void {
		for (let i = 0; i < amount; i++) {
			this.particles.push({ x, y, radius: randomFromTo(2, 5), vx: randomFromTo(-5, 5), vy: randomFromTo(-5, 5), color });
		}
	}

	public processParticles(): void {
		for(let i = 0; i < this.particles.length; i++){
			const particle = this.particles[i];
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.radius -= .02;
			if(particle.radius < 0) {
				this.particles.splice(i, 1);
				i--; // Don't forget to lower the index when removing record from array
			}
		}
	}

	public drawParticles(ctx: CanvasRenderingContext2D): void {
		for(let i = 0; i < this.particles.length; i++){
			const particle = this.particles[i];
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI*2, false);
			ctx.fillStyle = particle.color;
			ctx.fill();
		}
	}

}

export default ParticleFactory;
