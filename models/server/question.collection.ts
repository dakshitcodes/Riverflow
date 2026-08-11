import { Permission, DatabasesIndexType, OrderBy } from "node-appwrite";
import { db, questionCollection } from "../name";
import { databases } from "./config";

export default async function createQuestionCollection() {
    // create collection
    await databases.createCollection(db, questionCollection, questionCollection, [
        Permission.read("any"),
        Permission.read("users"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
    ]);
    console.log("Question collection is created");

    // creating attributes
    await Promise.all([
        databases.createStringAttribute(db, questionCollection, "title", 100, true),
        databases.createStringAttribute(db, questionCollection, "content", 10000, true),
        databases.createStringAttribute(db, questionCollection, "authorId", 50, true),
        databases.createStringAttribute(db, questionCollection, "tags", 50, true, undefined, true),
        databases.createStringAttribute(db, questionCollection, "attachmentId", 50, false),
    ]);
    console.log("Question Attributes created");

    // Wait for attributes to become ready (as Appwrite creates them asynchronously)
    console.log("Waiting for question attributes to be ready...");
    let allReady = false;
    while (!allReady) {
        try {
            const col = await databases.getCollection(db, questionCollection);
            const requiredKeys = ["title", "content", "authorId", "tags", "attachmentId"];
            allReady = requiredKeys.every(key => {
                const attr = col.attributes.find((a: any) => a.key === key);
                return attr && attr.status === "available";
            });
        } catch (error) {
            console.error("Error checking attributes readiness:", error);
        }
        if (!allReady) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    console.log("Question attributes are ready! Creating indexes...");

    // create Indexes
    try {
        await Promise.all([
            databases.createIndex(
                db,
                questionCollection,
                "title",
                DatabasesIndexType.Fulltext,
                ["title"],
                [OrderBy.Asc]
            ),
            databases.createIndex(
                db,
                questionCollection,
                "content",
                DatabasesIndexType.Fulltext,
                ["content"],
                [OrderBy.Asc]
            ),
        ]);
        console.log("Question Indexes created");
    } catch (error) {
        console.error("Error creating indexes:", error);
    }
}