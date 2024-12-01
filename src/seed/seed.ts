import dbConnect, { pool } from "@/lib/db";

export default async function seedDatabase() {
  try {
    await dbConnect();
    await pool.query("BEGIN");

    await pool.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;

      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      DROP TABLE IF EXISTS "drafts" CASCADE;
      DROP TABLE IF EXISTS "entries" CASCADE;
      DROP TABLE IF EXISTS "collections" CASCADE;
      DROP TABLE IF EXISTS "users" CASCADE;

      CREATE OR REPLACE FUNCTION update_modified_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW."updatedAt" = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TABLE IF NOT EXISTS "users" (
          "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
          "clerkId" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "name" TEXT,
          "imageUrl" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );

      CREATE TRIGGER update_users_modtime
      BEFORE UPDATE ON "users"
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();

      CREATE TABLE IF NOT EXISTS "collections" (
          "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
          "name" TEXT NOT NULL,
          "description" TEXT,
          "coverImage" TEXT,
          "userId" UUID NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
      );

      CREATE TRIGGER update_collections_modtime
      BEFORE UPDATE ON "collections"
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();

      CREATE TABLE IF NOT EXISTS "entries" (
          "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
          "title" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "mood" TEXT NOT NULL,
          "moodScore" INTEGER NOT NULL,
          "moodImageUrl" TEXT,
          "collectionId" UUID,
          "userId" UUID NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
      );

      CREATE TRIGGER update_entries_modtime
      BEFORE UPDATE ON "entries"
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();

      CREATE TABLE IF NOT EXISTS "drafts" (
          "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
          "title" TEXT,
          "content" TEXT,
          "mood" TEXT,
          "userId" UUID NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
      );

      CREATE TRIGGER update_drafts_modtime
      BEFORE UPDATE ON "drafts"
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();

      CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");
      CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
      CREATE UNIQUE INDEX "collections_name_userId_key" ON "collections"("name", "userId");
      CREATE UNIQUE INDEX "drafts_userId_key" ON "drafts"("userId");

      ALTER TABLE "collections" ADD CONSTRAINT "collections_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;

      ALTER TABLE "entries" ADD CONSTRAINT "entries_collectionId_fkey" 
      FOREIGN KEY ("collectionId") REFERENCES "collections"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE;

      ALTER TABLE "entries" ADD CONSTRAINT "entries_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;

      ALTER TABLE "drafts" ADD CONSTRAINT "drafts_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    await pool.query(`
      INSERT INTO "users" ("clerkId", "email", "name", "imageUrl") VALUES
      ('clerk_1', 'aayushmaan.soni54@gmail.com', 'Aayushmaan-1', 'https://gravatar.com/avatar/9f619373888ea9c61c3b9d6c4a953d6e?s=400&d=robohash&r=x'),
      ('clerk_2', 'aayushmaansoni784@gmail.com', 'Aayushmaan-2', 'https://gravatar.com/avatar/3a39eddc299555b2019b8db71e78b668?s=400&d=robohash&r=x')
      ON CONFLICT ("clerkId") DO NOTHING;
    `);
    
    await pool.query(`
      INSERT INTO "collections" ("name", "description", "userId") VALUES
      ('Work', 'Work-related entries', (SELECT "id" FROM "users" WHERE "clerkId" = 'clerk_1')),
      ('Personal', 'Personal thoughts', (SELECT "id" FROM "users" WHERE "clerkId" = 'clerk_2'))
      ON CONFLICT ("name", "userId") DO NOTHING;
    `);
    
    await pool.query(`
      INSERT INTO "entries" ("id", "title", "content", "mood", "moodScore", "moodImageUrl", "collectionId", "userId")
      VALUES 
        (uuid_generate_v4(), 'Meeting Notes', 'Discussed project updates...', 'happy', 8, 'https://cdn.pixabay.com/photo/2014/12/16/22/25/sunset-570881_1280.jpg', (SELECT "id" FROM "collections" WHERE "name" = 'Work'), (SELECT "id" FROM "users" WHERE "clerkId" = 'clerk_1')),
        (uuid_generate_v4(), 'Weekend Plan', 'Planning a trip...', 'excited', 9, 'https://cdn.pixabay.com/photo/2016/03/05/22/52/joy-1239381_640.jpg', (SELECT "id" FROM "collections" WHERE "name" = 'Personal'), (SELECT "id" FROM "users" WHERE "clerkId" = 'clerk_2'))
      ON CONFLICT DO NOTHING;
    `);

    await pool.query("COMMIT");
    console.log('Database seeded successfully');
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error('Error seeding database:', error);
    throw error;
  }
}

seedDatabase();