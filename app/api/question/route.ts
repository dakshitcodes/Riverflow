import { answerCollection, commentCollection, db, questionAttachmentBucket, questionCollection, voteCollection } from "@/models/name";
import { databases, storage, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function DELETE(request: NextRequest) {
    try {
        const { questionId } = await request.json();

        // Fetch the question first
        const question = await databases.getDocument(db, questionCollection, questionId);

        // 1. Delete all votes on the question
        const questionVotes = await databases.listDocuments(db, voteCollection, [
            Query.equal("type", "question"),
            Query.equal("typeId", questionId),
            Query.limit(500),
        ]);
        await Promise.all(
            questionVotes.documents.map(v => databases.deleteDocument(db, voteCollection, v.$id))
        );

        // 2. Delete all comments on the question
        const questionComments = await databases.listDocuments(db, commentCollection, [
            Query.equal("type", "question"),
            Query.equal("typeId", questionId),
            Query.limit(500),
        ]);
        await Promise.all(
            questionComments.documents.map(c => databases.deleteDocument(db, commentCollection, c.$id))
        );

        // 3. Delete all answers (and their votes + comments) on the question
        const answers = await databases.listDocuments(db, answerCollection, [
            Query.equal("questionId", questionId),
            Query.limit(500),
        ]);

        await Promise.all(
            answers.documents.map(async answer => {
                // Delete answer votes
                const answerVotes = await databases.listDocuments(db, voteCollection, [
                    Query.equal("type", "answer"),
                    Query.equal("typeId", answer.$id),
                    Query.limit(500),
                ]);
                await Promise.all(
                    answerVotes.documents.map(v => databases.deleteDocument(db, voteCollection, v.$id))
                );

                // Delete answer comments
                const answerComments = await databases.listDocuments(db, commentCollection, [
                    Query.equal("type", "answer"),
                    Query.equal("typeId", answer.$id),
                    Query.limit(500),
                ]);
                await Promise.all(
                    answerComments.documents.map(c => databases.deleteDocument(db, commentCollection, c.$id))
                );

                // Decrease answer author reputation
                const prefs = await users.getPrefs<UserPrefs>(answer.authorId);
                await users.updatePrefs<UserPrefs>(answer.authorId, {
                    reputation: Math.max(0, Number(prefs.reputation) - 1),
                });

                return databases.deleteDocument(db, answerCollection, answer.$id);
            })
        );

        // 4. Delete the attachment from storage (if it exists)
        if (question.attachmentId) {
            try {
                await storage.deleteFile(questionAttachmentBucket, question.attachmentId);
            } catch {
                // Attachment may not exist — ignore
            }
        }

        // 5. Delete the question document itself
        await databases.deleteDocument(db, questionCollection, questionId);

        return NextResponse.json({ message: "Question deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || "Error deleting the question" },
            { status: error?.status || error?.code || 500 }
        );
    }
}
