import { number_with_currency } from "@/utils/currency_util";

export default function TrackedIncome() {
        return <div className="relative flex justify-center items-center" id="tracked-income">
                <p className="absolute top-5 left-5 text-lg">Tracked Income</p>
                <p className="text-6xl text-green-600">{number_with_currency(10000, "Rp.")}</p>
        </div>;
}
