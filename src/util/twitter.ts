import type { TweetV2, UserV2 } from "twitter-api-v2";
import { create } from "zustand";

export const TWEET_URL_PATTERN = /https:\/\/twitter.com\/\w+\/status\/\w+/;

export type ExtendedTweet = TweetV2 & { author_username: string };
type TwitterStore = {
  tweets: ExtendedTweet[];
  isFetchingTweets: boolean;
  deleteAll: () => void;
  deleteTweet: (id: string) => void;
  getLatestTweets: () => Promise<void>;
  getTweets: (id: string[]) => Promise<void>;
};

export const useTwitterStore = create<TwitterStore>((set) => ({
  isFetchingTweets: false,
  tweets: [],

  getTweets: async (ids: string[]) => {
    set({ isFetchingTweets: true });
    try {
      const tweets = (await fetch("/api/fetchTweets", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }).then((resp) => resp.json())) as ExtendedTweet[];

      set({ tweets, isFetchingTweets: false });
    } catch (err) {
      console.error(err);
      set({ isFetchingTweets: false });
    }
  },

  getLatestTweets: async () => {
    set({ isFetchingTweets: true });
    try {
      const data = (await fetch("/api/getLatestTweets").then((resp) =>
        resp.json()
      )) as ExtendedTweet[];

      set({ tweets: data, isFetchingTweets: false });
    } catch (err) {
      console.error(err);
      set({ isFetchingTweets: false });
    }
  },

  deleteAll: () => {
    set({ tweets: [] });
  },

  deleteTweet: (tweetId) => {
    set((state) => {
      return {
        ...state,
        tweets: state.tweets.filter(({ id }) => id !== tweetId),
      };
    });
  },
}));

export function extractTwitterId(url: string) {
  const [, , tweetId] = url.split("https://twitter.com/").join("").split("/");

  if (!tweetId) {
    throw new Error("Tweet id could not be extracted.");
  }

  return tweetId;
}

export function transformTweets(tweets: TweetV2[], users: UserV2[]) {
  return tweets.map((tw) => ({
    ...tw,
    author_username:
      users.find(({ id }) => id === tw.author_id)?.username || "Unknown User",
  }));
}
