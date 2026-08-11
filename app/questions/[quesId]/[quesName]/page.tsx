import Answers from "@/components/Answers";
import Comments from "@/components/Comments";
import { MarkdownPreview } from "@/components/RTE";
import VoteButtons from "@/components/VoteButtons";
import Particles from "@/components/magicui/particles";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { avatars } from "@/models/client/config";
import {
    answerCollection,
    db,
    voteCollection,
    questionCollection,
    commentCollection,
    questionAttachmentBucket,
} from "@/models/name";
import { databases, users } from "@/models/server/config";
import { storage } from "@/models/client/config";
import { UserPrefs } from "@/store/Auth";
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import { IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import { Query, Models } from "node-appwrite";
import React from "react";
import DeleteQuestion from "./DeleteQuestion";
import EditQuestion from "./EditQuestion";
import { TracingBeam } from "@/components/ui/tracing-beam";

// ✅ 1. Import the exact, strict types your components are expecting
import { AnswerDocument } from "@/components/Answers";
import { CommentDocument } from "@/components/Comments";

type SchemaQuestion = Models.Document & {
    title: string;
    content: string;
    tags: string[];
    authorId: string;
    attachmentId: string;
};

const Page = async ({ params: paramsPromise }: { params: Promise<{ quesId: string; quesName: string }> }) => {
    const params = await paramsPromise;
    const [rawQuestion, rawAnswers, upvotes, downvotes, rawComments] = await Promise.all([
        databases.getDocument(db, questionCollection, params.quesId),
        databases.listDocuments(db, answerCollection, [
            Query.orderDesc("$createdAt"),
            Query.equal("questionId", params.quesId),
        ]),
        databases.listDocuments(db, voteCollection, [
            Query.equal("typeId", params.quesId),
            Query.equal("type", "question"),
            Query.equal("voteStatus", "upvoted"),
            Query.limit(1),
        ]),
        databases.listDocuments(db, voteCollection, [
            Query.equal("typeId", params.quesId),
            Query.equal("type", "question"),
            Query.equal("voteStatus", "downvoted"),
            Query.limit(1),
        ]),
        databases.listDocuments(db, commentCollection, [
            Query.equal("type", "question"),
            Query.equal("typeId", params.quesId),
            Query.orderDesc("$createdAt"),
        ]),
    ]);

    const question = rawQuestion as unknown as SchemaQuestion;
    const author = await users.get<UserPrefs>(question.authorId);

    // ✅ 2. Cast objects to the component's imported exact structures
    const processedCommentsDocuments = await Promise.all(
        rawComments.documents.map(async comment => {
            const commentAuthor = await users.get<UserPrefs>(comment.authorId);
            return {
                ...comment,
                content: comment.content || "",
                authorId: comment.authorId,
                type: (comment.type as "question" | "answer") || "question", // Typecasted literal match
                typeId: comment.typeId || params.quesId,
                author: {
                    $id: commentAuthor.$id,
                    name: commentAuthor.name,
                    reputation: commentAuthor.prefs?.reputation ?? 0,
                },
            } as unknown as CommentDocument;
        })
    );

    const processedAnswersDocuments = await Promise.all(
        rawAnswers.documents.map(async answer => {
            const [answerAuthor, answerComments, answerUpvotes, answerDownvotes] = await Promise.all([
                users.get<UserPrefs>(answer.authorId),
                databases.listDocuments(db, commentCollection, [
                    Query.equal("typeId", answer.$id),
                    Query.equal("type", "answer"),
                    Query.orderDesc("$createdAt"),
                ]),
                databases.listDocuments(db, voteCollection, [
                    Query.equal("typeId", answer.$id),
                    Query.equal("type", "answer"),
                    Query.equal("voteStatus", "upvoted"),
                    Query.limit(1),
                ]),
                databases.listDocuments(db, voteCollection, [
                    Query.equal("typeId", answer.$id),
                    Query.equal("type", "answer"),
                    Query.equal("voteStatus", "downvoted"),
                    Query.limit(1),
                ]),
            ]);

            const processedAnswerCommentsDocuments = await Promise.all(
                answerComments.documents.map(async ac => {
                    const acAuthor = await users.get<UserPrefs>(ac.authorId);
                    return {
                        ...ac,
                        content: ac.content || "",
                        authorId: ac.authorId,
                        type: (ac.type as "question" | "answer") || "answer", // Typecasted literal match
                        typeId: ac.typeId || answer.$id,
                        author: {
                            $id: acAuthor.$id,
                            name: acAuthor.name,
                            reputation: acAuthor.prefs?.reputation ?? 0,
                        },
                    } as unknown as CommentDocument;
                })
            );

            return {
                ...answer,
                content: answer.content || "",
                questionId: answer.questionId || params.quesId,
                authorId: answer.authorId,
                comments: {
                    ...answerComments,
                    documents: processedAnswerCommentsDocuments,
                },
                upvotesDocuments: answerUpvotes,
                downvotesDocuments: answerDownvotes,
                author: {
                    $id: answerAuthor.$id,
                    name: answerAuthor.name,
                    reputation: answerAuthor.prefs?.reputation ?? 0,
                },
            } as unknown as AnswerDocument;
        })
    );

    // ✅ 3. Double-cast wrapper list blocks directly to match expected component shapes perfectly
    const comments = { 
        ...rawComments, 
        documents: processedCommentsDocuments 
    } as unknown as any;
    
    const answers = { 
        ...rawAnswers, 
        documents: processedAnswersDocuments 
    } as unknown as any;

    // ✅ 4. Fix getFilePreview variance to use getFileView
    const previewFile = storage.getFileView(questionAttachmentBucket, question.attachmentId);
    const previewSrc = typeof previewFile === "string" ? previewFile : String(previewFile || "");
    console.log("Generated URL:", previewSrc);

    // Clean empty image markdown tags ![]() or ![image]() to avoid browser errors
    const displayQuestionContent = question.content?.replace(/!\[.*?\]\(\s*\)/g, "") || "";

    // Convert complex Appwrite structures to plain JSON objects to prevent Next.js RSC serialization issues
    const cleanUpvotes = JSON.parse(JSON.stringify(upvotes));
    const cleanDownvotes = JSON.parse(JSON.stringify(downvotes));
    const cleanComments = JSON.parse(JSON.stringify(comments));
    const cleanAnswers = JSON.parse(JSON.stringify(answers));

    return (
        <TracingBeam className="container pl-6">
            <Particles
                className="fixed inset-0 h-full w-full"
                quantity={500}
                ease={100}
                color="#ffffff"
                refresh
            />
            <div className="relative mx-auto px-4 pb-20 pt-36">
                <div className="flex">
                    <div className="w-full">
                        <h1 className="mb-1 text-3xl font-bold">{question.title}</h1>
                        <div className="flex gap-4 text-sm">
                            <span>
                                Asked {convertDateToRelativeTime(new Date(question.$createdAt))}
                            </span>
                            <span>Answer {answers.total}</span>
                            <span>Votes {upvotes.total + downvotes.total}</span>
                        </div>
                    </div>
                    <Link href="/questions/ask" className="ml-auto inline-block shrink-0">
                        <ShimmerButton className="shadow-2xl">
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                                Ask a question
                            </span>
                        </ShimmerButton>
                    </Link>
                </div>
                <hr className="my-4 border-white/40" />
                <div className="flex gap-4">
                    <div className="flex shrink-0 flex-col items-center gap-4">
                        <VoteButtons
                            type="question"
                            id={question.$id}
                            className="w-full"
                            upvotes={cleanUpvotes}
                            downvotes={cleanDownvotes}
                        />
                        <EditQuestion
                            questionId={question.$id}
                            questionTitle={question.title}
                            authorId={question.authorId}
                        />
                        <DeleteQuestion questionId={question.$id} authorId={question.authorId} />
                    </div>
                    <div className="w-full overflow-auto">
                        <MarkdownPreview className="rounded-xl p-4" source={displayQuestionContent} />
                        {previewSrc && (
                            <picture>
                                <img
                                    src={previewSrc}
                                    alt={question.title}
                                    className="mt-3 rounded-lg"
                                />
                            </picture>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                            {question.tags.map((tag: string) => (
                                <Link
                                    key={tag}
                                    href={`/questions?tag=${tag}`}
                                    className="inline-block rounded-lg bg-white/10 px-2 py-0.5 duration-200 hover:bg-white/20"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-1">
                            <picture>
                                <img
                                    src={avatars.getInitials(author.name, 36, 36)}
                                    alt={author.name}
                                    className="rounded-lg"
                                />
                            </picture>
                            <div className="block leading-tight">
                                <Link
                                    href={`/users/${author.$id}/${slugify(author.name)}`}
                                    className="text-orange-500 hover:text-orange-600"
                                >
                                    {author.name}
                                </Link>
                                <p>
                                    <strong>{author.prefs?.reputation ?? 0}</strong>
                                </p>
                            </div>
                        </div>
                        <Comments
                            comments={cleanComments}
                            className="mt-4"
                            type="question"
                            typeId={question.$id}
                        />
                        <hr className="my-4 border-white/40" />
                    </div>
                </div>
                <Answers answers={cleanAnswers} questionId={question.$id} />
            </div>
        </TracingBeam>
    );
};

export default Page;