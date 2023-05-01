import { TwitterApi } from "twitter-api-v2";
import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "~/env.mjs";
import { transformTweets } from "~/util/twitter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bodyParased = JSON.parse(req.body as string) as {
    ids?: string[];
  };
  const { ids } = bodyParased;

  if (!ids?.length) {
    res.status(500);
    return res.send(JSON.stringify({ error: "Fail. Tweet ids missing." }));
  }

  const twitterClient = new TwitterApi(env.TWITTER_TOKEN);
  const readOnlyApp = twitterClient.readOnly;

  try {
    const result = await readOnlyApp.v2.tweets(ids, {
      expansions: ["author_id"],
      "user.fields": ["username", "id"],
    });

    if (result.errors) {
      throw result.errors;
    }

    const transformedTweets = transformTweets(
      result.data,
      result.includes?.users || []
    );

    res.status(200).send(JSON.stringify(transformedTweets));
  } catch (err) {
    console.error(err);
    res.status(500).send(JSON.stringify({ error: "Tweet fetch failed." }));
  }
}
