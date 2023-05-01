import NextAuth, { type DefaultUser, type NextAuthOptions } from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";

import { env } from "~/env.mjs";

declare module "next-auth" {
  interface Session {
    user?: DefaultUser & {
      id: string;
    };
  }
}

declare module "next-auth/jwt/types" {
  interface JWT {
    uid: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    TwitchProvider({
      clientId: env.TWITCH_CLIENT_ID,
      clientSecret: env.TWITCH_CLIENT_SECRET,
    }),
  ],
  adapter: SupabaseAdapter({
    url: env.SUPABASE_URL,
    secret: env.SUPABASE_SERVICE_ROLE_KEY,
  }),
  callbacks: {
    signIn: (params) => {
      return params.user.name === "Recurrsed";
    },
    jwt: ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.uid;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
