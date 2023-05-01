import Head from "next/head";
import { useState } from "react";
import { Tweet } from "react-tweet";
import type { GetServerSidePropsContext, NextPage } from "next";

import { authOptions } from "~/pages/api/auth/[...nextauth]";
import { useAskTed } from "~/util/useAskTed";
import { Subtitles } from "~/components/Subtitles";
import { ReactPrompt } from "~/components/ReactPrompt";
import type { ReactListItemData } from "~/components/ReactList";
import { getServerSession } from "next-auth/next";
import { PromptTypeIcon } from "~/components/PromptTypeIcon";

const ReactContent: NextPage = () => {
  const [activeReactItem, setActiveReactItem] = useState<ReactListItemData>();
  const { askTed, tedResponse } = useAskTed();

  const onReactConfirm = (data: ReactListItemData) => {
    setActiveReactItem(data);
  };

  return (
    <>
      <Head>
        <title>Ai Streamer - React Content</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-green-800 px-4">
        <div
          data-theme="dark"
          className={`flex min-h-[720px] max-w-[500px] items-center overflow-hidden ${
            activeReactItem?.type !== "twitter" ? "p-5" : ""
          }`}
        >
          {activeReactItem ? (
            activeReactItem?.type === "twitter" ? (
              <Tweet id={activeReactItem.id} key={activeReactItem.id} />
            ) : (
              <div className="relative bg-[#1A1A1B] p-5 shadow-md">
                <PromptTypeIcon promptType={activeReactItem?.type || "text"} />

                {activeReactItem?.authorName && (
                  <span className="text-sm text-slate-500">
                    Posted by {activeReactItem?.authorName}
                  </span>
                )}
                <p className="-2xl text-white">
                  {activeReactItem?.text.trim()}
                </p>
              </div>
            )
          ) : null}
        </div>

        <div className="flex w-[1000px] flex-col items-center border-t border-t-gray-500 py-10">
          <Subtitles message={tedResponse} />

          <div className="w-[500px]">
            <ReactPrompt askTed={askTed} onApproveTweetClick={onReactConfirm} />
          </div>
        </div>
      </main>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}

export default ReactContent;
