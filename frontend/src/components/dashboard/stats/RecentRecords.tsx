'use client';
import { useTransactionRecordsDataHook } from "@/hooks/transaction_records_data/useTransactionRecordsData";
import UseTransactionRecordDataHookEffect from "@/hooks/transaction_records_data/UseTransactionRecordsDataHookEffect";
import { number_with_currency } from "@/utils/currency_util";

export default function RecentRecords() {
        const { transactionRecordsData } = useTransactionRecordsDataHook();

        return <div className="p-8 grid grid-flow-row auto-rows-36 gap-4 overflow-auto" id="recent-records-component">
                <UseTransactionRecordDataHookEffect />
                {(() => {
                        if(transactionRecordsData == null) {
                                return <>
                                        <p>Loading..</p>
                                </>;
                        }

                        if(transactionRecordsData.length == 0) {
                                return <>
                                        <p>There&apos;s no recorded data</p>
                                </>;
                        }
                        
                        return transactionRecordsData.map((record_data, index) => {
                                return <Record 
                                        key={index} 
                                        title={record_data.title}
                                        currency="Rp"
                                        date={record_data.created_at}
                                        amount={record_data.amount}
                                />;
                        });
                })()}
        </div>;
}

function Record({ title, date, amount, currency }: {
        title: string,
        date: Date,
        amount: number,
        currency: string
}) {
        return <div className="w-full flex flex-col p-4 bg-gray-800 border border-white rounded-2xl">
                <div className="flex flex-row justify-between">
                        <p className="text-lg">{title}</p>
                        <p className="text-sm text-gray-300">{date.toLocaleDateString()}</p>
                </div>
                <div className="w-full h-full flex justify-center items-center">
                        <p className="text-4xl">{number_with_currency(amount, currency)}</p>
                </div>
        </div>;
}
