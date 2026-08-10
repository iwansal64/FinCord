import { LogIn } from "lucide-react";

export default function Navbar() {
        return (
                <nav className="w-screen h-24 py-4 px-10 flex flex-row items-center justify-between fixed top-0 left-0 z-100 bg-[#eee] *:text-black">
                        <div className="w-full flex flex-row items-center">
                                <div className="relative w-28 h-10 duration-250 has-[a:hover]:h-8 has-[a:hover]:[&_p]:opacity-0">
                                        <a className="block w-full h-full cursor-pointer" href="#">
                                                <h1 className="absolute top-0 font-bold text-2xl">FinCord</h1>
                                                <p className="absolute bottom-0 text-xs duration-250">Budget Tracker</p>
                                        </a>
                                </div>
                                <span className="mx-8"></span>
                                <ul className="flex h-full justify-center items-center gap-4">
                                        <li className="relative w-18 h-6 p-2">
                                                <a href="#" className="absolute top-0 left-0 w-full h-full hover:[&+span]:w-full hover:[&+span]:left-0 flex justify-center items-center">
                                                        Home
                                                </a>
                                                <span className="absolute -bottom-2 block h-px w-0 bg-black duration-250 right-0"></span>
                                        </li>
                                        <li className="relative w-18 h-6 p-2">
                                                <a href="#about" className="absolute top-0 left-0 w-full h-full hover:[&+span]:w-full hover:[&+span]:left-0 flex justify-center items-center">
                                                        About
                                                </a>
                                                <span className="absolute -bottom-2 block h-px w-0 bg-black duration-250 right-0"></span>
                                        </li>
                                        <li className="relative w-18 h-6 p-2">
                                                <a href="#features" className="absolute top-0 left-0 w-full h-full hover:[&+span]:w-full hover:[&+span]:left-0 flex justify-center items-center">
                                                        Features
                                                </a>
                                                <span className="absolute -bottom-2 block h-px w-0 bg-black duration-250 right-0"></span>
                                        </li>
                                </ul>
                        </div>
                        <ul className="flex h-full justify-self-end justify-center items-center gap-4">
                                <li className="relative w-28 h-10 bg-black text-white text-center rounded-none">
                                        <a href="/gate/register" className="absolute top-0 left-0 w-full h-full flex flex-row gap-1.5 items-center justify-center">
                                                <LogIn width={15} />
                                                Sign In
                                        </a>
                                </li>
                                <li className="relative w-28 h-10 border border-black text-center rounded-none">
                                        <a href="/gate/login" className="absolute top-0 left-0 w-full h-full flex flex-row gap-1 items-center justify-center">
                                                Log In
                                        </a>
                                </li>
                                <li className="relative w-28 h-10 border border-black text-center rounded-none has-[a:hover]:bg-black has-[a:hover]:text-white duration-500 delay-250">
                                        <a
                                                href="/offline"
                                                className="absolute top-0 left-0 w-full h-full flex flex-row gap-1 items-center justify-center hover:[&_span:not(.offline)]:opacity-0 hover:[&_span.offline]:left-1/2"
                                        >
                                                <span className="offline absolute left-8 -translate-x-1/2 duration-750">Offline</span>
                                                <span className="absolute right-2">Mode</span>
                                        </a>
                                </li>
                        </ul>
                </nav>
        );
}
