import useSWRMutation from "swr/mutation";

type SendPostResultType = {
        result: Response | null,
        error: unknown | null;
};

const base_url = process.env.NEXT_PUBLIC_BASE_URL;
const sendPOST =
        <T>() =>
                async (url: string, { arg }: { arg: T; }): Promise<SendPostResultType> => {
                        try {
                                const res = await fetch(base_url + url, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(arg),
                                        credentials: "include",
                                });

                                return {
                                        result: res,
                                        error: null
                                };
                        } catch (error) {
                                return {
                                        result: null,
                                        error: error
                                };
                        }
                };

export function useRegisterAPI() {
        return useSWRMutation(
                "/user/register",
                sendPOST<{ email: string; }>(),
        );
}

export function useLoginAPI() {
        return useSWRMutation(
                "/user/login",
                sendPOST<{ email_or_username: string; password: string; }>(),
        );
}

export function useVerifyAPI() {
        return useSWRMutation(
                "/user/verify",
                sendPOST(),
        );
}