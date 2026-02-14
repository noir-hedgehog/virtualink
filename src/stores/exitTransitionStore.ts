/**
 * 退出转场：点击「退出」后播放收束动画，结束后回到启动页
 */
import { create } from "zustand";

const EXIT_DURATION_MS = 700;

type ExitTransitionState = {
  isExiting: boolean;
  /** 开始退出转场（由右侧电话图标触发） */
  startExit: () => void;
  /** 转场结束（由 overlay 动画结束时调用） */
  finishExit: () => void;
};

export const useExitTransitionStore = create<ExitTransitionState>((set) => ({
  isExiting: false,
  startExit: () => set({ isExiting: true }),
  finishExit: () => set({ isExiting: false }),
}));

export { EXIT_DURATION_MS };
