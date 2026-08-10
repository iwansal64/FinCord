import { permanentRedirect, RedirectType } from "next/navigation";

export default function DashboardPage() {
        permanentRedirect("./dashboard/stats", RedirectType.replace);

        return <>
        </>;
}
