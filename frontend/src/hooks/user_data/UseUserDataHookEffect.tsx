'use client';

import { useVerifyAPI } from "@/utils/api_interface";
import { get_user_data_from_object, useUserDataHook } from "./useUserData";
import { useEffect } from "react";
import { retrieveWithExpiration, storeWithExpiration } from "@/utils/storage_util";

let initialized_trigger: boolean = false;
let initialized_data: boolean = false;

export default function UseUserDataHookEffect() {
        const { trigger, data, error } = useVerifyAPI();
        const { setUserData } = useUserDataHook();

        
        useEffect(() => {
                if (!trigger || !setUserData) return;

                // Check if already trigger the request to get user API
                if(initialized_trigger) return;
                initialized_trigger = true;

                // Check if there's cached user in session storage
                const stored_user_data_from_session_storage = retrieveWithExpiration(sessionStorage, "users");
                
                // If there's no cached user, trigger the API request
                if(stored_user_data_from_session_storage == null) {
                        trigger();
                        return;
                }

                // Validate the object schema before gets store it to shared data
                const user_data_from_stored_session_data = get_user_data_from_object(stored_user_data_from_session_storage);
                if(user_data_from_stored_session_data == null) {
                        // If the stored user from session storage has wrong schema, trigger the API request
                        trigger();
                        return;
                }

                console.log("CACHED USER DATA");
                // If pass all of them, update the data
                setUserData(user_data_from_stored_session_data);
        }, [trigger, setUserData]);

        useEffect(() => {
                if(!data) return;
                
                // Check if already get the data (if there's an error from response data user must refresh and the initialized_data resets)
                if(initialized_data) return;
                initialized_data = true;

                if (data.client_error != null || data.result == null) {
                        // Show error
                        return;
                }

                if (data.status_code === 401) {
                        // Show unauthenticated
                        window.location.href = "/gate/login";
                        return;
                }

                if (data.status_code != 200 || data.result.user_data == null) {
                        // Show error message from server
                        console.log(`Status code is:${data.status_code}!`);
                        return;
                }

                // Verify the data schema, making sure data integrity
                const validated_user_data = get_user_data_from_object(data.result.user_data);
                if (validated_user_data == null) {
                        // Show error message that the data is incompatible / mismatched
                        console.log(`Data from server is incompatible:${data.result.user_data}!!!`);
                        return;
                }

                setUserData(validated_user_data);
                storeWithExpiration(sessionStorage, "users", validated_user_data, 60);
        }, [data, setUserData]);

        useEffect(() => {
                // Show error message
        }, [error])

        return <></>;
}
