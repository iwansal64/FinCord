import CurrentStats from "./insights/CurrentStats";
import GeneratedInsights from "./insights/GeneratedInsights";
import PreviousStats from "./insights/PreviousStats";

export default function Insights() {

        return <div className="flex flex-row gap-8 w-full h-full p-8" style={{
                gridArea: "ins"
        }}>
                <PreviousStats />
                <CurrentStats />
                <GeneratedInsights />
        </div>;
}
