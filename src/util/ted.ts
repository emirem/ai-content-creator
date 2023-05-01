import { create } from "zustand";
import type { QuestionType } from "~/pages/api/askTed";

export type PromptQueueItem = {
  message: string;
  authorName?: string;
  readTheQuestion: boolean;
  questionType: QuestionType;
  status: "new" | "processed" | "processing" | "editing";
};

type TedStore = {
  isTedProcessing: boolean;
  questionType: QuestionType;
  promptQueue: PromptQueueItem[];
  cleanupPromptQueueState: () => void;
  deleteFromPromptQueue: (idx: number) => void;
  setIsTedProcessing: (status: boolean) => void;
  setQuestionType: (type: QuestionType) => void;
  updatePromptQueueItem: (item: PromptQueueItem, idx: number) => void;
  addToPromptQueue: (item: Omit<PromptQueueItem, "questionType">) => void;
};

export const useTedStore = create<TedStore>((set) => ({
  isTedProcessing: false,
  questionType: "default",
  promptQueue: [],

  setIsTedProcessing: (status) => {
    set({ isTedProcessing: status });
  },

  setQuestionType: (questionType) => {
    set({ questionType });
  },

  addToPromptQueue: (item) => {
    set((state) => ({
      ...state,
      promptQueue: [
        ...state.promptQueue,
        { ...item, questionType: state.questionType },
      ],
      questionType: "default",
    }));
  },

  updatePromptQueueItem: (item, idx) => {
    if (!item) return;

    set((state) => {
      const promptQueue = [...state.promptQueue];
      promptQueue[idx] = item;

      return {
        ...state,
        promptQueue,
      };
    });
  },

  deleteFromPromptQueue: (pIdx) => {
    set((state) => ({
      ...state,
      promptQueue: state.promptQueue.filter((_, idx) => idx !== pIdx),
    }));
  },

  cleanupPromptQueueState: () => {
    set((state) => {
      const newState = state.promptQueue.filter(
        ({ status }) => status !== "processed"
      );

      console.log("Checking prompt queue state", newState);

      return {
        ...state,
        promptQueue: newState,
      };
    });
  },
}));
