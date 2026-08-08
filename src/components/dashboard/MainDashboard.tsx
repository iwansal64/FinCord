import CashflowGraph from "./main/CashFlowGraph";
import Chatbot from "./main/Chatbot";
import Insights from "./main/Insights";
import RecentRecords from "./main/RecentRecords";
import TrackedIncome from "./main/TrackedIncome";
import TrackedOutcome from "./main/TrackedOutcome";

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
