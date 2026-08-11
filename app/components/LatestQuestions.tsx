import QuestionCard from "@/components/QuestionCard";
import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Query, Models } from "node-appwrite";
import React from "react";

// 1. Made authorId optional (?) so TypeScript stops complaining about missing keys from raw Appwrite spreads
export type QuestionCardDocument = Models.Document & {
    title: string;
    tags: string[];
    authorId?: string; // 👈 Marked optional
    totalAnswers: number;
    totalVotes: number;
    author: {
        $id: string;
        reputation: number;
        name: string;
    };
};

const LatestQuestions = async () => {
    const questions = await databases.listDocuments(db, questionCollection, [
        Query.limit(5),
        Query.orderDesc("$createdAt"),
    ]);

    const processedQuestions: QuestionCardDocument[] = await Promise.all(
        questions.documents.map(async (ques) => {
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
                authorId: ques.authorId || "", // 👈 Explicit fallback assignment satisfies strict checking
                title: ques.title || "Untitled Question", 
                tags: ques.tags || [],
                totalAnswers: answers.total,
                totalVotes: votes.total,
                author: {
                    $id: author.$id,
                    reputation: author.prefs?.reputation ?? 0, 
                    name: author.name,
                },
            } as QuestionCardDocument;
        })
    );

    return (
        <div className="space-y-6">
            {processedQuestions.map((question) => (
                <QuestionCard key={question.$id} ques={question} />
            ))}
        </div>
    );
};

export default LatestQuestions;