"use client";

import { useCreateAccountAPI } from "@/utils/api_interface";
import { useEffect, useRef, useState } from "react";
import InputFeild from "../InputField";
import { useToastMessageHook } from "@/hooks/global/useToastMessage";

export default function CreateAccountForm() {
        const [username, setUsername] = useState("");
        const [password, setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");

        const { trigger, data, error, isMutating } = useCreateAccountAPI();
        const { setToastMessage } = useToastMessageHook();
        
        const emailRef = useRef<string|null>(null);
        const tokenRef = useRef<string|null>(null);

        function SubmitForm() {
                if (tokenRef.current == null || emailRef.current == null || password != confirmPassword || username.length == 0) return;
                trigger({ token: tokenRef.current, email: emailRef.current, username: username, password: password });
        }
        
        useEffect(() => {
                const storedEmail: string | null = sessionStorage.getItem("current_email");
                const storedVerifiedToken: string | null = sessionStorage.getItem("token_verified");

                // Check data from previous step of registration
                if(storedEmail == null || storedVerifiedToken == null) {
                        window.location.href = "../register";
                        return;
                }

                emailRef.current = storedEmail;
                tokenRef.current = storedVerifiedToken;
        }, []);

        useEffect(() => {
                if(!data) return;
                
                // If there's no error from the server
                if(data.status_code == 200) {
                        setToastMessage("Account has been successfully created!", 5000);
                        
                        sessionStorage.removeItem("current_email");
                        sessionStorage.removeItem("token_verified");
                        
                        setTimeout(() => {
                                window.location.href = "../login";
                        }, 5000);
                }
        }, [data, setToastMessage]);

        useEffect(() => {
                if(!error) return;

                console.error(error);
                setToastMessage(`There's an error when creating account.`, 5000);
        }, [error, setToastMessage]);


        return (
                <div className="flex flex-col items-center justify-center gap-4 absolute top-1/2 left-1/2 -translate-1/2">
                        <div className="flex flex-col items-center justify-center">
                                <h1 className="text-4xl font-thin">Confirm your email</h1>
                                <p className="text-md font-thin">Please, open your mailbox, grab the token and paste it here</p>
                        </div>
                        <span className="my-2"></span>
                        <form action="" className="flex flex-col items-center justify-center gap-4 w-full h-full" onSubmit={(event) => { SubmitForm(); event.preventDefault()}}>
                                <InputFeild title="Username" inputType="text" inputId="username" placeholder="Enter Username" setValueState={setUsername} valueState={username} isDisabled={isMutating} />
                                <InputFeild title="Password" inputType="password" inputId="password" placeholder="Enter Password" setValueState={setPassword} valueState={password} isDisabled={isMutating} />
                                <InputFeild title="Confirm Password" inputType="password" inputId="confirm-password" placeholder="Confirm Password" setValueState={setConfirmPassword} valueState={confirmPassword} isDisabled={isMutating} />
                                <div className="w-full flex flex-col gap-0">
                                        <button type="submit" className="w-full text-white py-2 px-4 border border-white rounded-lg disabled:opacity-50" disabled={username.length == 0 || password.length == 0 || confirmPassword != password || isMutating}>
                                                Next
                                        </button>
                                </div>
                        </form>
                </div>
        );
}
