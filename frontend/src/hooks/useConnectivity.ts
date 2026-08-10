import { create } from "zustand";

export type ConnectivityHookType = {
        isConnected: boolean,
        setIsConnected: (newValue: boolean) => void
};

export const useConnectivityHook = create<ConnectivityHookType>((set) => ({
        isConnected: false,
        setIsConnected(newValue) {
                set({
                        isConnected: newValue
                });
        },
}))
