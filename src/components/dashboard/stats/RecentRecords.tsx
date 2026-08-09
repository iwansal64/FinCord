import { number_with_currency } from "@/utils/currency_util";

export default function RecentRecords() {

        return <div className="p-8 grid grid-flow-row auto-rows-36 gap-4 overflow-auto" style={{
                gridArea: "rcd"
        }}>
                <Record title="Dinner with friends" date={new Date()} income={15} currency="$" />
                <Record title="Buy a new phone" date={new Date()} income={-2000} currency="$" />
                <Record title="Work 24 hours" date={new Date()} income={5200} currency="$" />
                <Record title="Dinner with friends" date={new Date()} income={15} currency="$" />
                <Record title="Buy a new phone" date={new Date()} income={-2000} currency="$" />
                <Record title="Work 24 hours" date={new Date()} income={5200} currency="$" />
        </div>;
}

function Record({ title, date, income, currency }: {
        title: string,
        date: Date,
        income: number,
        currency: string
}) {
        return <div className="w-full flex flex-col p-4 bg-gray-800 border border-white rounded-2xl">
                <div className="flex flex-row justify-between">
                        <p className="text-lg">{title}</p>
                        <p className="text-sm text-gray-300">{date.toLocaleDateString()}</p>
                </div>
                <div className="w-full h-full flex justify-center items-center">
                        <p className="text-4xl">{number_with_currency(income, currency)}</p>
                </div>
        </div>;
}
