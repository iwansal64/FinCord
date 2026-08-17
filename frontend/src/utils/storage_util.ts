import z from "zod";

const storedVariableWithExpiration = z.object({
        data: z.any(),
        expiration: z.number()
});

type StoredVariableWithExpirationType = z.infer<typeof storedVariableWithExpiration>;

export function storeWithExpiration(storage: Storage, key: string, value: object, maxAgeInSeconds: number) {
        const processedValue: StoredVariableWithExpirationType = {
                data: value,
                expiration: (new Date()).valueOf()+(maxAgeInSeconds*1000)
        }
        storage.setItem(key, JSON.stringify(processedValue));
}

export function retrieveWithExpiration(storage: Storage, key: string): object | null {
        // Get raw data from storage
        const rawData = storage.getItem(key);
        if(!rawData) return null;

        // Parse raw JSON data from storage to object
        let data;
        try {
                data = JSON.parse(rawData);
        }
        catch {
                return null;
        }

        // Check the data
        const dataParsingResult = storedVariableWithExpiration.safeParse(data);
        if(!dataParsingResult.success) {
                storage.removeItem(key);
                return null;
        }

        // Get the data
        const processedData = dataParsingResult.data;

        // If expired
        if(processedData.expiration < (new Date()).valueOf()) {
                storage.removeItem(key);
                return null
        };

        // Return the processed data
        return processedData.data;
}