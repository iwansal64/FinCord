import Navbar from "@/components/homepage/navbar";
import Hero from "../components/homepage/hero";

export default function Homepage() {
        return (
                <div className="flex flex-col gap-4 p-4 m-0">
                        <Navbar />
                        <Hero />
                </div>
        );
}
