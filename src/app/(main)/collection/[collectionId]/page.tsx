"use server";
import { getCollections } from "../../../../../actions/collection";
import { getJournalEntries } from "../../../../../actions/journal";
import DeleteCollectionDialog from "./_components/DeleteCollectionDialog";
import JournalFilters from "./_components/JournalFilters";


export default async function CollectionPage({
  params,
}: {
  params: {
    collectionId: string;
  };
}) {
  const { collectionId } = await params;
  const entries = await getJournalEntries({ collectionId });
  const collections =
    collectionId !== "unorganized" ? await getCollections() : null;
  const collection = collections?.find((c) => c.id === collectionId);  

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col justify-between">
          <div className="flex justify-between">
            <h1 className="text-4xl font-bold gradient-title mt-10">
              {collectionId === "unorganized"
                ? "Unorganized Entries"
                : collection?.name || "Collection"}
            </h1>
            {collection && (
              <DeleteCollectionDialog
                collection={collection}
                entriesCount={entries.data?.entries.length || 0}
              />
            )}
          </div>
          {collection?.description && (
            <h2 className="font-extralight pl-1">{collection?.description}</h2>
          )}
        </div>

        {/* Client-side Filters Component */}
        <JournalFilters entries={entries?.data?.entries || []} />
      </div>
    </>
  );
}