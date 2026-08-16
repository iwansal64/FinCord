interface Props<T extends string | number = string> {
        title: string,
        inputType: "text" | "number",
        valueState: T,
        setValueState: (value: T) => void,
        inputId: string,
        placeholder: string,
        isDisabled?: boolean
};

export default function EntryField<T extends string | number>(props: Props<T>) {
       return <div className="flex flex-col w-full h-max">
                <label htmlFor={props.inputId}>{props.title}</label>
                <span className="my-1"></span>
                <input
                        type={props.inputType}
                        id={props.inputId}
                        className="border-[0.5px] rounded-lg p-3"
                        placeholder={props.placeholder}
                        style={{
                                borderColor: ((typeof props.valueState) == "string" && props.valueState.length > 0) ? "white" : "gray",
                        }}
                        onChange={(event) => {
                                if(typeof props.valueState == "number") {
                                        props.setValueState(Number.parseInt(event.target.value) as T)
                                        return;
                                }

                                props.setValueState(event.target.value as T)
                        }}
                        disabled={props.isDisabled}
                />
        </div>
}