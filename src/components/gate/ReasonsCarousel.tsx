import Image from "next/image";
import { appear_time_each_reason_card, reasons, ReasonType } from "@/utils/carousel_reasons_data";

export default function ReasonsCarousel() {
        return (
                <>
                        <ul>
                                {/* Carousel List */}
                                {reasons.map((reason, index) => (
                                        <li className="absolute top-0 left-0 w-full h-full" key={index}>
                                                <ReasonCard reason={reason} index={index} />
                                        </li>
                                ))}
                        </ul>
                </>
        );
}

function ReasonCard(props: { reason: ReasonType; index: number }) {
        return (
                <div className="w-full h-full p-10 box-border relative flex flex-col items-center text-center *:max-w-124 *:text-black overflow-hidden pointer-events-none">
                        <h1
                                className="text-3xl font-semibold relative"
                                style={{
                                        animationName: "CarouselTextAnimation",
                                        animationIterationCount: "infinite",
                                        animationDuration: `${appear_time_each_reason_card * 5}s`,
                                        animationDelay: `-${props.index * appear_time_each_reason_card}s`,
                                }}
                        >
                                {props.reason.title}
                        </h1>
                        {props.reason.quote && (
                                <>
                                        <span className="my-4"></span>
                                        <p
                                                className="text-lg italic relative"
                                                style={{
                                                        animationName: "CarouselTextAnimation",
                                                        animationIterationCount: "infinite",
                                                        animationDuration: `${appear_time_each_reason_card * 5}s`,
                                                        animationDelay: `-${props.index * appear_time_each_reason_card + 0.25}s`,
                                                }}
                                        >
                                                {props.reason.quote}
                                        </p>
                                </>
                        )}
                        <span className="my-4"></span>
                        {props.reason.descriptions.map((desc, index) => (
                                <p
                                        className="text-sm relative"
                                        key={index}
                                        style={{
                                                animationName: "CarouselTextAnimation",
                                                animationIterationCount: "infinite",
                                                animationDuration: `${appear_time_each_reason_card * 5}s`,
                                                animationDelay: `-${props.index * appear_time_each_reason_card + 0.5}s`,
                                        }}
                                >
                                        {desc}
                                </p>
                        ))}
                        <Image
                                src={props.reason.image}
                                className="absolute bottom-2 left-1/2 -translate-x-1/2"
                                width={450}
                                alt="Mobile Payment Image"
                                style={{
                                        animationName: "CarouselImageAnimation",
                                        animationIterationCount: "infinite",
                                        animationDuration: `${appear_time_each_reason_card * 5}s`,
                                        animationDelay: `-${props.index * appear_time_each_reason_card}s`,
                                }}
                        />
                </div>
        );
}
