"use client";

import { useToastMessageHook } from "@/hooks/global/useToastMessage";
import { useRegisterAPI } from "@/utils/api_interface";
import { useEffect, useState } from "react";

export default function SignForm() {
        const [email, setEmail] = useState("");

        const { trigger, data, error, isMutating } = useRegisterAPI();
        const { setToastMessage } = useToastMessageHook();

        function SubmitForm() {
                if (email.length == 0) return;
                trigger({ email });
        }

        useEffect(() => {
                if(!data) return;
                
                // If there's no error from the server
                if(data.status_code == 200) {
                        setToastMessage("Please check your mailbox!!", 5000);

                        sessionStorage.setItem("current_email", email);
                        
                        setTimeout(() => {
                                window.location.href = "./register/verify";
                        }, 5000);
                }
        }, [data, email, setToastMessage]);

        useEffect(() => {
                if(!error) return;

                console.error(error);
                setToastMessage(`There's an error when submitting sign in form.`, 5000);
        }, [error, setToastMessage]);

        return (
                <div className="flex flex-col items-center justify-center gap-4 absolute top-1/2 left-1/2 -translate-1/2">
                        <div className="flex flex-col items-center justify-center">
                                <h1 className="text-4xl font-thin">Sign Up</h1>
                                <p className="text-md font-thin">Register before you use our online system</p>
                        </div>
                        <span className="my-2"></span>
                        <form action="" className="flex flex-col items-center justify-center gap-4 w-full h-full" onSubmit={(event) => { SubmitForm(); event.preventDefault()}}>
                                <div className="flex flex-col w-full h-full">
                                        <label htmlFor="email">Email Address</label>
                                        <span className="my-1"></span>
                                        <input
                                                type="text"
                                                id="email"
                                                className="border-[0.5px] rounded-lg p-3"
                                                placeholder="Enter Your Email"
                                                style={{
                                                        borderColor: email.length > 0 ? "white" : "gray",
                                                }}
                                                onChange={(event) => setEmail(event.target.value)}
                                                disabled={isMutating}
                                        />
                                </div>
                                <div className="w-full flex flex-col gap-0">
                                        <button type="submit" className="w-full text-white py-2 px-4 border border-white rounded-lg disabled:opacity-50" disabled={email.length == 0 || isMutating}>
                                                Next
                                        </button>
                                        <p>You already have an account? <a href="./login" className="underline">Login here</a></p>
                                </div>
                        </form>
                </div>
        );
}
