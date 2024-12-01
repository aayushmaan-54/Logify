import { currentUser } from "@clerk/nextjs/server"
import { pool } from "./db";


export const clerkUserSyncDB = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const existingUserResult = await pool.query(
      'SELECT * FROM "users" WHERE "clerkId" = $1',
      [user.id]
    );

    if (existingUserResult.rows.length > 0) {
      return existingUserResult.rows[0];
    }

    const newUserResult = await pool.query(
      `INSERT INTO "users" ("clerkId", "email", "name", "imageUrl", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        user.id,
        user.emailAddresses[0]?.emailAddress || '',
        user.fullName || user.firstName || '',
        user.imageUrl
      ]
    );
    return newUserResult.rows[0];
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error syncing user:', err.message);
    } else {
      console.error("Unknown error:", err);
    }
    return null;
  }
}