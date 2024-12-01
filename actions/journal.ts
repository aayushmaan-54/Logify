"use server";
import { pool } from "@/lib/db";
import { getMoodById, MOODS } from "@/lib/mood";
import { auth } from "@clerk/nextjs/server";
import { getPixabayImage } from "./publicApi";
import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import aj from "@/lib/arcjet";

interface MoodData {
  id: string;
  label: string;
  emoji: string;
  score: number;
  color: string;
  prompt: string;
  pixabayQuery: string;
}

export interface Entry {
  id: string;
  title: string;
  content: string;
  mood: string;
  moodScore: number;
  moodImageUrl: string;
  collectionId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  moodData?: MoodData;
}

interface CreateJournalEntryData {
  mood: string;
  moodQuery: { query: string };
  title: string;
  content: string;
  collectionId?: number | null;
}

interface getJournalEntries {
  collectionId?: null | undefined | string;
  orderBy?: "ASC" | "DESC";
}

export interface EntriesData {
  success: boolean;
  data?: {
    entries: Entry[];
  };
  message?: string;
}

interface GetJournalEntriesParams {
  collectionId?: string | null;
  orderBy?: "ASC" | "DESC";
}

type Collection = {
  id: string;
  name: string;
  description: string;
  coverImage: string | null;
};

type EntryData = {
  id: string;
  title: string;
  content: string;
  mood: string;
  moodScore: number;
  moodImageUrl: string;
  collectionId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  coverImage: string | null;
  collection: Collection;
};



export async function createJournalEntry(data: CreateJournalEntryData) {
  try {
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
      'SELECT * FROM "users" WHERE "clerkId" = $1',
      [userId]
    );

    if (userResult.rows.length === 0) throw new Error("User not found!");
    const user = userResult.rows[0];

    const mood = MOODS[data.mood.toUpperCase()];
    if (!mood) throw new Error("Invalid Mood!");

    const moodImageUrl = await getPixabayImage(data.moodQuery);

    const entry = await pool.query(
      `INSERT INTO "entries" ("title", "content", "mood", "moodScore", "moodImageUrl", "collectionId", "userId")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.title,
        data.content,
        mood.id,
        mood.score,
        moodImageUrl,
        data.collectionId ?? null,
        user.id,
      ]
    );

    await pool.query(
      `DELETE FROM "drafts"
      WHERE "userId" = $1;`,
      [user.id]
    );

    revalidatePath('/dashboard');

    return entry.rows[0];
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



export async function getJournalEntries({
  collectionId,
  orderBy = "DESC",
}: GetJournalEntriesParams = {}): Promise<EntriesData> {
  try {
    collectionId = collectionId === "unorganized" ? null : collectionId || "";

    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized!");

    const userResult = await pool.query(
      'SELECT * FROM "users" WHERE "clerkId" = $1',
      [userId]
    );

    if (userResult.rows.length === 0) throw new Error("User not found!");
    const user = userResult.rows[0];

    if (!["ASC", "DESC"].includes(orderBy)) {
      throw new Error("Invalid order by value!");
    }

    const entriesResult = await pool.query(
      `
      SELECT * FROM "entries" 
      WHERE "userId" = $1 
      ${collectionId ? 'AND "collectionId" = $2' : ""}
      ORDER BY "createdAt" ${orderBy}
    `,
      collectionId ? [user.id, collectionId] : [user.id]
    );

    const entriesWithMoodData = entriesResult.rows.map((entry) => ({
      ...entry,
      moodData: getMoodById(entry.mood),
    }));

    return {
      success: true,
      data: {
        entries: entriesWithMoodData,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}




export async function getJournalEntry(id: string): Promise<EntryData> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized!");

    const userResult = await pool.query(
      'SELECT * FROM "users" WHERE "clerkId" = $1',
      [userId]
    );
    if (userResult.rows.length === 0) throw new Error("User not found!");
    const user = userResult.rows[0];

    const entriesResult = await pool.query(
      `SELECT e.*, c.* 
       FROM "entries" e
       LEFT JOIN "collections" c ON e."collectionId" = c."id"
       WHERE e."userId" = $1 AND e."id" = $2`,
      [user.id, id]
    );
    
    if (entriesResult.rows.length === 0) throw new Error('Entry not found!');
    
    const entry = entriesResult.rows[0];

    return {
      ...entry,
      collection: entry.collectionId ? {
        id: entry.collectionId,
        name: entry.name,
        description: entry.description,
        coverImage: entry.coverImage,
      } : null,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
}



export async function deleteJournalEntry(id: string): Promise<Entry | Error> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized!");

    const userResult = await pool.query(
      'SELECT "id" FROM "users" WHERE "clerkId" = $1',
      [userId]
    );
    if (userResult.rows.length === 0) throw new Error("User not found!");
    const dbUserId = userResult.rows[0].id;

    const entryResult = await pool.query(
      `SELECT * FROM "entries" WHERE "userId" = $1 AND "id" = $2`,
      [dbUserId, id]
    );

    if (entryResult.rows.length === 0) throw new Error("Entry not found!");

    const entry = entryResult.rows[0];

    await pool.query(
      `DELETE FROM "entries" WHERE "id" = $1 AND "userId" = $2`,
      [id, dbUserId]
    );

    return entry;
  } catch (error) {
    console.error(error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred");
  }
}



export async function updateJournalEntry(data: {
  id: string;
  title: string;
  content: string;
  mood: string;
  moodQuery: string;
  collectionId: string | null;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized!");

    const userResult = await pool.query(
      'SELECT "id" FROM "users" WHERE "clerkId" = $1',
      [userId]
    );
    if (userResult.rows.length === 0) throw new Error("User not found!");
    const dbUserId = userResult.rows[0].id;

    const existingEntryResult = await pool.query(
      `SELECT * FROM "entries" WHERE "userId" = $1 AND "id" = $2`,
      [dbUserId, data.id]
    );
    const existingEntry = existingEntryResult.rows[0];

    if (!existingEntry) throw new Error("Entry not found");

    const mood = MOODS[data.mood.toUpperCase()];
    if (!mood) throw new Error("Invalid mood");

    let moodImageUrl = existingEntry.moodImageUrl;
    if (existingEntry.mood !== mood.id) {
      moodImageUrl = await getPixabayImage({ query: data.moodQuery });
    }

    const updatedEntryResult = await pool.query(
      `UPDATE "entries" SET
        "title" = $1,
        "content" = $2,
        "mood" = $3,
        "moodScore" = $4,
        "moodImageUrl" = $5,
        "collectionId" = $6,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $7 AND "userId" = $8
      RETURNING *`,
      [
        data.title,
        data.content,
        mood.id,
        mood.score,
        moodImageUrl,
        data.collectionId || null,
        data.id,
        dbUserId
      ]
    );

    const updatedEntry = updatedEntryResult.rows[0];

    revalidatePath("/dashboard");
    revalidatePath(`/journal/${data.id}`);

    return updatedEntry;

  } catch (error) {
    console.error(error);
    throw new Error("Error updating journal entry");
  }
}



export async function getDraft() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const userResult = await pool.query(
      'SELECT "id" FROM "users" WHERE "clerkId" = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }
    const userIdFromDb = userResult.rows[0].id;

    const draftResult = await pool.query(
      'SELECT * FROM "drafts" WHERE "userId" = $1',
      [userIdFromDb]
    );

    if (draftResult.rows.length === 0) {
      return { success: true, data: null };
    }

    const draft = draftResult.rows[0];
    return { success: true, data: draft };
  } catch (error: unknown) {
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}



export async function saveDraft(data: { title: string; content: string; mood: string }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const userResult = await pool.query('SELECT "id" FROM "users" WHERE "clerkId" = $1', [userId]);
    if (userResult.rows.length === 0) throw new Error("User not found");

    const userIdFromDb = userResult.rows[0].id;
    const draftResult = await pool.query('SELECT * FROM "drafts" WHERE "userId" = $1', [userIdFromDb]);
    const currentTimestamp = new Date().toISOString();

    let draft;
    if (draftResult.rows.length === 0) {
      draft = await pool.query(
        `INSERT INTO "drafts" ("title", "content", "mood", "userId", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [data.title, data.content, data.mood, userIdFromDb, currentTimestamp, currentTimestamp]
      );
    } else {
      draft = await pool.query(
        `UPDATE "drafts"
         SET "title" = $1, "content" = $2, "mood" = $3, "updatedAt" = $4
         WHERE "userId" = $5
         RETURNING *`,
        [data.title, data.content, data.mood, currentTimestamp, userIdFromDb]
      );
    }

    revalidatePath("/dashboard");

    return { success: true, data: draft.rows[0] };
  } catch (error) {
    console.error("Error saving draft:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}