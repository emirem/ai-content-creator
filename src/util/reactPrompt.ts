import type { ReactListItemData } from "~/components/ReactList";
import type { RedditListingPost } from "~/pages/api/fetchRedditPosts";
import type { ExtendedTweet } from "./twitter";

export type AllowedPromptTypes =
  | "text"
  | "twitter"
  | "reddit"
  | "youtube_comment";

const COMMON_PART =
  "Having in mind your personality, pretend you are a reporter from 1960s, living in a victorian steampunk environment. Report on this story with some spicy opinions and jokes no longer than 5 sentences. You will not mention where you come from, or who you are.";
export function constructTextReactPrompt(text: string) {
  return `
  ${COMMON_PART}
  Text:
  ${text}
  `;
}

export function constructTweetReactPrompt(text: string, username: string) {
  return `
  Consider the tweet you read on Twitter. ${COMMON_PART} The Tweet is written by ${username}"
  Tweet:
  ${text}
 `;
}

export function constructRedditReactPrompt(
  text: string,
  subReddit: string,
  username: string
) {
  return `
  Consider the Reddit post title bellow you read on ${subReddit} subreddit. ${COMMON_PART} The post is written by ${username}"
  Reddit post title:
  ${text}
 `;
}

export function constructYoutubeReactPrompt(text: string) {
  return `
  Consider the text bellow as a Youtube comment that you got on your video you published recently. Having in mind your edgy, unhingend and sarcastic personality, reply to this person's comment."
  Text:
  ${text}
  `;
}

export function mergeData(
  tweets: ExtendedTweet[],
  redditPosts: RedditListingPost[]
): ReactListItemData[] {
  const transformedTweets: ReactListItemData[] = tweets.map(
    ({ id, text, author_username }) => ({
      id,
      text,
      authorName: author_username,
      type: "twitter",
    })
  );
  const transformedRedditPosts: ReactListItemData[] = redditPosts.map(
    ({ id, title, author_fullname }) => ({
      id,
      text: title,
      authorName: author_fullname,
      type: "reddit",
    })
  );

  return transformedTweets.concat(transformedRedditPosts);
}
