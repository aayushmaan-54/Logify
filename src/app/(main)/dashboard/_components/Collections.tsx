"use client";
import { useEffect, useState } from "react";
import CollectionPreview from "./CollectionPreview";
import CollectionForm from "@/components/collectionForm/CollectionForm";
import { createCollection } from "../../../../../actions/collection";
import { Collection, CreateCollectionData } from "@/components/journalForm/JournalForm";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { Entry } from "../../../../../actions/journal";

interface CollectionsProps {
  collections: Collection[] | null;
  entriesByCollection: { [key: string]: Entry[] };
}


export default function Collections({
  collections,
  entriesByCollection,
}: CollectionsProps) {
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);

  const {
    loading: createCollectionLoading,
    fn: createCollectionFn,
    data: createdCollection,
  } = useFetch<Collection>(createCollection);

  useEffect(() => {
    if (createdCollection) {
      setIsCollectionDialogOpen(false);
      toast.success(`Collection ${createdCollection.name} created!`);
    }
  }, [createdCollection]);

  const handleCreateCollection = async (data: CreateCollectionData) => {
    createCollectionFn(data);
  };

  if (collections && collections.length === 0) return <></>;

  return (
    <section>
      <h2 className="text-3xl font-bold gradient-title" id="collections">
        Collections
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CollectionPreview
          isCreateNew={true}
          onCreateNew={() => setIsCollectionDialogOpen(true)}
        />

        {entriesByCollection?.unorganized?.length > 0 && (
          <CollectionPreview
            name="unorganized"
            entries={entriesByCollection.unorganized}
            isUnorganized={true}
          />
        )}

        {collections?.map((collection) => (
          <CollectionPreview
            key={collection.id}
            id={collection.id}
            name={collection.name}
            entries={entriesByCollection[collection.id] || []}
          />
        ))}

        <CollectionForm
          loading={createCollectionLoading}
          onSuccess={handleCreateCollection}
          open={isCollectionDialogOpen}
          setOpen={setIsCollectionDialogOpen}
        />
      </div>
    </section>
  );
}
