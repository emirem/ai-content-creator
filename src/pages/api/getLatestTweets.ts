import { TwitterApi } from "twitter-api-v2";
import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "~/env.mjs";
import { transformTweets } from "~/util/twitter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const twitterClient = new TwitterApi({
    appKey: env.TWITTER_APP_KEY,
    appSecret: env.TWITTER_APP_KEY_SECRET,
    accessToken: env.TWITTER_ACCESS_TOKEN,
    accessSecret: env.TWITTER_ACCESS_TOKEN_SECRET,
  });
  const readOnlyApp = twitterClient.readWrite;

  try {
    const result = await readOnlyApp.v2.homeTimeline({
      max_results: 5,
      expansions: ["author_id"],
      "user.fields": ["username", "id"],
    });

    if (result.errors.length > 0) {
      throw result.errors;
    }

    if (result.data.errors) {
      throw result.data.errors;
    }

    const transformedTweets = transformTweets(
      result.data.data,
      result.includes?.users || []
    );

    res.status(200).send(JSON.stringify(transformedTweets));
  } catch (err) {
    console.error(err);
    res.status(500).send(JSON.stringify({ error: "Tweet fetch failed." }));
  }
}
