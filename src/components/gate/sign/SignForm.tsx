"use client";

import { useState } from "react";

export default function SignForm() {
        const [email, setEmail] = useState("");

        function SubmitForm() {
                if (email.length == 0) return;
                // Send data to backend
        }

        return (
                <div className="flex flex-col items-center justify-center gap-4 absolute top-1/2 left-1/2 -translate-1/2">
                        <div className="flex flex-col items-center justify-center">
                                <h1 className="text-4xl font-thin">Sign Up</h1>
                                <p className="text-md font-thin">Register before you use our online system</p>
                        </div>
                        <span className="my-2"></span>
                        <form action="" className="flex flex-col items-center justify-center gap-4" onSubmit={SubmitForm}>
                                <div className="flex flex-col">
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
                                        />
                                </div>
                                <button type="submit" className="w-full text-white py-2 px-4 border border-white rounded-lg disabled:opacity-50" disabled={email.length == 0}>
                                        Next
                                </button>
                        </form>
                </div>
        );
}
