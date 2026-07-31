export default function Navbar() {
        return (
                <nav className="w-screen py-4 px-10 flex justify-between items-center fixed top-0 left-0 z-100">
                        <div>
                                <h1 className="font-bold text-2xl">FinCord</h1>
                        </div>
                        <ul className="flex justify-center items-center gap-4">
                                <li className="relative p-2">
                                        <a href="#" className="w-full h-full hover:[&+span]:w-full hover:[&+span]:left-0">
                                                Home
                                        </a>
                                        <span className="absolute -bottom-2 block h-px w-0 bg-white duration-100 right-0"></span>
                                </li>
                                <li className="relative p-2">
                                        <a href="#about" className="w-full h-full hover:[&+span]:w-full hover:[&+span]:left-0">
                                                About
                                        </a>
                                        <span className="absolute -bottom-2 block h-px w-0 bg-white duration-100 right-0"></span>
                                </li>
                                <li className="relative p-2">
                                        <a href="#features" className="w-full h-full hover:[&+span]:w-full hover:[&+span]:left-0">
                                                Features
                                        </a>
                                        <span className="absolute -bottom-2 block h-px w-0 bg-white duration-100 right-0"></span>
                                </li>
                        </ul>
                </nav>
        );
}
