import { InfiniteFeed } from "y/components/InfiniteFeed";
import { NewTweetForm } from "y/components/NewTweetForm";
import { api } from "y/utils/api";

export default function Home() {

  return (
    <>
     <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Accueil</h1>
     </header>
     <NewTweetForm />
     <RecentTweets />
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
      hasMore={tweets.hasNextPage}
      fetchNewTweets={tweets.fetchNextPage}
    />
  ) 
}

