import { Book, LogOutIcon, Settings, User } from "lucide-react";

export default function Sidebar({ active_tab }: { active_tab: string }) {

        return <nav className="p-4 w-max border border-white rounded-full flex flex-col">
                <ul className="flex flex-col gap-2 h-full">
                        <li className={`cursor-pointer flex justify-center items-center rounded-full border border-white p-4 ${active_tab == "stats" && "bg-gray-500"}`}>
                                <a href="./stats"><User width={25} height={25} /></a>
                        </li>
                        <li className={`cursor-pointer flex justify-center items-center rounded-full border border-white p-4 ${active_tab == "entry" && "bg-gray-500"}`}>
                                <a href="./entry"><Book width={25} height={25} /></a>
                        </li>
                </ul>
                <ul className="flex flex-col gap-2">
                        <a href="./settings" className={`cursor-pointer flex justify-center items-center rounded-full border border-white p-4 ${active_tab == "settings" && "bg-gray-500"}`}>
                                <Settings width={25} height={25} />
                        </a>
                        <a href="/gate/leave" className="w-full aspect-square flex justify-center items-center rounded-full border border-white p-4">
                                <LogOutIcon width={20} height={20} />
                        </a>
                </ul>
        </nav>;
}
