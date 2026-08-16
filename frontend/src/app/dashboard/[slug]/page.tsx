import MainDashboard from "@/components/dashboard/MainDashboard";
import Sidebar from "@/components/dashboard/Sidebar";
import UseTransactionRecordDataHookEffect from "@/hooks/transaction_records_data/UseTransactionRecordsDataHookEffect";
import UseUserDataHookEffect from "@/hooks/user_data/UseUserDataHookEffect";
import { Metadata } from "next";

export const metadata: Metadata = {
        title: "Dashboard page"
};


export default async function DashboardPage({
        params
}: {
        params: Promise<{ slug: string }>
}) {
        const { slug } = await params;

        return <div className="p-4 w-full h-full absolute left-0 top-0 flex flex-row gap-4">
                <UseTransactionRecordDataHookEffect />
                <UseUserDataHookEffect />
                <Sidebar active_tab={slug} />
                {slug == "stats" && <MainDashboard />}
        </div>;
}
