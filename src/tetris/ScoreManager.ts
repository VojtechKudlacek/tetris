class ScoreManager {

	private readonly SCORE_BASE: number = 40;

	private score: number = 0;
	private highScore: number = Number(localStorage.getItem('highScore') || 0);

	private getMultiplier(combo: number): number {
		return [1, 2.5, 7.5, 30][combo] || 1;
	}

	public updateHighScore(): void {
		if (this.score > this.highScore) {
			this.highScore = this.score;
			localStorage.setItem('highScore', String(this.score));
		}
	}

	public add(level: number, combo: number): void {
		this.score += this.SCORE_BASE * this.getMultiplier(combo) * level;
	}

	public restart(): void {
		this.score = 0;
	}

	public get Score(): number {
		return this.score;
	}

	public get HighScore(): number {
		return this.highScore;
	}

}

export default ScoreManager;
