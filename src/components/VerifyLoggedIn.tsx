'use client';
import { get_user_data_from_object, useUserDataHook } from "@/hooks/useUserData";
import { useVerifyAPI } from "@/utils/api_interface";
import { useEffect } from "react";

export default function VerifyLoggedIn() {
        const { trigger, data, error } = useVerifyAPI();
        const { setUserData } = useUserDataHook();

        useEffect(() => {
                if (!trigger || !setUserData) {
                        return;
                }

                const stored_user_data_from_session_storage = sessionStorage.getItem("userdata");
                if (stored_user_data_from_session_storage == undefined) {
                        trigger();
                        return;
                }

                try {
                        const user_data_from_stored_session_data = get_user_data_from_object(JSON.parse(stored_user_data_from_session_storage));
                        setUserData(user_data_from_stored_session_data);
                }
                catch {
                        sessionStorage.removeItem("userdata");
                        trigger();
                }
        }, [trigger, setUserData]);

        useEffect(() => {
                if (data) {
                        if (!(data instanceof Response)) {
                                // Show error
                                return;
                        }

                        if (data.status != 200) {
                                // Show unauthenticated
                                window.location.href = "/gate/login";
                                return;
                        }


                        data.json().then(possibly_user_data => {
                                const user_data = get_user_data_from_object(possibly_user_data);
                                if (user_data) {
                                        setUserData(user_data);
                                        sessionStorage.setItem("userdata", JSON.stringify(user_data));
                                }
                        })
                }
        }, [data, setUserData]);

        useEffect(() => {
                // Show error message
        }, [error])

        return <></>;
}
