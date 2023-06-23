import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "y/utils/api";
import "y/styles/globals.css";
import Head from "next/head";
import { SideNav } from "y/components/SideNav";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>TweeterClone</title>
        <meta name="description" content="Clone de tweeter réalisé avec la stack t3"/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto flex items-start sm:pr-4">
        <SideNav />
        <div className="min-h-screen flex-grow border-x">
        <Component {...pageProps} />
        </div>
        
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
