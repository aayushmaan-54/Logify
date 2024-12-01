"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteJournalEntry } from "../../../../../../actions/journal";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";


export default function DeleteDialog({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    loading: isDeleting,
    fn: deleteEntryFn,
    data: deletedEntry,
  } = useFetch(deleteJournalEntry);


  useEffect(() => {
    if (deletedEntry && !isDeleting) {
      setDeleteDialogOpen(false);
      toast.error("Journal entry deleted successfully");

      if ('collectionId' in deletedEntry) {
        router.push(
          `/collection/${
            deletedEntry.collectionId ? deletedEntry.collectionId : "unorganized"
          }`
        );
      }
    }
  }, [deletedEntry, isDeleting]);

  const handleDelete = async () => {
    await deleteEntryFn(entryId);
  };

  
  return (
    <>
       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            journal entry.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}