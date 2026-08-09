export default function Chatbot() {

        return <div className="flex flex-col" style={{
                gridArea: "cb"
        }}>
                {/* Title */}
                <div className="py-2 text-center w-full">
                        AI ChatBot
                </div>
                {/* Chat */}
                <div className="grid grid-flow-row gap-4 p-2 overflow-auto w-full">
                        <MessageBubble message_content="sdafs asmmsdfmsdakfm sd sdafsdokfmsadfsadf sdfdbmfkbcopkscvopjbvd bsdvbdbk" is_user={false} time={new Date()} />
                        <MessageBubble message_content="TEST" is_user time={new Date()} />
                        <MessageBubble message_content="sdafs asmmsdfmsdakfm sd sdafsdokfmsadfsadf sdfdbmfkbcopkscvopjbvd bsdvbdbk" is_user={false} time={new Date()} />
                        <MessageBubble message_content="TEST" is_user time={new Date()} />
                        <MessageBubble message_content="sdafs asmmsdfmsdakfm sd sdafsdokfmsadfsadf sdfdbmfkbcopkscvopjbvd bsdvbdbk" is_user={false} time={new Date()} />
                        <MessageBubble message_content="TEST" is_user time={new Date()} />
                        <MessageBubble message_content="sdafs asmmsdfmsdakfm sd sdafsdokfmsadfsadf sdfdbmfkbcopkscvopjbvd bsdvbdbk" is_user={false} time={new Date()} />
                        <MessageBubble message_content="TEST" is_user time={new Date()} />
                </div>
                {/* Message Input */}
                <div className="w-full p-2">
                        <input type="text" className="p-2 rounded-2xl w-full h-full bg-gray-800 border border-white" placeholder="Type messages.." />
                </div>
        </div>;
}

function MessageBubble({ message_content, time, is_user }: { message_content: string, time: Date, is_user: boolean }) {
        return <div className={`pt-4 pb-3 px-4 flex flex-col gap-2 relative rounded-2xl w-4/5 ${is_user && "place-self-end bg-gray-800"}`}>
                <p className="whitespace-pre-wrap">{message_content}</p>
                <p className="text-xs">{time.toLocaleDateString()}</p>
        </div>;
}
