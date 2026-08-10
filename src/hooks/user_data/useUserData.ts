import { create } from "zustand";
import z from "zod";

export const UserDataSchema = z.object({
        id: z.number(),
        username: z.string(),
        email: z.string(),
        created_at: z.iso.datetime(),
})

export type UserDataType = z.infer<typeof UserDataSchema>;

export type UserDataHookType = {
        userData: UserDataType|null,
        setUserData: (newValue: UserDataType|null) => void
};

export const useUserDataHook = create<UserDataHookType>((set) => ({
        userData: null,
        setUserData(newValue) {
                set({
                        userData: newValue
                });
        },
}));

export function get_user_data_from_object(data: object): UserDataType | null {
        const parsed_data = UserDataSchema.safeParse(data);

        if (parsed_data.success) {
                return parsed_data.data;
        }
        else {
                console.log(parsed_data.error);
        }

        return null;
}
