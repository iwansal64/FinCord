export default function CurrentStats() {
        return <div className="w-full h-full bg-gray-700 border border-white rounded-2xl flex flex-col gap-2 p-2">
                <div className="w-full text-center">
                        <p>Current Stats</p>
                </div>
                <div className="w-full h-full">
                        <ul>
                                <li>Income: $210</li>
                                <li>Outcome: $200</li>
                                <li>Balance: $10</li>
                        </ul>
                </div>
        </div>
}
