import { useSession } from "next-auth/react";
import { useState } from "react";
import { InfiniteFeed } from "y/components/InfiniteFeed";
import { NewTweetForm } from "y/components/NewTweetForm";
import { api } from "y/utils/api";

const TABS = ["Récents", "Suivis"] as const

export default function Home() {
  const session = useSession()
  const [selectedTab, setSelectedTab] = useState<typeof TABS[number]>("Récents")

  return (
    <>
     <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Accueil</h1>
        {session.status === "authenticated" && (
          <div className="flex">
              {TABS.map(tab => {
                return <button key={tab} className={`flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200 ${tab === selectedTab ? 
                  "border-b-4 border-b-blue-500 font-bold" : "" }`}
                  onClick={() => setSelectedTab(tab)}
                  >{tab}</button>
              })}
          </div>
        )}
     </header>
     <NewTweetForm />
     {selectedTab === "Récents" ? <RecentTweets /> :  <FollowingTweets />}
    </>
  );
}

const RecentTweets = () => {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery({}, {getNextPageParam: (lastPage) => lastPage.nextCursor })

  return (
    <InfiniteFeed 
      tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={tweets.hasNextPage }
      fetchNewTweets={tweets.fetchNextPage}
    />
  ) 
}

const FollowingTweets = () => {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    {onlyFollowing: true}, 
    {getNextPageParam: (lastPage) => lastPage.nextCursor })

  return (
    <InfiniteFeed 
      tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={tweets.hasNextPage }
      fetchNewTweets={tweets.fetchNextPage}
    />
  ) 
}

