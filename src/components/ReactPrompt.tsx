import { type ChangeEvent, useState, useMemo } from "react";

import { type ReactListItemData, ReactList } from "./ReactList";
import {
  mergeData,
  type AllowedPromptTypes,
  constructRedditReactPrompt,
  constructTweetReactPrompt,
  constructYoutubeReactPrompt,
  constructTextReactPrompt,
} from "~/util/reactPrompt";
import { Spinner } from "./icons";
import {
  extractTwitterId,
  TWEET_URL_PATTERN,
  useTwitterStore,
} from "~/util/twitter";
import { shallow } from "zustand/shallow";
import { useRedditStore } from "~/util/reddit";
import { type PromptQueueItem, useTedStore } from "~/util/ted";

type Props = {
  className?: string;
  onApproveTweetClick?: (data: ReactListItemData) => void;
  askTed: (promptQueueItem: PromptQueueItem) => Promise<void>;
};

export function ReactPrompt({
  askTed,
  className = "",
  onApproveTweetClick,
}: Props) {
  const {
    tweets,
    isFetchingTweets,
    getTweets,
    getLatestTweets,
    deleteTweet,
    deleteAll: deleteAllTweets,
  } = useTwitterStore((state) => state, shallow);
  const {
    redditPosts,
    isFetchingRedditPosts,
    deleteAll: deleteAllRedditPosts,
    deleteRedditPost,
    getRedditPosts,
  } = useRedditStore((state) => state, shallow);
  const { isTedProcessing } = useTedStore((state) => ({
    isTedProcessing: state.isTedProcessing,
  }));
  const [promptText, setPromptText] = useState("");
  const [promptType, setPromptType] = useState<AllowedPromptTypes>("text");
  const isBtnDisabled = !promptText.length || isTedProcessing;
  const isFetchTweetsBtnDisabled = isTedProcessing || isFetchingTweets;
  const isFetchRedditPostsBtnDisabled =
    isTedProcessing || isFetchingRedditPosts;
  const processBtnLabel = useMemo(() => {
    if (promptType === "twitter") {
      return "Fetch Tweet";
    }

    if (promptType === "youtube_comment") {
      return "Process Comment";
    }

    return "Process Text";
  }, [promptType]);

  const onSubmit = async () => {
    if (promptType === "twitter") {
      try {
        const tweetId = extractTwitterId(promptText);

        getTweets([tweetId]).catch((err) =>
          console.error("getTweets failed.", err)
        );
      } catch (err) {}
    } else {
      const message =
        promptType === "youtube_comment"
          ? constructYoutubeReactPrompt(promptText)
          : constructTextReactPrompt(promptText);

      // Handle react-page callback
      if (onApproveTweetClick) {
        onApproveTweetClick({
          id: "",
          text: promptText,
          authorName: "",
          type: promptType,
        });
      }

      await askTed({
        message,
        questionType: "default",
        readTheQuestion: false,
        status: "new",
      });
    }

    setPromptType("text");
    setPromptText("");
  };

  const onPromptItemMessageChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPromptText(event.target.value);

    if (event.target.value.match(TWEET_URL_PATTERN)) {
      setPromptType("twitter");
    } else {
      setPromptType("text");
    }
  };

  const _onApproveTweetClick = async (data: ReactListItemData) => {
    if (onApproveTweetClick) {
      onApproveTweetClick(data);
    }

    const message =
      data.type === "twitter"
        ? constructTweetReactPrompt(data.text, data.authorName)
        : constructRedditReactPrompt(data.text, "gaming", data.authorName);

    await askTed({
      message,
      questionType: "default",
      readTheQuestion: false,
      status: "new",
    });

    if (data.type === "twitter") {
      deleteTweet(data.id);
    } else {
      deleteRedditPost(data.id);
    }
  };

  const _onDeleteListItemClick = (id: string, type: AllowedPromptTypes) => {
    if (type === "reddit") return deleteRedditPost(id);

    return deleteTweet(id);
  };

  const onPullLatestTweetsClick = () => {
    getLatestTweets().catch((err) =>
      console.error("getLatestTweets faild.", err)
    );
  };

  const onGetRedditPostsClick = () => {
    getRedditPosts().catch((err) =>
      console.error("getLatestTweets faild.", err)
    );
  };

  const clearAll = () => {
    deleteAllTweets();
    deleteAllRedditPosts();
  };

  return (
    <div className={`mt-2 flex w-full flex-col ${className}`}>
      <label className="text-base text-white">React to...</label>

      <textarea
        rows={5}
        value={promptText}
        onChange={onPromptItemMessageChange}
        placeholder="Text for AI to react to..."
        className="custom-scrollbar mt-2 w-full resize-none border-b border-slate-800 bg-[#15162c] p-2 text-white outline-none"
      ></textarea>

      <div className="mt-2 flex flex-row flex-wrap items-start justify-between">
        <div className="flex flex-col">
          <button
            onClick={onPullLatestTweetsClick}
            disabled={isFetchTweetsBtnDisabled}
            className={`flex flex-row items-center rounded bg-indigo-800 p-2 uppercase text-white hover:bg-indigo-400 ${
              isFetchTweetsBtnDisabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            Pull latest Tweets
            {isFetchingTweets && <Spinner className="ml-2" />}
          </button>
          <button
            disabled={isFetchRedditPostsBtnDisabled}
            onClick={onGetRedditPostsClick}
            className={`mt-2 flex flex-row items-center rounded bg-indigo-800 p-2 uppercase text-white hover:bg-indigo-400 ${
              isFetchRedditPostsBtnDisabled
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            Pull Reddit posts
            {isFetchingRedditPosts && <Spinner className="ml-2" />}
          </button>
          <button
            onClick={clearAll}
            disabled={isFetchRedditPostsBtnDisabled || isFetchTweetsBtnDisabled}
            className={`mt-2 flex flex-row items-center justify-center rounded bg-red-900 p-2 uppercase text-white hover:bg-red-700 ${
              isFetchRedditPostsBtnDisabled || isFetchTweetsBtnDisabled
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            Clear all
            {isFetchingRedditPosts && <Spinner className="ml-2" />}
          </button>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex flex-row items-center">
            <label
              htmlFor="yt-comment"
              className="mr-2 cursor-pointer select-none text-white"
            >
              YT Comment
            </label>
            <input
              type="checkbox"
              id="yt-comment"
              className="cursor-pointer"
              checked={promptType === "youtube_comment"}
              onChange={(event) => {
                setPromptType(
                  event.target.checked ? "youtube_comment" : "text"
                );
              }}
            />
          </div>

          <button
            disabled={isBtnDisabled}
            onClick={() => {
              onSubmit().catch((err) => console.error("onSubmit failed.", err));
            }}
            className={`mt-2 flex justify-center p-2 text-white ${
              isBtnDisabled ? "cursor-not-allowed bg-green-900" : "bg-green-600"
            }`}
          >
            {processBtnLabel}
          </button>
        </div>
      </div>

      <ReactList
        isTedProcessing={isTedProcessing}
        data={mergeData(tweets, redditPosts)}
        onApproveListItemClick={_onApproveTweetClick}
        onDeleteListItemClick={_onDeleteListItemClick}
      />
    </div>
  );
}
