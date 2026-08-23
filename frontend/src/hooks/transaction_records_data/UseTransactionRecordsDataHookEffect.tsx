'use client';

import { useGetRecordsAPI } from "@/utils/api_interface";
import { useEffect } from "react";
import { get_transaction_records_data_from_object, useTransactionRecordsDataHook } from "./useTransactionRecordsData";
import { retrieveWithExpiration, storeWithExpiration } from "@/utils/storage_util";

let initialized_trigger: boolean = false;
let initialized_data: boolean = false;

export default function UseTransactionRecordDataHookEffect() {
        const { trigger, data, error } = useGetRecordsAPI();
        const { setTransactionRecordsData } = useTransactionRecordsDataHook();

        useEffect(() => {
                if (!trigger || !setTransactionRecordsData) return;

                // Check if already trigger the request to get records API
                if(initialized_trigger) return;
                initialized_trigger = true;

                // Check if there's cached transaction records in session storage
                const stored_transaction_records_data_from_session_storage = retrieveWithExpiration(sessionStorage, "transactionrecords");
                
                // If there's no cached transaction records, trigger the API request
                if(stored_transaction_records_data_from_session_storage == null) {
                        trigger();
                        return;
                }

                // Validate the object schema before gets store it to shared data
                const transaction_records_data_from_stored_session_data = get_transaction_records_data_from_object(stored_transaction_records_data_from_session_storage);
                if(transaction_records_data_from_stored_session_data == null) {
                        // If the stored transaction records from session storage has wrong schema, trigger the API request
                        trigger();
                        return;
                }

                console.log("CACHED TRANSACTION RECORDS DATA");

                // If pass all of them, update the data
                setTransactionRecordsData(transaction_records_data_from_stored_session_data);
        }, [trigger, setTransactionRecordsData]);

        useEffect(() => {
                if(!data) return;
                // Check if already get the data (if there's an error from response data user must refresh and the initialized_data resets)
                if(initialized_data) return;
                initialized_data = true;

                if (data.parsing_error != null || data.result == null) {
                        // Show error
                        return;
                }

                if (data.status_code === 401) {
                        // Show unauthenticated
                        window.location.href = "/gate/login";
                        return;
                }

                if (data.status_code !== 200 || data.result.records_data == null) {
                        // Show error message from server
                        return;
                }

                // Verify the data schema, making sure data integrity
                const transaction_records_data = get_transaction_records_data_from_object(data.result.records_data);
                if (transaction_records_data == null) {
                        // Show error message that the data is incompatible / mismatched
                        return;
                }
                
                setTransactionRecordsData(transaction_records_data);
                storeWithExpiration(sessionStorage, "transactionrecords", transaction_records_data, 60*60);
                console.log(transaction_records_data);
        }, [data, setTransactionRecordsData]);

        useEffect(() => {
                // Show error message
        }, [error])

        return <></>;
}
