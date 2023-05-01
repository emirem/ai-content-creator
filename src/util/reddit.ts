import { create } from "zustand";
import type {
  FetchRedditPostsArgs,
  RedditListingPost,
} from "~/pages/api/fetchRedditPosts";

type RedditStore = {
  isFetchingRedditPosts: boolean;
  redditPosts: RedditListingPost[];
  deleteAll: () => void;
  deleteRedditPost: (id: string) => void;
  getRedditPosts: (subReddit?: string) => Promise<void>;
};

export const useRedditStore = create<RedditStore>((set) => ({
  isFetchingRedditPosts: false,
  redditPosts: [],

  getRedditPosts: async (subReddit = "gamernews") => {
    set({ isFetchingRedditPosts: true });

    try {
      const data = (await fetch("/api/fetchRedditPosts", {
        method: "POST",
        body: JSON.stringify({
          subReddit,
          sort: "hot",
        } as FetchRedditPostsArgs),
      }).then((resp) => resp.json())) as RedditListingPost[];

      set({ redditPosts: data, isFetchingRedditPosts: false });
    } catch (err) {
      console.error(err);
      set({ isFetchingRedditPosts: false });
    }
  },

  deleteAll: () => {
    set({ redditPosts: [] });
  },

  deleteRedditPost: (postId) => {
    set((state) => ({
      ...state,
      redditPosts: state.redditPosts.filter(({ id }) => id !== postId),
    }));
  },
}));
