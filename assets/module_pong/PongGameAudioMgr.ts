import { AudioClip, resources } from "cc";
import { tgxAudioMgr } from "../core_tgx/tgx";

export class PongGameAudioMgr {
    /**
     * @en
     * play short audio, such as hits, scores
     * @zh
     * 播放短音频,比如 击球音效，得分音效等
     * @param sound clip or url for the audio
     * @param volume 
     */
    public static playOneShot(sound: AudioClip | string, volume: number = 1.0) {
        tgxAudioMgr.inst.playOneShot(sound, volume);
    }

    /**
     * @en
     * play long audio, such as the bg music
     * @zh
     * 播放长音频，比如 背景音乐
     * @param sound clip or url for the sound
     * @param volume
     */
    public static play(sound: AudioClip | string, volume: number = 1.0,) {
        tgxAudioMgr.inst.play(sound, volume);
    }

    /**
     * stop the audio play
     */
    public static stop() {
        tgxAudioMgr.inst.stop();
    }

    /**
     * pause the audio play
     */
    public static pause() {
        tgxAudioMgr.inst.pause();
    }

    /**
     * resume the audio play
     */
    public static resume() {
        tgxAudioMgr.inst.resume();
    }
}
