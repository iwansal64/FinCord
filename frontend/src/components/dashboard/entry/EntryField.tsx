interface Props {
        title: string,
        inputType: "text" | "number",
        valueState: string,
        setValueState: (value: string) => void,
        inputId: string,
        placeholder: string,
        isDisabled?: boolean
};

export default function EntryField(props: Props) {
       return <div className="flex flex-col w-full h-full">
                <label htmlFor={props.inputId}>{props.title}</label>
                <span className="my-1"></span>
                <input
                        type={props.inputType}
                        id={props.inputId}
                        className="border-[0.5px] rounded-lg p-3"
                        placeholder={props.placeholder}
                        style={{
                                borderColor: props.valueState.length > 0 ? "white" : "gray",
                        }}
                        onChange={(event) => props.setValueState(event.target.value)}
                        disabled={props.isDisabled}
                />
        </div>
}