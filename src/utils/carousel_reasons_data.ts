import { StaticImport } from "next/dist/shared/lib/get-img-props";
import KnowingHabit from "@/assets/knowing-habit.svg";
import ClarifyBudget from "@/assets/clarify-budget.svg";
import InvestmentPlanning from "@/assets/investment-planning.svg";
import RecordedMoney from "@/assets/recorded-money.svg";
import ReviewSpending from "@/assets/review-spending.svg";


export type ReasonType = {
        title: string,
        quote?: string,
        descriptions: string[],
        image: StaticImport;
};

export const reasons: ReasonType[] = [
        {
                title: "Recorded Money, Recorded Life",
                quote: "What things you bought this week? You'd knew items you bought this year if you used this app",
                descriptions: ["Money is something we need to look out before it disappears before us. We're oftenly, if not always, forgot about our spending and it must be irritates us."],
                image: RecordedMoney,
        },
        {
                title: "Plan Your Investment, Plan Your Future",
                quote: "Your future self waited you for the moment you realize that 'what you spent builds your future'",
                descriptions: ["You are what you spend. Let's think about product you really- really want right now... If you have something in mind, I know you work something for it until now"],
                image: InvestmentPlanning,
        },
        {
                title: "Review Your Spending, Review Your Personality",
                quote: "The moment you mind who you are, you can see just what kind of things you bought till this day",
                descriptions: ["Now, please look around yourself.. Things you have now speak something to you in your head. And now, you know who you really are."],
                image: ReviewSpending,
        },
        {
                title: "Clarify Your Budget, Clarify Your Result",
                quote: "When was the last time you overspent your money? No one warns you before you realized you wasted it.",
                descriptions: ["One thing you can ask yourself now is, 'have I completely sure to myself when wanting something that will makes me become even more productive?'. If you have the answer, you'll realized you're even doubting your own answer."],
                image: ClarifyBudget,
        },
        {
                title: "Knowing Your Habits, Knowing Your Problems",
                quote: "What things you bought this week? You'd know items you bought this year if you use this app",
                descriptions: ["Money is something we need to look out before it disappears before us. We're oftenly, if not always, forgot about our spending and it must be irritates us."],
                image: KnowingHabit,
        },
];

export const appear_time_each_reason_card = 20;