/** Class to manage players score and local high score */
class ScoreManager {

	/** Default score multiplier */
	private readonly SCORE_BASE: number = 40;

	/** Current score */
	public score: number = 0;
	/** Local high score */
	public highScore: number = Number(localStorage.getItem('highScore') || 0);

	/**
	 * Returns score multiplier based on combo
	 * @param combo Number of filled row
	 */
	private getMultiplier(combo: number): number {
		return [1, 2.5, 7.5, 30][combo] || 1;
	}

	/** Updates local high score */
	public updateHighScore(): void {
		if (this.score > this.highScore) {
			this.highScore = this.score;
			localStorage.setItem('highScore', String(this.score));
		}
	}

	/**
	 * Add score based on game leven and combo
	 * @param level Current level
	 * @param combo Combo for breaking multiple lines at once
	 */
	public add(level: number, combo: number): void {
		this.score += this.SCORE_BASE * this.getMultiplier(combo) * level;
	}

	/** Set score to 0 */
	public init(): void {
		this.score = 0;
	}

}

export default ScoreManager;
