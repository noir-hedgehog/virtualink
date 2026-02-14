/**
 * 环境音选项：白噪声、下雨、敲键盘等
 * 音频文件放在 public/sounds/ambient/
 */

export type AmbientSoundOption = {
  id: string;
  name: string;
  /** 无音效时为 undefined */
  url?: string;
};

export const AMBIENT_NONE = "none";

export const ambientSoundOptions: AmbientSoundOption[] = [
  { id: AMBIENT_NONE, name: "无" },
  { id: "white-noise", name: "白噪声", url: "/sounds/ambient/white-noise.mp3" },
  { id: "rain", name: "下雨", url: "/sounds/ambient/rain.mp3" },
  { id: "keyboard", name: "敲键盘", url: "/sounds/ambient/keyboard.mp3" },
];
