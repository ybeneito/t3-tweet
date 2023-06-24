import { useSession } from "next-auth/react";
import { Button } from "./Button";
import { ProfileImg } from "./ProfileImg";
import {  type FormEvent, useCallback, useLayoutEffect, useRef, useState } from "react";
import { api } from "y/utils/api";

const updateTxtAreaSize = (textArea?: HTMLTextAreaElement) => {
    if(textArea == null) return
    textArea.style.height = "0"
    textArea.style.height = `${textArea.scrollHeight}px`
}

const Form = () => {
    const session = useSession()
    const [inputValue, setInputValue] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>()

    const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
        updateTxtAreaSize(textArea)
        textAreaRef.current = textArea
    }, [])

    const trpcUtils = api.useContext()

    useLayoutEffect(() => {
        updateTxtAreaSize(textAreaRef.current)
    }, [inputValue])

    const createTweet = api.tweet.create.useMutation({
        onSuccess: (newTweet) => {
            setInputValue("")
            if (session.status !== "authenticated") return;

            trpcUtils.tweet.infiniteFeed.setInfiniteData({}, (oldData) => {
                if(oldData == null || oldData.pages[0] == null ) return

                const newCache = {
                    ...newTweet,
                    likeCount: 0,
                    likedByMe: false,
                    user: {
                        id: session.data.user.id,
                        name: session.data.user.name || null,
                        image: session.data.user.image || null
                    }
                }

                return {
                    ...oldData,
                    pages: [
                        {
                            ...oldData.pages[0],
                            tweets: [newCache, ...oldData.pages[0].tweets]
                        },
                        ...oldData.pages.slice(1)
                    ]
                }
            })
        }
        })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        createTweet.mutate({content: inputValue})
    }


    if(session.status !== "authenticated") return 

    return (
        <form className="flex flex-col gap-2 border-b px-4 py-2"
              onSubmit={handleSubmit}
        >
            <div className="flex gap-4">
                <ProfileImg src={session.data.user.image} />
                <textarea
                    ref={inputRef}
                    style={{height:0}}
                    value={inputValue}
                    onChange={e=> setInputValue(e.target.value)}
                    className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none" 
                    placeholder="Quoi de neuf?" />
            </div>
            <Button className="self-end">Tweet</Button>
        </form>
    )
}

export function NewTweetForm() {
    const session = useSession()
    if(session.status !== "authenticated") return 
    return <Form />
 
}