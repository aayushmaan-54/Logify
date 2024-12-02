# Logify 📝: Journal App

---

## Overview  
**Logify** is a feature-rich journal application that allows users to create and manage collections of journals. Users can save drafts, edit entries, and track their mood and activity through an intuitive dashboard. The app focuses on providing a smooth writing experience with a robust editor and data persistence.

---

## Features  
- **Collections & Journals**  
  - Create, edit, and delete collections.  
  - Add journals to collections with the ability to edit and delete entries.  

- **Draft Management**  
  - Save drafts automatically to prevent data loss in case of reloads or failures.  

- **Journal Attributes**  
  - For each journal entry, users can add:  
    - **Title**  
    - **Mood** (text and numeric score)  
    - **Description** with a powerful editor that supports:  
      - Headings  
      - Bold, Italic, Strikethrough  
      - Code blocks  
      - Lists (ordered & unordered)  
      - Hyperlinks  

- **Dashboard**  
  - Overview of total entries and entries per day.  
  - **Mood Insights**:  
    - Average mood score (graded out of 10).  
    - Weekly mood summary in text format.  
    - Graph showing the relationship between average mood and number of entries.

---

## Tech Stack  

- **Frontend/Backend**: [Next.js](https://nextjs.org/)  
- **Database**: PostgreSQL with `pg`  
- **UI Components**: [shadcn/ui](https://ui.shadcn.dev/)  
- **Styling**: Tailwind CSS  
- **Authentication**: Clerk  
- **Utilities**:  
  - **Arcjet**: Custom utility functions for enhanced performance and flexibility.  
  - **Zod**: Type-safe schema validation for form inputs and API data.  
  - **React Hook Form**: Lightweight form management with easy validation and control.  
  - **React Quill (New)**: Rich text editor with advanced formatting options.  
  - **Recharts**: Charting library for creating responsive and customizable graphs.  
  - **Lucide React**: Icon library providing modern and customizable SVG icons.  
  - **React Spinners**: Collection of animated spinners for loading states.  

---

## Database Schema  

### Users Table (`users`)  

| Column       | Type         | Constraints               | Description                              |
|--------------|--------------|---------------------------|------------------------------------------|
| `id`         | UUID         | PK, default `uuid_generate_v4()` | Unique identifier for each user. |
| `clerkId`    | TEXT         | Unique                    | Clerk system user identifier.           |
| `email`      | TEXT         | Unique                    | User's email address.                   |
| `name`       | TEXT         | Optional                  | User's name.                            |
| `imageUrl`   | TEXT         | Optional                  | URL to profile image.                   |
| `createdAt`  | TIMESTAMP    | Default `CURRENT_TIMESTAMP` | User creation timestamp.               |
| `updatedAt`  | TIMESTAMP    | Auto-update via trigger    | Last updated timestamp.                 |
| `collections`| FK           | References `collections.userId` | User’s collections.          |
| `entries`    | FK           | References `entries.userId`     | User’s journal entries.     |
| `drafts`     | FK           | Optional, references `drafts.userId` | User’s drafts.            |

---

### Collections Table (`collections`)  

| Column       | Type         | Constraints               | Description                               |
|--------------|--------------|---------------------------|-------------------------------------------|
| `id`         | UUID         | PK, default `uuid_generate_v4()` | Unique collection identifier.     |
| `name`       | TEXT         | Unique per user            | Collection name.                         |
| `description`| TEXT         | Optional                  | Collection description.                  |
| `userId`     | UUID         | FK, references `users.id`  | Associated user, cascades on delete.     |
| `createdAt`  | TIMESTAMP    | Default `CURRENT_TIMESTAMP` | Creation timestamp.                    |
| `updatedAt`  | TIMESTAMP    | Auto-update via trigger    | Last updated timestamp.                  |
| `entries`    | FK           | References `entries.collectionId` | Collection's journal entries. |

---

### Entries Table (`entries`)  

| Column       | Type         | Constraints               | Description                               |
|--------------|--------------|---------------------------|-------------------------------------------|
| `id`         | UUID         | PK, default `uuid_generate_v4()` | Unique entry identifier.         |
| `title`      | TEXT         |                           | Journal entry title.                     |
| `content`    | TEXT         |                           | Journal content.                         |
| `mood`       | TEXT         |                           | Mood description.                        |
| `moodScore`  | INTEGER      |                           | Numeric mood score.                      |
| `moodImageUrl`| TEXT        | Optional                  | Mood image URL.                          |
| `collectionId`| UUID        | FK, references `collections.id`, on delete set null | Associated collection.    |
| `userId`     | UUID         | FK, references `users.id`  | Associated user, cascades on delete.     |
| `createdAt`  | TIMESTAMP    | Default `CURRENT_TIMESTAMP` | Entry creation timestamp.              |
| `updatedAt`  | TIMESTAMP    | Auto-update via trigger    | Last updated timestamp.                  |

---

### Drafts Table (`drafts`)  

| Column       | Type         | Constraints               | Description                               |
|--------------|--------------|---------------------------|-------------------------------------------|
| `id`         | UUID         | PK, default `uuid_generate_v4()` | Unique draft identifier.         |
| `title`      | TEXT         | Optional                  | Draft title.                              |
| `content`    | TEXT         | Optional                  | Draft content.                            |
| `mood`       | TEXT         | Optional                  | Draft mood.                               |
| `userId`     | UUID         | FK, references `users.id`  | Associated user, cascades on delete.     |
| `createdAt`  | TIMESTAMP    | Default `CURRENT_TIMESTAMP` | Draft creation timestamp.               |
| `updatedAt`  | TIMESTAMP    | Auto-update via trigger    | Last updated timestamp.                  |

---

## Additional Notes  

- **Triggers**:  
  Auto-update `updatedAt` timestamps on any record change.  

- **Foreign Key Constraints**:  
  - Collections are linked to users (`userId`).  
  - Entries are linked to users and collections (`userId`, `collectionId`).  
  - Drafts are linked to users (`userId`).  

- **Indexes**:  
  - Unique indexes on `clerkId` and `email` in the `users` table.  
  - Unique index on `name` and `userId` in the `collections` table to avoid duplicate collection names for each user.  
