export default function Hero() {
        return (
                <section id="section-hero" className="w-full min-h-screen flex justify-center items-center relative">
                        <div className="p-14 text-center space-y-2 relative">
                                <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <path d="M 0,10 L 95,10 L 95,100" stroke="white" fill="none" strokeWidth={0.2}></path>
                                        <path d="M 5,0 L 5,90 L 100,90" stroke="white" fill="none" strokeWidth={0.2}></path>
                                </svg>
                                <h1 className="text-8xl font-thin">FinCord</h1>
                                <p className="text-2xl font-thin text-white/50">Track your money effortlessly</p>
                        </div>
                </section>
        );
}
