interface SoundSources<T = string> {
	FALL: T;
}

class AudioManager {

	private readonly SOURCES: SoundSources & Dictionary<string> = {
		FALL: 'sounds/fall.wav',
	};

	private sounds: Dictionary<HTMLAudioElement> = {};

	public init(): void {
		for (let key in this.SOURCES) {
			this.sounds[key] = new Audio(this.SOURCES[key]);
		}
	}

	public play(sound: keyof SoundSources): void {
		if (this.sounds[sound]) {
			this.sounds[sound].play();
		}
	}

}

export default AudioManager;
