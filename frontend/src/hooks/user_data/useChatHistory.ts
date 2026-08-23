import { create } from "zustand";

type ChatHistoryType = {
        message_content: string,
        time: Date,
        is_user: boolean
}

export type ChatHistoryHookType = {
        chatHistory: ChatHistoryType[],
        setChatHistory: (newChatHistory: ChatHistoryType[]) => void,
        addChatHistory: (newChatHistory: ChatHistoryType) => void
}

export const useChatHistoryHook = create<ChatHistoryHookType>((set) => ({
        chatHistory: [],
        setChatHistory: (newChatHistory: ChatHistoryType[]) => {
                set(() => ({
                        chatHistory: newChatHistory
                }));
        },
        addChatHistory: (newChatHistory: ChatHistoryType) => {
                set((state) => {
                        const currentChatHistory = state.chatHistory;

                        return {
                                chatHistory: currentChatHistory.concat(newChatHistory)
                        }
                });
        },
}))