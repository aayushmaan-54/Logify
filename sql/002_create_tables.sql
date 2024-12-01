-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically update modified timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Trigger for users table
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Collections table
CREATE TABLE "collections" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- Trigger for collections table
CREATE TRIGGER update_collections_modtime
BEFORE UPDATE ON "collections"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Entries table
CREATE TABLE "entries" (
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

-- Trigger for entries table
CREATE TRIGGER update_entries_modtime
BEFORE UPDATE ON "entries"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Drafts table
CREATE TABLE "drafts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" TEXT,
    "content" TEXT,
    "mood" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
);

-- Trigger for drafts table
CREATE TRIGGER update_drafts_modtime
BEFORE UPDATE ON "drafts"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- UNIQUE INDEXES
-- Unique index for users
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
-- Unique index for collections (prevent duplicate collection names for a user)
CREATE UNIQUE INDEX "collections_name_userId_key" ON "collections"("name", "userId");

-- Unique index for drafts (optional, depends on your requirement)
CREATE UNIQUE INDEX "drafts_userId_key" ON "drafts"("userId");

-- FOREIGN KEY CONSTRAINTS
-- Foreign key from collections to users
ALTER TABLE "collections" ADD CONSTRAINT "collections_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign key from entries to collections (nullable)
ALTER TABLE "entries" ADD CONSTRAINT "entries_collectionId_fkey" 
FOREIGN KEY ("collectionId") REFERENCES "collections"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign key from entries to users
ALTER TABLE "entries" ADD CONSTRAINT "entries_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign key from drafts to users
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;