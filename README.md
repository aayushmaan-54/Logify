# Logify📝: Journal App

# Features:


# Tech Stack
- **Next.js**: Frontend/Backend
- **PostgreSQL + pg**: Database
- **shadcn/ui**: Component Library
- **Tailwind CSS**: 
- **clerk**: 
- **arcjet**: 
- **pg**: 
- **zod**: 
- **react-hook-form**: 
- **react-quill-new**: 
- **recharts**: 
- **lucide-react**: 
- **react-spinners**: 

# Database Schema
## Users Table (`users`):
- **id** (UUID, PK, default `uuid_generate_v4()`): Unique identifier for each user.
- **clerkId** (TEXT, unique): Unique identifier for the user in the clerk system.
- **email** (TEXT, unique): User's email address.
- **name** (TEXT, optional): User's name.
- **imageUrl** (TEXT, optional): URL to the user's profile image.
- **createdAt** (TIMESTAMP, default `CURRENT_TIMESTAMP`): Timestamp when the user was created.
- **updatedAt** (TIMESTAMP): Timestamp when the user was last updated.
- **collections** (FK): References `collections` table (`userId`).
- **entries** (FK): References `entries` table (`userId`).
- **drafts** (FK, optional): References `drafts` table (`userId`).

## Collections Table (`collections`):
- **id** (UUID, PK, default `uuid_generate_v4()`): Unique identifier for each collection.
- **name** (TEXT): Name of the collection.
- **description** (TEXT, optional): Description of the collection.
- **userId** (UUID, FK): References `users.id`, on delete cascade.
- **createdAt** (TIMESTAMP, default `CURRENT_TIMESTAMP`): Timestamp when the collection was created.
- **updatedAt** (TIMESTAMP): Timestamp when the collection was last updated.
- **entries** (FK): References `entries` table (`collectionId`).

## Entries Table (`entries`):
- **id** (UUID, PK, default `uuid_generate_v4()`): Unique identifier for each entry.
- **title** (TEXT): Title of the journal entry.
- **content** (TEXT): Content of the journal entry.
- **mood** (TEXT): Mood associated with the entry.
- **moodScore** (INTEGER): Numerical mood score.
- **moodImageUrl** (TEXT, optional): URL to an image representing the mood.
- **collectionId** (UUID, optional, FK): References `collections.id`, on delete set null.
- **userId** (UUID, FK): References `users.id`, on delete cascade.
- **createdAt** (TIMESTAMP, default `CURRENT_TIMESTAMP`): Timestamp when the entry was created.
- **updatedAt** (TIMESTAMP): Timestamp when the entry was last updated.

## Drafts Table (`drafts`):
- **id** (UUID, PK, default `uuid_generate_v4()`): Unique identifier for each draft.
- **title** (TEXT, optional): Title of the draft.
- **content** (TEXT, optional): Content of the draft.
- **mood** (TEXT, optional): Mood associated with the draft.
- **userId** (UUID, FK): References `users.id`, on delete cascade.
- **createdAt** (TIMESTAMP, default `CURRENT_TIMESTAMP`): Timestamp when the draft was created.
- **updatedAt** (TIMESTAMP): Timestamp when the draft was last updated.

---

### Notes:
- **Triggers and Functions**: 
  - Triggers are set up to automatically update the `updatedAt` timestamp whenever a record is updated in `users`, `collections`, `entries`, or `drafts` tables.
  
- **Foreign Key Constraints**:
  - `collections` references `users` through `userId`.
  - `entries` references both `users` and `collections` through `userId` and `collectionId`.
  - `drafts` references `users` through `userId`.

- **Unique Indexes**:
  - Unique indexes are created for `clerkId` and `email` in the `users` table to ensure no duplicates.
  - Unique index on `name` and `userId` in the `collections` table to avoid duplicate collection names per user.