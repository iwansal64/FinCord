"use client";

import { useToastMessageHook } from "@/hooks/global/useToastMessage";
import { useLoginAPI } from "@/utils/api_interface";
import { useEffect, useState } from "react";

export default function LoginForm() {
        const [emailOrUsername, setEmailOrUsername] = useState("");
        const [password, setPassword] = useState("");

        const { trigger, data, error, isMutating } = useLoginAPI();
        const { setToastMessage: setMessage } = useToastMessageHook()

        function SubmitForm() {
                if (emailOrUsername.length == 0 || password.length == 0) return;

                trigger({
                        email_or_username: emailOrUsername,
                        password: password
                });
        }

        useEffect(() => {
                if(!data || !setMessage) {
                        return;
                }

                if (data.status_code == 200) {
                        window.location.href = "/dashboard";
                }
                else if(data.status_code == 401) {
                        setMessage(`Authentication Failed`, 5000);
                }
        }, [data, setMessage]);

        useEffect(() => {
                if (!error || !setMessage) {
                        return;
                }
                
                setMessage(`There's an error: ${error}`, 5000);
        }, [error, setMessage])

        return (
                <div className="flex flex-col items-center justify-center gap-4 absolute top-1/2 left-1/2 -translate-1/2">
                        <div className="flex flex-col items-center justify-center">
                                <h1 className="text-4xl font-thin">Login</h1>
                                <p className="text-md font-thin text-center mt-1">
                                        Welcome back to our system!
                                        <br />
                                        You haven&apos;t forgot your own password, aren&apos;t you?
                                </p>
                        </div>
                        <span className="my-2"></span>
                        <form action="" className="flex flex-col items-center justify-center gap-2 w-full h-full" onSubmit={(event) => { SubmitForm(); event.preventDefault() }}>
                                <div className="flex flex-col w-full h-full">
                                        <label htmlFor="email">Email or Username</label>
                                        <span className="my-1"></span>
                                        <input
                                                type="text"
                                                id="email"
                                                className="border-[0.5px] rounded-lg p-3 disabled:opacity-50"
                                                placeholder="Enter Your Email or Username"
                                                style={{
                                                        borderColor: emailOrUsername.length > 0 ? "white" : "gray",
                                                }}
                                                onChange={(event) => setEmailOrUsername(event.target.value)}
                                                disabled={isMutating}
                                        />
                                </div>
                                <div className="flex flex-col w-full h-full">
                                        <label htmlFor="password">Password</label>
                                        <span className="my-1"></span>
                                        <input
                                                type="password"
                                                id="password"
                                                className="border-[0.5px] rounded-lg p-3 disabled:opacity-50"
                                                placeholder="Enter Your Password"
                                                style={{
                                                        borderColor: password.length > 0 ? "white" : "gray",
                                                }}
                                                onChange={(event) => setPassword(event.target.value)}
                                                disabled={isMutating}
                                        />
                                </div>
                                <div>
                                        <button
                                                type="submit"
                                                className="mt-4 w-full text-white py-2 px-4 border border-white rounded-lg disabled:opacity-50"
                                                disabled={emailOrUsername.length == 0 || password.length == 0 || isMutating}
                                        >
                                                Next
                                        </button>
                                        <p>You don&apos;t have an account? <a href="./register" className="underline">Register here</a></p>
                                </div>
                        </form>
                </div>
        );
}
