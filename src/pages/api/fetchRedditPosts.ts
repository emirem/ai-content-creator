import type { NextApiRequest, NextApiResponse } from "next";

export type RedditListingPost = {
  id: string;
  author_fullname: string;
  title: string;
  ups: number;
  thumbnail: string;
};

type RedditListingChild = {
  kind: string;
  data: RedditListingPost;
};

type RedditJSONResponse = {
  kind: "Listing";
  data: {
    children: RedditListingChild[];
  };
};

export type FetchRedditPostsArgs = {
  subReddit: string;
  sort: "hot" | "new" | "top";
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bodyParased = JSON.parse(req.body as string) as FetchRedditPostsArgs;
  const { subReddit, sort } = bodyParased;

  if (!subReddit) {
    res.status(500);
    return res.send(JSON.stringify({ error: "Fail. Subreddit missing." }));
  }

  try {
    let redditPosts: RedditListingPost[] = [];
    // Fetch some reddit posts

    const response = (await fetch(
      `https://www.reddit.com/r/${subReddit}/${sort}.json?t=week&limit=20`
    ).then((resp) => resp.json())) as RedditJSONResponse;

    redditPosts = response.data.children.map(
      ({ data: { author_fullname, id, title, thumbnail, ups } }) => ({
        id,
        title,
        author_fullname,
        thumbnail,
        ups,
      })
    );

    res.status(200).send(JSON.stringify(redditPosts));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(JSON.stringify({ error: "Reddit post fetch failed." }));
  }
}
