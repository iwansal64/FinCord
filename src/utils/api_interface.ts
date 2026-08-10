import useSWRMutation from "swr/mutation";

const base_url = process.env.NEXT_PUBLIC_BASE_URL;
const sendPOST =
        <T>() =>
        async (url: string, { arg }: { arg: T }) => {
                try {
                        const res = await fetch(base_url + url, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(arg),
                                credentials: "include",
                        });

                        return res;
                } catch (error) {
                        return error;
                }
        };

export function useRegisterAPI() {
        const { trigger, data, error, isMutating } = useSWRMutation(
                "/user/register",
                sendPOST<{ email: string }>(),
        );
        return {
                trigger,
                data,
                error,
                isMutating,
        };
}

export function useLoginAPI() {
        const { trigger, data, error, isMutating } = useSWRMutation(
                "/user/login",
                sendPOST<{ email_or_username: string; password: string }>(),
        );
        return {
                trigger,
                data,
                error,
                isMutating,
        };
}

export function useVerifyAPI() {
        const { trigger, data, error, isMutating } = useSWRMutation(
                "/user/verify",
                sendPOST(),
        );
        return {
                trigger,
                data,
                error,
                isMutating,
        };
}
