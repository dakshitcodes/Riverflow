import Pagination from "@/components/Pagination";
import QuestionCard from "@/components/QuestionCard";
import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Query, Models } from "node-appwrite"; // ✅ Imported Models
import React from "react";
// ✅ 1. Import the expected prop type directly from QuestionCard
import { QuestionCardDocument } from "@/components/QuestionCard";

const Page = async ({
    params: paramsPromise,
    searchParams: searchParamsPromise,
}: {
    params: Promise<{ userId: string; userSlug: string }>;
    searchParams: Promise<{ page?: string }>;
}) => {
    const params = await paramsPromise;
    const searchParams = await searchParamsPromise;
    const currentPage = searchParams.page || "1";

    const queries = [
        Query.equal("authorId", params.userId),
        Query.orderDesc("$createdAt"),
        Query.offset((+currentPage - 1) * 25),
        Query.limit(25),
    ];

    const questions = await databases.listDocuments(db, questionCollection, queries);

    // ✅ 2. Map into an independent, explicitly typed array variable
    const processedDocuments: QuestionCardDocument[] = await Promise.all(
        questions.documents.map(async doc => {
            // Explicitly assert the shape for iteration processing
            const ques = doc as unknown as Models.Document & { authorId: string };

            const [author, answers, votes] = await Promise.all([
                users.get<UserPrefs>(ques.authorId),
                databases.listDocuments(db, answerCollection, [
                    Query.equal("questionId", ques.$id),
                    Query.limit(1),
                ]),
                databases.listDocuments(db, voteCollection, [
                    Query.equal("type", "question"),
                    Query.equal("typeId", ques.$id),
                    Query.limit(1),
                ]),
            ]);

            return {
                ...ques,
                totalAnswers: answers.total,
                totalVotes: votes.total,
                author: {
                    $id: author.$id,
                    reputation: author.prefs?.reputation ?? 0, // Fallback safety check
                    name: author.name,
                },
            } as unknown as QuestionCardDocument; // ✅ Force precise matching structure
        })
    );

    return (
        <div className="px-4">
            <div className="mb-4">
                <p>{questions.total} questions</p>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {/* ✅ 3. Render directly using your cleanly typed processed array */}
                {processedDocuments.map(ques => (
                    <QuestionCard key={ques.$id} ques={ques} />
                ))}
            </div>
            <Pagination total={questions.total} limit={25} />
        </div>
    );
};

export default Page;