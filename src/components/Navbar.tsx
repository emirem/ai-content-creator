/* eslint-disable @typescript-eslint/no-misused-promises */
import type { Session } from "next-auth";
import { type SessionContextValue, signOut } from "next-auth/react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

type Props = {
  title: string;
  user: Session["user"];
  status: SessionContextValue["status"];
};

export function Navbar({ title, user, status }: Props) {
  const { pathname } = useRouter();

  return (
    <div className="relative flex w-full flex-row flex-wrap items-center justify-center">
      <h1 className="flex-1 text-center text-5xl font-extrabold tracking-tight text-white sm:text-5xl">
        {title}
      </h1>

      <div className="absolute top-1/2 right-0 -translate-y-1/2">
        {user ? (
          <div className="flex flex-row items-center">
            <Link
              href="/control-panel"
              className={`mr-2 bg-[#15162c] p-2 text-sm text-white ${
                pathname === "/control-panel" ? "bg-[#0e0f24]" : ""
              }`}
            >
              Control Panel
            </Link>
            <Link
              href="/react-content"
              className="mr-2 bg-[#15162c] p-2 text-sm text-white"
            >
              React Page
            </Link>
            <Link
              href="/settings"
              className={`mr-2 bg-[#15162c] p-2 text-sm text-white ${
                pathname === "/settings" ? "bg-[#0e0f24]" : ""
              }`}
            >
              Settings
            </Link>
            <Image
              width={40}
              height={40}
              alt="user-img"
              src={user.image || ""}
              className="mr-2 rounded-full"
            />

            <button
              className="p-2 text-white hover:bg-[#15162c]"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </div>
        ) : null}

        {status === "unauthenticated" && (
          <button
            className="p-2 text-white hover:bg-[#15162c]"
            onClick={() => signIn("twitch")}
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}
