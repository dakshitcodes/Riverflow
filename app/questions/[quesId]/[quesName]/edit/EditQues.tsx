"use client";

import QuestionForm from "@/components/QuestionForm";
// 1. Import the exact type that QuestionForm expects. 
// (Adjust this import path if QuestionDocument is exported from somewhere else, like "@/types")
import { QuestionDocument } from "@/components/QuestionForm"; 
import { useAuthStore } from "@/store/Auth";
import slugify from "@/utils/slugify";
import { useRouter } from "next/navigation";
import React from "react";

// 2. Type your prop using the exact strict interface your form requires
type EditQuestionProps = {
    question: QuestionDocument;
};

const EditQues = ({ question }: EditQuestionProps) => {
    const { user } = useAuthStore();
    const router = useRouter();

    React.useEffect(() => {
        if (question.authorId !== user?.$id) {
            router.push(`/questions/${question.$id}/${slugify(question.title)}`);
        }
    }, [question, user, router]);

    if (user?.$id !== question.authorId) return null;

    return (
        <div className="block pb-20 pt-32">
            <div className="container mx-auto px-4">
                <h1 className="mb-10 mt-4 text-2xl">Edit your public question</h1>

                <div className="flex flex-wrap md:flex-row-reverse">
                    <div className="w-full md:w-1/3"></div>
                    <div className="w-full md:w-2/3">
                        {/* ✅ Perfectly types matched, no more errors! */}
                        <QuestionForm question={question} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditQues;