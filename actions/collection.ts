"use server";
import { Collection } from "@/components/journalForm/JournalForm";
import aj from "@/lib/arcjet";
import dbConnect, { pool } from "@/lib/db";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


export async function createCollection(data: { name: any; description: any; }) {
  try {
    if (!data.name) {
      throw new Error("Collection name is required");
    }

    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized!");

    const req = await request();

    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request Blocked!");
    }

    const userResult = await pool.query(
      'SELECT "id" FROM "users" WHERE "clerkId" = $1',
      [userId]
    );

    if (userResult.rows.length === 0) throw new Error("User not found!");

    const dbUserId = userResult.rows[0].id;

    const collection = await pool.query(
      `INSERT INTO "collections"(name, description, "userId")
      VALUES ($1, $2, $3)
      RETURNING *`,
      [
        data.name,
        data.description || null,
        dbUserId
      ]
    );

    revalidatePath('/dashboard');
    return collection.rows[0];
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return {
        error: true,
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      };
    }
  }
}



export async function getCollections(): Promise<Collection[] | null> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized!");

    const userResult = await pool.query(
      'SELECT "id" FROM "users" WHERE "clerkId" = $1',
      [userId]
    );

    if (userResult.rows.length === 0) throw new Error("User not found!");

    const dbUserId = userResult.rows[0].id;

    const collections = await pool.query(
      `SELECT c.*, 
              COUNT(e."id") AS "entryCount" 
       FROM "collections" c
       LEFT JOIN "entries" e ON c."id" = e."collectionId"
       WHERE c."userId" = $1
       GROUP BY c."id"
       ORDER BY c."createdAt" DESC`,
      [dbUserId]
    );

    return collections.rows;
  } catch (error) {
    console.error(error);
    return null;
  }
}



export async function getCollection(collectionId: string): Promise<Collection[] | null> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized!");

    const userResult = await pool.query(
      'SELECT "id" FROM "users" WHERE "clerkId" = $1',
      [userId]
    );

    if (userResult.rows.length === 0) throw new Error("User not found!");
    const dbUserId = userResult.rows[0].id;

    const collections = await pool.query(
      `SELECT * FROM "collections" WHERE "userId" = $1 AND "id" = $2`,
      [dbUserId, collectionId]
    );

    return collections.rows;
  } catch (error) {
    console.error(error);
    return null;
  }
}



export async function deleteCollection(collectionId: string): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized!");

    const userResult = await pool.query(
      'SELECT "id" FROM "users" WHERE "clerkId" = $1',
      [userId]
    );

    if (userResult.rows.length === 0) throw new Error("User not found!");
    const dbUserId = userResult.rows[0].id;

    const collection = await pool.query(
      `SELECT * FROM "collections" WHERE "userId" = $1 AND "id" = $2`,
      [dbUserId, collectionId]
    );

    if (collection.rows.length === 0) throw new Error("Collection not found!");

    await pool.query(
      `DELETE FROM "collections" WHERE "id" = $1 AND "userId" = $2`,
      [collectionId, dbUserId]
    );

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}