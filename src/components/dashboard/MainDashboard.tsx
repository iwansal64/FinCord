import CashflowGraph from "./stats/CashFlowGraph";
import Chatbot from "./stats/Chatbot";
import Insights from "./stats/Insights";
import RecentRecords from "./stats/RecentRecords";
import TrackedIncome from "./stats/TrackedIncome";
import TrackedOutcome from "./stats/TrackedOutcome";

export default function MainDashboard() {

        return <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-8 *:border *:border-white *:rounded-2xl" style={{
                gridTemplateAreas: `"rcd ti to" "rcd gr gr" "cb ins ins"`
        }}>
                <RecentRecords />
                <TrackedIncome />
                <TrackedOutcome />
                <CashflowGraph />
                <Chatbot />
                <Insights />
        </div>;
}
