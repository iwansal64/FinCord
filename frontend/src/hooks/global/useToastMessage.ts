import { create } from "zustand";

export type ToastMessageHookType = {
        isShow: boolean,
        message: string,
        setMessage: (newMessage: string, timeout_in_ms: number) => void,
}

let toastDisapperTimeout: NodeJS.Timeout | null = null;

export const useToastMessageHook = create<ToastMessageHookType>((set) => ({
        isShow: false,
        message: "",
        setMessage: (newMessage: string, timeout_in_ms: number = 1000) => {
                set(() => ({
                        isShow: true,
                        message: newMessage
                }));

                // If theere's timeout happening in the background, close it
                if(toastDisapperTimeout) {
                        clearTimeout(toastDisapperTimeout);
                }
                
                // If timeout is specified,
                if(timeout_in_ms) {
                        // Make toast disappear after timeout_in_ms
                        toastDisapperTimeout = setTimeout(() => {
                                set(() => ({
                                        isShow: false,
                                }));
                                
                                // Make the message disappear after around animation duration
                                toastDisapperTimeout = setTimeout(() => {
                                        set(() => ({
                                                message: ""
                                        }));

                                        toastDisapperTimeout = null;
                                }, 500);
                        }, timeout_in_ms)
                }
        }
}))