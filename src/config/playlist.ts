export type Track = {
  id: string;
  title: string;
  artist: string;
  url: string;
};

/** 默认播放列表，可将 url 替换为实际音频地址 */
export const defaultPlaylist: Track[] = [
  { id: "1", title: "Daywind", artist: "N.L. One Music Studio", url: "/music/test.mp3" },
  { id: "2", title: "Rainy Window", artist: "Lo-Fi", url: "/music/test.mp3" },
  { id: "3", title: "chillow lofi", artist: "Chill Beats", url: "/music/test.mp3" },
];
