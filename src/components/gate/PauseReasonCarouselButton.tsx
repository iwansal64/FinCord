"use client";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

export default function PauseReasonCarouselButton() {
        const [playState, setPlayState] = useState(true);

        useEffect(() => {
                if (playState) {
                        Array.from(document.getElementsByClassName("carousel")).forEach((element) => ((element as HTMLElement).style.animationPlayState = "running"));
                } else {
                        Array.from(document.getElementsByClassName("carousel")).forEach((element) => ((element as HTMLElement).style.animationPlayState = "paused"));
                }
        }, [playState]);

        return (
                <button
                        className="absolute top-2 left-2 w-max aspect-square p-2 z-100 border border-black rounded-full"
                        aria-label="pause carousel"
                        title={playState ? "Pause" : "Resume"}
                        onClick={() => setPlayState(!playState)}
                >
                        {playState ? <Pause width={30} color="black" /> : <Play width={30} color="black" />}
                </button>
        );
}
