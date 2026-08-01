import SignForm from "@/components/gate/sign/SignForm";
import ReasonsCarousel from "@/components/gate/ReasonsCarousel";
import "@/styles/carousel.css";

export default function SignPage() {
        return (
                <>
                        <div className="w-screen h-screen grid grid-cols-2">
                                <div className="flex justify-center items-center">
                                        <SignForm />
                                </div>
                                <div className="relative flex justify-center items-center bg-[#eee]">
                                        <ReasonsCarousel />
                                </div>
                        </div>
                </>
        );
}
