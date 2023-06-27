/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { GetStaticPropsContext, GetStaticPaths, NextPage, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { ssgHelper } from "y/server/api/ssgHelper";
import { api } from "y/utils/api";
import ErrorPage from "next/error"
import Link from "next/link";
import { IconHoverEffect } from "y/components/IconHoverEffect";
import { VscArrowLeft } from "react-icons/vsc";
import { ProfileImg } from "y/components/ProfileImg";
import { InfiniteFeed } from "y/components/InfiniteFeed";
import { useSession } from "next-auth/react";
import { Button } from "y/components/Button";

export async function getStaticProps(context: GetStaticPropsContext<{ id: string }>) {
    const id = context.params?.id
    if (id == null) {
        return {
            redirect: {
                destination: "/"
            }
        }
    }
    const ssg = ssgHelper()
    await ssg.profile.getById.prefetch({ id })
    return {
        props: {
            trpcState: ssg.dehydrate(),
            id,
        }
    }
}

export const getStaticPaths: GetStaticPaths = () => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

const pluralRules = new Intl.PluralRules()
export function getPlural(number: number, singular: string, plural: string) {
    return pluralRules.select(number) === "one" ? singular : plural
}

const FollowButton = ({userId, isFollowing, onClick, isLoading} : {
    userId: string, isFollowing: boolean, onClick: () => void, isLoading: boolean
}) => {
    const session = useSession()
    if (session.status !== "authenticated" || session.data.user.id === userId) return null
    return <Button disabled={isLoading} onClick={onClick} small gray={isFollowing}>
        {isFollowing ? "Ne plus suivre" : "Suivre"}

    </Button>
}

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ id }) => {
    const { data: profile } = api.profile.getById.useQuery({ id })

    const tweets = api.tweet.infiniteProfileFeed.useInfiniteQuery({ userId: id }, { getNextPageParam: (lastPage) => lastPage.nextCursor })
    const trpcUtils = api.useContext()
    const toggleFollow = api.profile.toggleFollow.useMutation({
        onSuccess: ({addedFollow}) => {
            trpcUtils.profile.getById.setData({id} , oldData => {
                if(oldData == null) return
                const countModifier = addedFollow ? 1 : -1
                return {...oldData, isFollowing: addedFollow, followersCount: oldData.followersCount + countModifier}
            }) 
        }
    })
    
    if (profile == null || profile.name == null) {
        return <ErrorPage statusCode={404} />
    }
    return <>
        <Head>
            <title>{`Tweet - ${profile.name} `}</title>
        </Head>
        <header className="sticky top-0 z-10 flex items-center border-b bg-white px-2 py-4">
            <Link href={".."} className="mr-2">
                <IconHoverEffect>
                    <VscArrowLeft className="h-6 w-6" />
                </IconHoverEffect>
            </Link>
            <ProfileImg src={profile.image} className="flex-shrink-0" />
            <div className="ml-2 flex-grow">
                <h1 className="text-lg font-bold">{profile.name}</h1>
                <div className="text-gray-500">
                    {profile.tweetsCount}{" "}
                    {getPlural(profile.tweetsCount, "Tweet", "Tweets")} -{" "}
                    {profile.followersCount}{" "}
                    {getPlural(profile.followersCount, "Suivi", "Suivis")} -{" "}
                    {profile.followsCount}{" "}
                    {getPlural(profile.followersCount, "Suiveur", "Suivers")} -{" "}
                </div>
            </div>
            <FollowButton isFollowing={profile.isFollowing} userId={id} onClick={() => toggleFollow.mutate({userId : id})} isLoading={toggleFollow.isLoading}/>
        </header>
        <main>
            <InfiniteFeed
                tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
                isError={tweets.isError}
                isLoading={tweets.isLoading}
                hasMore={tweets.hasNextPage}
                fetchNewTweets={tweets.fetchNextPage}
            />
        </main>
    </>
}

export default ProfilePage