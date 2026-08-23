'use client';
import { useEffect, useState } from "react";
import EntryField from "./entry/EntryField";
import { useCreateRecordAPI } from "@/utils/api_interface";
import { useToastMessageHook } from "@/hooks/global/useToastMessage";

export default function EntryDashboard() {
        const [titleValue, setTitleValue] = useState("");
        const [descriptionValue, setDescriptionValue] = useState("");
        const [amountValue, setAmountValue] = useState(0);

        const { trigger, data, error, isMutating } = useCreateRecordAPI();
        const { setToastMessage } = useToastMessageHook();
        
        useEffect(() => {
                if(!data) return;

                if (data.status_code === 401) {
                        // Show unauthenticated
                        window.location.href = "/gate/login";
                        return;
                }

                if (data.status_code != 200) {
                        // Show error message from server
                        console.log(`Status code is:${data.status_code}!`);
                        return;
                }

                // Show success message
                setToastMessage("Successfully inserted transaction records", 3000);                
        }, [data, setToastMessage]);

        useEffect(() => {
                // Show error from SWR
        }, [error])
        
        
        function SubmitEntry() {
                trigger({
                        title: titleValue,
                        description: descriptionValue,
                        amount: Number.parseInt(amountValue.toString())
                });
        }

        return <div className="w-full h-full flex justify-center items-center">
                <form className="flex flex-col gap-4 w-2/5 min-w-68" onSubmit={(e) => { SubmitEntry(); e.preventDefault() }}>
                        <EntryField inputId="record_title" inputType="text" title="Title" placeholder="Input record title" valueState={titleValue} setValueState={setTitleValue} isDisabled={isMutating} />
                        <EntryField inputId="record_desc" inputType="text" title="Description" placeholder="Input record's brief description" valueState={descriptionValue} setValueState={setDescriptionValue} isDisabled={isMutating} />
                        <EntryField inputId="record_amount" inputType="number" title="Amount" placeholder="How much does the cash flows" valueState={amountValue} setValueState={setAmountValue} isDisabled={isMutating} />
                        <div>
                                <button type="submit" className="w-full h-max p-4 border border-white rounded-xl disabled:opacity-50" disabled={isMutating}>Submit</button>
                        </div>
                </form>
        </div>
}