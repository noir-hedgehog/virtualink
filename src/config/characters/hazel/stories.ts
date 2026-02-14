/**
 * hazel 角色剧情配置
 * @see docs/STORY_AND_ACHIEVEMENTS.md
 */
import type { Story } from "@/types/story";

/** heartmem.srt 对应的一句一句 + 时间轴（与一条音频 heartmem.mp3 同步） */
const HEARTMEM_LINES = [
  "小满在直播间讲了很多和现实中不会说的话",
  "也许这就是互联网的魅力之处吧",
  "是的因为觉得",
  "你们是我一辈子不会有交集的人",
  "所以就大大方方讲了",
  "但其实你们也可以大大方方讲啊",
  "对吧",
  "就你们的这种平时不不能说的一些",
  "这种想想散发的",
  "不管是恶意还是善意也好",
  "都可以在直播间说",
  "毕竟都是",
  "对吧都是网线朋友吧",
  "可以这么说",
  "网线朋友嗯",
  "其实也不能这么说",
  "一辈子没有交集",
  "因为现在也算是交集吧",
  "毕竟在听我直播的",
  "也算是也算是有交集",
  "只是",
  "这个交集不是世俗意义上的交集",
  "只能说是那种脑电波式的交集",
  "其实也算是交集",
  "我认真的讲也算是",
];

const HEARTMEM_TIMINGS = [
  [0, 3200],
  [3200, 5100],
  [5100, 6333],
  [6333, 8466],
  [8666, 10033],
  [10266, 12066],
  [12066, 12866],
  [12933, 16266],
  [16266, 18300],
  [18300, 20200],
  [20200, 22200],
  [22700, 23833],
  [24233, 26533],
  [26533, 27200],
  [27200, 28800],
  [32000, 33266],
  [33266, 34200],
  [34200, 35533],
  [35533, 37266],
  [37733, 39333],
  [39333, 39533],
  [39533, 43800],
  [43800, 46700],
  [46700, 47733],
  [47733, 49233],
].map(([startMs, endMs]) => ({ startMs, endMs }));

export const hazelStories: Story[] = [
  {
    id: "story_first_meet",
    type: "video",
    title: "初次见面",
    url: "/characters/hazel/story/first-meeting.mp4",
    trigger: { type: "achievement", achievementId: "first_todo" },
  },
  {
    id: "story_heartmem",
    type: "galgame",
    title: "一辈子不会有交集的人",
    trigger: { type: "achievement", achievementId: "diary_first" },
    scenes: [
      {
        character: "hazel",
        position: "center",
        lines: HEARTMEM_LINES,
        audioUrl: "/characters/hazel/story/heartmem/heartmem.mp3",
        lineTimings: HEARTMEM_TIMINGS,
      },
    ],
  },
];
