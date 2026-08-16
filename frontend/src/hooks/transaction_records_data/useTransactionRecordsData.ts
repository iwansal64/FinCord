import { create } from "zustand";
import z from "zod";

export const TransactionRecordType = z.object({
        id: z.number(),
        title: z.string(),
        description: z.string(),
        amount: z.number(),
        is_income: z.boolean(),
        created_at: z.coerce.date(),
})

export type TransactionRecordDataType = z.infer<typeof TransactionRecordType>;

export type TransactionRecordDataHookType = {
        transactionRecordsData: TransactionRecordDataType[]|null,
        setTransactionRecordsData: (newValue: TransactionRecordDataType[]|null) => void
};

export const useTransactionRecordsDataHook = create<TransactionRecordDataHookType>((set) => ({
        transactionRecordsData: null,
        setTransactionRecordsData(newValue) {
                set({
                        transactionRecordsData: newValue
                });
        },
}));

export function get_transaction_records_data_from_object(data: object): TransactionRecordDataType[] | null {
        const parsed_data = TransactionRecordType.array().safeParse(data);

        if (parsed_data.success) {
                return parsed_data.data;
        }
        else {
                console.log(parsed_data.error);
        }

        return null;
}
