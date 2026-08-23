'use client';

import { useToastMessageHook } from "@/hooks/global/useToastMessage";
import { useChatHistoryHook } from "@/hooks/user_data/useChatHistory";
import { useSendMessageToAIAPI } from "@/utils/api_interface";
import { useEffect, useRef, useState } from "react";

export default function Chatbot() {
        const chatContainer = useRef<HTMLDivElement|null>(null);
        
        const [message, setMessage] = useState("");
        const [messageChunk, setMessageChunk] = useState("");

        const { setToastMessage } = useToastMessageHook();

        const { trigger, data, error, isMutating } = useSendMessageToAIAPI();
        const { chatHistory, addChatHistory } = useChatHistoryHook();

        function sendMessageToAI() {
                if(!message || isMutating || !chatContainer.current) {
                        return;
                }

                setMessageChunk("");
                addChatHistory({
                        is_user: true,
                        message_content: message,
                        time: new Date()
                });
                setTimeout(() => {
                                if(!chatContainer.current) return;
                        chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
                }, 100);
                trigger({
                        body: {
                                message: message
                        },
                        onChunk: (value: string) => {
                                setMessageChunk((currentState) => currentState + value);
                        },
                        onOver: (fullChunk: string) => {
                                if(!chatContainer.current) return;
                                
                                setMessageChunk("");
                                addChatHistory({
                                        message_content: fullChunk,
                                        is_user: false,
                                        time: new Date()
                                });
                                chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
                        }
                });
        }

        useEffect(() => {
                if(!data || !setToastMessage) return;
                
                if(data.client_error == null && data.error == null) {
                        return;
                }

                // Show error if there's client error
                if(data.client_error) {
                        setToastMessage(`There's client error: ${data.client_error.toString()}`, 5000);
                        return;
                }
                
                // Show error if there's server error
                if(data.error) {
                        setToastMessage(`There's server error: ${data.error.toString()}`, 5000);
                }
        }, [data, messageChunk, setToastMessage]);

        useEffect(() => {
                // Show error if there's a client error
                if(!error || !setToastMessage) {
                        return;
                }

                setToastMessage(`There's client error: ${error.toString()}`, 5000);
        }, [error, setToastMessage]);

        useEffect(() => {
                console.log(chatHistory);
        }, [chatHistory]);


        return <div className="flex flex-col" id="chatbot">
                {/* Title */}
                <div className="py-2 text-center w-full">
                        AI ChatBot
                </div>
                {/* Chat */}
                <div className="flex flex-col gap-4 p-2 overflow-auto w-full h-full" ref={chatContainer}>
                        {chatHistory.map((chat, index) => <MessageBubble key={index} message_content={chat.message_content} is_user={chat.is_user} time={chat.time} />)}
                        {(() => {
                                if(messageChunk != "") {
                                        return <MessageBubble message_content={messageChunk} is_user={false} time={new Date()} />;
                                }
                                return <></>;
                        })()}
                </div>
                {/* Message Input */}
                <form className="w-full p-2" onSubmit={(e) => { sendMessageToAI(); e.preventDefault(); e.target.reset() }}>
                        <input type="text" className="p-2 rounded-2xl w-full h-full bg-gray-800 border border-white" placeholder="Type messages.." onChange={(e) => {
                                if(e.target.value == "reset") {
                                        setMessageChunk("");
                                }
                                else if(e.target.value == "check") {
                                        console.log(chatHistory);
                                }
                                setMessage(e.target.value);
                        }} disabled={isMutating} />
                </form>
        </div>;
}

function MessageBubble({ message_content, time, is_user }: { message_content: string, time: Date, is_user: boolean }) {
        return <div className={`pt-4 pb-3 px-4 flex flex-col gap-2 relative rounded-2xl w-4/5 ${is_user && "place-self-end bg-gray-800"}`}>
                <p className="whitespace-pre-wrap">{message_content}</p>
                <p className="text-xs">{time.toLocaleDateString()}</p>
        </div>;
}
