import HeroSection from "@/app/components/HeroSection";
import LatestQuestions from "@/app/components/LatestQuestions";
import TopContributers from "@/app/components/TopContributers";
import React from "react";

export default function Home() {
    return (
        <div className="flex-1 flex flex-col">
            <HeroSection />
            <div className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Latest Questions</h2>
                        <LatestQuestions />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Top Contributors</h2>
                        <TopContributers />
                    </div>
                </div>
            </div>
        </div>
    );
}
