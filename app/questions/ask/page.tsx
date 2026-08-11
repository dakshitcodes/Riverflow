import QuestionForm from "@/components/QuestionForm";
import React from "react";

const Page = () => {
    return (
        <div className="block pb-20 pt-32">
            <div className="container mx-auto max-w-3xl px-4">
                <h1 className="mb-10 text-3xl font-bold">Ask a public question</h1>
                <QuestionForm />
            </div>
        </div>
    );
};

export default Page;
