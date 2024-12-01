"use server";
import { getCollections } from "../../../../actions/collection";
import { getJournalEntries } from "../../../../actions/journal";
import Collections from "./_components/Collections";
import MoodAnalytics from "./_components/MoodAnalytics";
import { Entry } from "../../../../actions/journal";


export default async function DashboardPage() {
/* eslint-disable @typescript-eslint/no-unused-vars */
  const { dynamic, revalidate } = await import('./dashboard.config');

  const collections = await getCollections();
  const entriesData = await getJournalEntries();

  const entriesByCollection: Record<string, Entry[]> = entriesData?.data?.entries
    ? entriesData.data.entries.reduce((acc, entry) => {
        const collectionId = entry.collectionId || 'unorganized';
        if (!acc[collectionId]) acc[collectionId] = [];
        acc[collectionId].push(entry);
        return acc;
      }, {} as Record<string, Entry[]>)
    : {};

  return (
    <>
      <h1 className="gradient-title text-6xl mt-8">Dashboard</h1>
      <main className="px-4 py-8 space-y-8">
        <section className="space-y-4">
          <MoodAnalytics />
        </section>
        <Collections collections={collections} entriesByCollection={entriesByCollection} />
      </main>
    </>
  );
}
