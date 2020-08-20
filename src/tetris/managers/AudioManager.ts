interface Sounds<T> {
	FALL?: T;
}

class AudioManager {

	private readonly SOURCES: Sounds<string> = {
		FALL: 'sounds/fall.wav',
	};

	private sounds: Sounds<HTMLAudioElement> = {};

	public init(): void {
		for (let key in this.SOURCES) {
			this.sounds[key] = new Audio(this.SOURCES[key]);
		}
	}

	public play(sound: keyof Sounds<HTMLAudioElement>): void {
		if (this.sounds[sound]) {
			this.sounds[sound].play();
		}
	}

}

export default AudioManager;
