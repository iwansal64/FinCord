import useSWRMutation from "swr/mutation";
import z from "zod";

type SendPostResultType<T> = {
        result: T | null,
        status_code: number | null,
        parsing_error: z.ZodError | null
};

type SendPostStreamingResponseResultType = {
        error: unknown | null;
};

type SendGetResultType<T> = {
        result: T | null,
        status_code: number | null,
        parsing_error: z.ZodError | null
};

const base_url = process.env.NEXT_PUBLIC_BASE_URL;
const sendPOST =
        <T, R = unknown>(responseBodySchema?: z.ZodType<R>) =>
                async (url: string, { arg }: { arg: T; }): Promise<SendPostResultType<R>> => {
                        const res = await fetch(base_url + url, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(arg),
                                credentials: "include",
                        });

                        if(!responseBodySchema) {
                                return {
                                        result: null,
                                        status_code: res.status,
                                        parsing_error: null
                                };
                        }

                        const dataParsingResult = responseBodySchema.safeParse(await res.json());
                        
                        return {
                                result: dataParsingResult.success?dataParsingResult.data:null,
                                status_code: res.status,
                                parsing_error: (!dataParsingResult.success)?dataParsingResult.error:null
                        };
                };

const sendGET =
        <T, R = unknown>(responseBodySchema?: z.ZodType<R>) =>
                async (url: string, { arg }: { arg: T; }): Promise<SendGetResultType<R>> => {
                        const res = await fetch(base_url + url, {
                                method: "GET",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(arg),
                                credentials: "include",
                        });
                        
                        if(!responseBodySchema) {
                                return {
                                        result: null,
                                        status_code: res.status,
                                        parsing_error: null
                                };
                        }

                        const dataParsingResult = responseBodySchema.safeParse(await res.json());
                        
                        return {
                                result: dataParsingResult.success?dataParsingResult.data:null,
                                status_code: res.status,
                                parsing_error: (!dataParsingResult.success)?dataParsingResult.error:null
                        };
                };

const sendPOSTStreamingResponse = <T extends {[key: string]: string}>() =>
                async (url: string, { arg }: { arg: { onChunk: (chunk: string) => void, onOver: (fullChunk: string) => void, body: T } }): Promise<SendPostStreamingResponseResultType> => {
                        const res = await fetch(base_url + url, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(arg.body),
                                credentials: "include",
                        });

                        if (!res.ok || !res.body) {
                                return {
                                        error: (await res.json())
                                }
                        }

                        const reader = res.body.getReader();
                        const decoder = new TextDecoder();
                        let done = false;
                        let fullChunk = "";
                        while(!done) {
                                const { value, done: streamDone } = await reader.read();
                                done = streamDone;

                                if(value) {
                                        const decoded = decoder.decode(value, { stream: true });
                                        arg.onChunk(decoded);
                                        fullChunk += decoded;
                                }
                        }

                        arg.onOver(fullChunk);

                        return {
                                error: null
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

const userSchema = z.strictObject({
        id: z.number(),
        username: z.string(),
        email: z.string(),
        created_at: z.iso.datetime(),
})

const verificationResponseBodySchema = z.strictObject({
        error_message: z.string().nullish(),
        user_data: userSchema.nullish(),
});

export type VerifyAPIResponseBodyType = z.infer<typeof verificationResponseBodySchema>;

export function useVerifyAPI() {
        return useSWRMutation(
                "/user/verify",
                sendPOST<unknown, VerifyAPIResponseBodyType>(verificationResponseBodySchema),
        );
}

export function useVerifyRegistrationAPI() {
        return useSWRMutation(
                "/user/register/verify",
                sendPOST<{ email: string; token: string; }>(),
        );
}

export function useCreateAccountAPI() {
        return useSWRMutation(
                "/user/register/create",
                sendPOST<{ email: string; token: string; username: string; password: string; }>(),
        );
}

const recordSchema = z.strictObject({
        id: z.number(),
        title: z.string(),
        description: z.string(),
        amount: z.number(),
        is_income: z.boolean(),
        created_at: z.iso.datetime(),
});

const recordsAPIResponseBodySchema = z.strictObject({
        error_message: z.string().nullish(),
        records_data: recordSchema.array().nullish()
});

export type RecordsAPIResponseBodyType = z.infer<typeof recordsAPIResponseBodySchema>;

export function useGetRecordsAPI() {
        return useSWRMutation(
                "/records",
                sendGET<unknown, RecordsAPIResponseBodyType>(recordsAPIResponseBodySchema)
        );
}

export function useCreateRecordAPI() {
        return useSWRMutation(
                "/records",
                sendPOST<{ title: string, description: string, amount: number }>()
        );
}

export function useSendMessageToAIAPI() {
        return useSWRMutation(
                "/user/chat",
                sendPOSTStreamingResponse<{ message: string }>()
        )
}