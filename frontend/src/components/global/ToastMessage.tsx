'use client';

import { useToastMessageHook } from "@/hooks/global/useToastMessage";

export default function ToastMessage() {
        const { isShow, toastMessage: message } = useToastMessageHook();

        return <div className={`fixed top-5 ${isShow ? "left-5" : "-left-full"} duration-500 min-w-62.5 w-[25vw] aspect-7/3 p-4 z-10 bg-gray-500 border border-white rounded-2xl text-white`}>
                <p>{message}</p>
        </div>;
}