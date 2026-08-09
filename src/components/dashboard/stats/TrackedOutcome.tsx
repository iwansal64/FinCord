import { number_with_currency } from "@/utils/currency_util";

export default function TrackedOutcome() {

        return <div className="relative flex justify-center items-center" style={{
                gridArea: "to"
        }}>
                <p className="absolute top-5 left-5 text-lg">Tracked Outcome</p>
                <p className="text-6xl text-red-600">{number_with_currency(-4000, "$")}</p>
        </div>;
}
