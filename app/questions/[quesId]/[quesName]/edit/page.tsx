import { db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import React from "react";
import EditQues from "./EditQues";
// 1. Import the exact same type used by EditQues
import { QuestionDocument } from "@/components/QuestionForm"; 

const Page = async ({ params: paramsPromise }: { params: Promise<{ quesId: string; quesName: string }> }) => {
    const params = await paramsPromise;
    const question = await databases.getDocument(db, questionCollection, params.quesId);

    return (
        // 2. Cast it safely so TypeScript knows this specific document matches the schema
        <EditQues question={question as unknown as QuestionDocument} />
    );
};

export default Page;