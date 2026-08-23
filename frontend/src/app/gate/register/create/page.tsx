import ReasonsCarousel from "@/components/gate/ReasonsCarousel";
import "@/styles/carousel.css";
import { Metadata } from "next";
import CreateAccountForm from "@/components/gate/register/CreateAccountForm";
import ToastMessage from "@/components/global/ToastMessage";

export const metadata: Metadata = {
        title: "FinCord - Register"
};

export default function CreateAccountPage() {
        return (
                <>
                        <div className="w-screen h-screen grid grid-cols-2">
                                <div className="relative flex justify-center items-center">
                                        <CreateAccountForm />
                                </div>
                                <div className="relative flex justify-center items-center bg-[#eee]">
                                        <ReasonsCarousel />
                                </div>
                        </div>
                        <ToastMessage />
                </>
        );
}
