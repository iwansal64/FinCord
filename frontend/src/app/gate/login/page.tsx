import LoginForm from "@/components/gate/login/LoginForm";
import ReasonsCarousel from "@/components/gate/ReasonsCarousel";
import "@/styles/carousel.css";
import { Metadata } from "next";

export const metadata: Metadata = {
        title: "FinCord - Login"
};

export default function LoginPage() {
        return (
                <>
                        <div className="w-screen h-screen grid grid-cols-2">
                                <div className="relative flex justify-center items-center">
                                        <LoginForm />
                                </div>
                                <div className="relative flex justify-center items-center bg-[#eee]">
                                        <ReasonsCarousel />
                                </div>
                        </div>
                </>
        );
}
