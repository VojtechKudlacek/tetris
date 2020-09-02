/** Definition of possible sounds */
interface SoundSources<T = string> { // The generics are here only because I'm lazy to type `string` to every key :)
	FALL: T;
	CLEAR: T;
	GAME_OVER: T;
	CLICK: T;
	BOOM: T;
}

/** Class to manage all the game sounds */
class AudioManager {

	/** Key to store custom user settings in local storage */
	private readonly STORAGE_KEY: string = 'volume';
	/** List of sound sources */
	private readonly SOURCES: SoundSources = {
		FALL: 'fall.wav',
		CLEAR: 'clear.wav',
		GAME_OVER: 'gameover.wav',
		CLICK: 'click.wav',
		BOOM: 'boom.wav',
	};

	/** Dictionary of playable sounds */
	private sounds: Dictionary<HTMLAudioElement> = {};

	/** Volume of the sounds */
	public volume: number = 1;

	/** Initialize sounds so it is possible to play them */
	public init(): void {
		for (const key in this.SOURCES) {
			// They keyof is bit of a hack, because typescript is stewpid
			this.sounds[key] = new Audio(`sounds/${this.SOURCES[key as keyof SoundSources]}`);
		}
		// Set saved volume
		const customVolume = localStorage.getItem(this.STORAGE_KEY);
		if (customVolume) {
			this.volume = Number(customVolume);
			this.changeVolume(this.volume);
		}
	}

	/**
	 * Plays the requested sound
	 * @param sound Name of the sound to be played
	 */
	public play(sound: keyof SoundSources): void {
		// Retard proof condition
		if (this.sounds[sound]) {
			this.sounds[sound].currentTime = 0;
			this.sounds[sound].play();
		}
	}

	/**
	 * Set volume for all defined sounds
	 * @param volume Value from `0` to `1`
	 */
	public changeVolume(volume: number): void {
		this.volume = volume;
		// Not sure if this is the best approach, but w/e
		for (const key in this.sounds) {
			// Another bulletproof condition
			if (this.sounds[key] instanceof Audio) {
				this.sounds[key].volume = volume;
			}
		}
		localStorage.setItem(this.STORAGE_KEY, String(volume));
	}

}

export default AudioManager;
