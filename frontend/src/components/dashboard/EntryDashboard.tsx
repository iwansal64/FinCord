'use client';
import { useState } from "react";
import EntryField from "./entry/EntryField";

export default function EntryDashboard() {
        const [titleValue, setTitleValue] = useState("");
        const [descriptionValue, setDescriptionValue] = useState("");
        const [amountValue, setAmountValue] = useState("");

        return <div className="w-full h-full">
                <div className="flex flex-col gap-4">
                        <EntryField inputId="record_title" inputType="text" title="Title" placeholder="Input record title" valueState={titleValue} setValueState={setTitleValue} />
                        <EntryField inputId="record_desc" inputType="text" title="Description" placeholder="Input record's brief description" valueState={descriptionValue} setValueState={setDescriptionValue} />
                        <EntryField inputId="record_amount" inputType="number" title="Amount" placeholder="How much does the cash flows" valueState={amountValue} setValueState={setAmountValue} />
                </div>
        </div>
}