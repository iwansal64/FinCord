import "@/styles/main_dashboard.css";

import CashflowGraph from "./stats/CashFlowGraph";
import Chatbot from "./stats/Chatbot";
import Insights from "./stats/Insights";
import RecentRecords from "./stats/RecentRecords";
import TrackedIncome from "./stats/TrackedIncome";
import TrackedOutcome from "./stats/TrackedOutcome";

export default function MainDashboard() {

        return <div className="w-full h-full grid gap-8 *:border *:border-white *:rounded-2xl" id="main-dashboard">
                <Chatbot />
                <TrackedIncome />
                <TrackedOutcome />
                <RecentRecords />
                <CashflowGraph />
                <Insights />
        </div>;
}
