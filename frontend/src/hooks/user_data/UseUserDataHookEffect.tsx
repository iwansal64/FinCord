'use client';

import { useVerifyAPI } from "@/utils/api_interface";
import { get_user_data_from_object, useUserDataHook } from "./useUserData";
import { useEffect } from "react";

export default function UseUserDataHookEffect() {
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
                        if (user_data_from_stored_session_data) {
                                setUserData(user_data_from_stored_session_data);
                                return;
                        }

                        throw Error();
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

                        if (data.status == 401) {
                                // Show unauthenticated
                                window.location.href = "/gate/login";
                                return;
                        }

                        if (data.status != 200) {
                                // Show there's server error
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
