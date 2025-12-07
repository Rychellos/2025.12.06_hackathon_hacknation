export class SoundManager {
  private static instance: SoundManager;
  private currentMusic: HTMLAudioElement | null = null;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.5;
  private isMuted: boolean = false;

  private constructor() {}

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Play background music.
   * Stops currently playing music if any.
   * @param url URL of the music file
   * @param loop Whether to loop the music (default: true)
   */
  public playMusic(url: string, loop: boolean = true): void {
    if (this.currentMusic && this.currentMusic.src.includes(url)) {
      // Already playing this track
      if (this.currentMusic.paused) {
        this.currentMusic
          .play()
          .catch((e) => console.warn("Music play failed:", e));
      }
      return;
    }

    this.stopMusic();

    this.currentMusic = new Audio(url);
    this.currentMusic.loop = loop;
    this.currentMusic.volume = this.isMuted ? 0 : this.musicVolume;
    this.currentMusic
      .play()
      .catch((e) => console.warn("Music play failed:", e));
  }

  /**
   * Stop currently playing music.
   */
  public stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  /**
   * Pause currently playing music.
   */
  public pauseMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  /**
   * Resume currently playing music.
   */
  public resumeMusic(): void {
    if (this.currentMusic && this.currentMusic.paused) {
      this.currentMusic
        .play()
        .catch((e) => console.warn("Music resume failed:", e));
    }
  }

  /**
   * Play a sound effect.
   * Creates a new Audio instance to allow overlapping sounds.
   * @param url URL of the sound file
   */
  public playSfx(url: string): void {
    const sfx = new Audio(url);
    sfx.volume = this.isMuted ? 0 : this.sfxVolume;
    sfx.play().catch((e) => console.warn("SFX play failed:", e));
  }

  /**
   * Set global volume (0.0 to 1.0).
   * Affects both music and SFX.
   */
  public setVolume(volume: number): void {
    this.setMusicVolume(volume);
    this.setSfxVolume(volume);
  }

  /**
   * Set music volume (0.0 to 1.0).
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic && !this.isMuted) {
      this.currentMusic.volume = this.musicVolume;
    }
  }

  /**
   * Set SFX volume (0.0 to 1.0).
   */
  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Mute or unmute all audio.
   */
  public setMute(mute: boolean): void {
    this.isMuted = mute;
    if (this.currentMusic) {
      this.currentMusic.volume = mute ? 0 : this.musicVolume;
    }
  }

  public getMute(): boolean {
    return this.isMuted;
  }
}
