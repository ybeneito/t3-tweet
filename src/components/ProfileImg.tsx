import Image from "next/image"
import { VscAccount } from "react-icons/vsc"

type ProfileImgProps = {
    src?: string | null
    className?: string
}

export function ProfileImg({src, className=""}: ProfileImgProps) {
    return (
        <div className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}>
            {src == null ? <VscAccount  className="w-full h-full"/> : <Image src={src} alt="Profile picture" quality={100} fill/>}
        </div>
    )
}