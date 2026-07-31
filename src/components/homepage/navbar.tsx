export default function Navbar() {
        return (
                <nav className="w-screen h-24 py-4 px-10 flex justify-between items-center fixed top-0 left-0 z-100">
                        <div>
                                <h1 className="font-bold text-2xl">FinCord</h1>
                        </div>
                        <ul className="flex h-full justify-center items-center gap-4">
                                <li className="relative w-18 h-12 p-2">
                                        <a href="#" className="absolute top-0 left-0 w-full h-full hover:[&+span]:w-full hover:[&+span]:left-0 flex justify-center items-center">
                                                Home
                                        </a>
                                        <span className="absolute -bottom-2 block h-px w-0 bg-white duration-100 right-0"></span>
                                </li>
                                <li className="relative w-18 h-12 p-2">
                                        <a href="#about" className="absolute top-0 left-0 w-full h-full hover:[&+span]:w-full hover:[&+span]:left-0 flex justify-center items-center">
                                                About
                                        </a>
                                        <span className="absolute -bottom-2 block h-px w-0 bg-white duration-100 right-0"></span>
                                </li>
                                <li className="relative w-18 h-12 p-2">
                                        <a href="#features" className="absolute top-0 left-0 w-full h-full hover:[&+span]:w-full hover:[&+span]:left-0 flex justify-center items-center">
                                                Features
                                        </a>
                                        <span className="absolute -bottom-2 block h-px w-0 bg-white duration-100 right-0"></span>
                                </li>
                                <span className="mx-4"></span>
                                <li className="relative w-28 h-10 bg-white text-black rounded-full text-center">
                                        <a href="/gate/sign" className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                                Sign In
                                        </a>
                                </li>
                                <li className="relative w-28 h-10 border border-white rounded-full text-center">
                                        <a href="/gate/login" className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                                Log In
                                        </a>
                                </li>
                        </ul>
                </nav>
        );
}
