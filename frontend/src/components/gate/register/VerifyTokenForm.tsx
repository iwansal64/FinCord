"use client";

import { useVerifyRegistrationAPI } from "@/utils/api_interface";
import { useEffect, useRef, useState } from "react";

export default function VerfiyTokenForm() {
        const [token, setToken] = useState("");
        const { trigger, data, error, isMutating } = useVerifyRegistrationAPI();

        const emailRef = useRef<string|null>(null);

        function SubmitForm() {
                if (token.length == 0 || emailRef.current == null) return;
                trigger({ token: token, email: emailRef.current });
        }
        
        useEffect(() => {
                const storedEmail: string | null = sessionStorage.getItem("current_email");

                // Check data from previous step of registration
                if(storedEmail == null) {
                        window.location.href = "../register";
                        return;
                }

                emailRef.current = storedEmail;
        }, []);

        useEffect(() => {
                console.log(`data:${data}`);
                console.log(`error:${error}`);

                if(data?.result && data.result.status == 200) {
                        sessionStorage.setItem("token_verified", token);
                        window.location.href = "./create";
                }
        }, [data, error]);

        return (
                <div className="flex flex-col items-center justify-center gap-4 absolute top-1/2 left-1/2 -translate-1/2">
                        <div className="flex flex-col items-center justify-center">
                                <h1 className="text-4xl font-thin">Confirm your email</h1>
                                <p className="text-md font-thin text-center">Please, open your mailbox, grab the token and paste it here</p>
                        </div>
                        <span className="my-2"></span>
                        <form action="" className="flex flex-col items-center justify-center gap-4 w-full h-full" onSubmit={(event) => { SubmitForm(); event.preventDefault()}}>
                                <div className="flex flex-col w-full h-full">
                                        <label htmlFor="token">Token</label>
                                        <span className="my-1"></span>
                                        <input
                                                type="text"
                                                id="token"
                                                className="border-[0.5px] rounded-lg p-3"
                                                placeholder="Enter Your Token"
                                                style={{
                                                        borderColor: token.length > 0 ? "white" : "gray",
                                                }}
                                                onChange={(event) => setToken(event.target.value)}
                                                disabled={isMutating}
                                        />
                                </div>
                                <div className="w-full flex flex-col gap-0">
                                        <button type="submit" className="w-full text-white py-2 px-4 border border-white rounded-lg disabled:opacity-50" disabled={token.length == 0 || isMutating}>
                                                Next
                                        </button>
                                </div>
                        </form>
                </div>
        );
}
