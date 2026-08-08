import SignForm from "@/components/gate/register/SignForm";
import ReasonsCarousel from "@/components/gate/ReasonsCarousel";
import "@/styles/carousel.css";
import { Metadata } from "next";

export const metadata: Metadata = {
        title: "FinCord - Register"
};

export default function SignPage() {
        return (
                <>
                        <div className="w-screen h-screen grid grid-cols-2">
                                <div className="relative flex justify-center items-center">
                                        <SignForm />
                                </div>
                                <div className="relative flex justify-center items-center bg-[#eee]">
                                        <ReasonsCarousel />
                                </div>
                        </div>
                </>
        );
}
