"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useForm, Controller } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { journalSchema } from '@/lib/schema';
import BarLoader from 'react-spinners/BarLoader';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMoodById, MOODS } from '@/lib/mood';
import { Button } from '../ui/button';
import useFetch from '@/hooks/use-fetch';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import CollectionForm from '../collectionForm/CollectionForm';
import { createJournalEntry, EntriesData, getDraft, getJournalEntries, saveDraft, updateJournalEntry } from '../../../actions/journal';
import { createCollection, getCollections } from '../../../actions/collection';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
import "./style.css";
import { Loader2 } from 'lucide-react';

type JournalInputs = z.infer<typeof journalSchema>;

export interface Collection {
  id: string;
  name: string;
  description?: string;
}

export interface CreateCollectionData {
  name: string;
  description?: string;
}


export default function JournalForm() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [isEditMode, setIsEditMode] = useState(false);


  const {
    loading: entryLoading,
    data: existingEntry,
    fn: fetchEntry,
  } = useFetch<EntriesData>(getJournalEntries);

  const {
    loading: draftLoading,
    data: draftData,
    fn: fetchDraft,
  } = useFetch(getDraft);  

  const {
    loading: savingDraft,
    fn: saveDraftFn,
    data: savedDraft
  } = useFetch(saveDraft);

  const {
    loading: isSavingJournalEntry,
    fn: saveJournalEntry,
    data: journalEntryResponse,
  } = useFetch(isEditMode ? updateJournalEntry : createJournalEntry);

  const {
    loading: collectionsLoading,
    fn: fetchCollectionsFn,
    data: collections,
  } = useFetch<Collection[] | null>(getCollections);

  const {
    loading: createCollectionLoading,
    fn: createCollectionFn,
    data: createdCollection,
  } = useFetch<Collection>(createCollection);


  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);


  const isLoading =
    isSavingJournalEntry ||
    collectionsLoading ||
    createCollectionLoading ||
    savingDraft ||
    draftLoading ||
    entryLoading;


  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    setValue,
    reset,
    watch,
  } = useForm<JournalInputs>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: "",
      content: "",
      mood: "",
      collectionId: "",
    },
  });


  useEffect(() => {
    fetchCollectionsFn();

    if (editId) {
      setIsEditMode(true);
      fetchEntry(editId);
    } else {
      setIsEditMode(false);
      fetchDraft();
    }
  }, [editId]);
  

  useEffect(() => {
    if (journalEntryResponse && !isSavingJournalEntry) {
      if (!isEditMode) {
        saveDraftFn({ title: "", content: "", mood: "" })
      }

      router.push(`/collection/${journalEntryResponse.collectionId ?? "unorganized"}`);
      toast.success(`Entry ${isEditMode ? "updated" : "created"} successfully`);
    }
  }, [journalEntryResponse, isSavingJournalEntry, router]);


  useEffect(() => {
    if (createdCollection) {
      setIsCollectionDialogOpen(false);
      fetchCollectionsFn();
      setValue("collectionId", createdCollection.id);
    }
  }, [createdCollection]);


  useEffect(() => {
    if (isEditMode && existingEntry?.data?.entries?.length) {      
      const entry = existingEntry.data.entries[0];      
      reset({
        title: entry.title || "",
        content: entry.content || "",
        mood: entry.mood || "",
        collectionId: entry.collectionId || "",
      });
    } else if (draftData?.success && draftData?.data) {
      const draft = draftData.data;
      reset({
        title: draft.title || "",
        content: draft.content || "",
        mood: draft.mood || "",
        collectionId: "",
      });
    } else {      
      reset({
        title: "",
        content: "",
        mood: "",
        collectionId: "",
      });
    }
  }, [draftData, isEditMode, existingEntry]);


  const onSubmit = handleSubmit(async (data: JournalInputs) => {
    try {
      const mood = getMoodById(data.mood);
      if (!mood) throw new Error("Invalid mood selected");

      await saveJournalEntry({
        ...data,
        moodScore: mood.score,
        moodQuery: mood.pixabayQuery,
        ...(isEditMode && { id: editId }),
      });
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    }
  });


  const handleCreateCollection = async (data: CreateCollectionData) => {
    createCollectionFn(data);
  };

  const formData = watch();
  const handleSaveDraft = async () => {
    if(!isDirty) {
      toast.error('No changes to save');
      return;
    }
    await saveDraftFn(formData)
  }

  useEffect(() => {
    if(savedDraft?.success && !savingDraft) {
      toast.success("Draft saved successfully");
    }
  }, [savedDraft, savingDraft])


  return (
    <div className='py-8'>
      <form
        className='space-y-6 mx-auto'
        onSubmit={onSubmit}
      >
        <h1 className={`text-5xl md:text-6xl gradient-title mb-6 mt-8`}>
          {isEditMode ? "Edit Entry" : "What's on your mind?"}
        </h1>

        {isLoading && <BarLoader color="orange" width={"100%"} />}

        <div className='space-y-2'>
          <label className='block text-sm font-medium mb-1'>Title</label>
          <Input
            {...register("title")}
            disabled={isLoading}
            placeholder='Give your entry a title...'
            className={`py-5 md:text-md bg-white ${errors.title ? "border-red-500" : ""}`}
          />
          {errors.title && (
            <p className='text-red-500 text-sm mt-1'>{errors.title.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='block text-sm font-medium mb-1'>How are you feeling?</label>
          <Controller
            name='mood'
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={`bg-white ${errors.mood} ? "border-red-500" : ""`}>
                  <SelectValue placeholder="Select a mood..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MOODS).map((mood) => (
                    <SelectItem key={mood.id} value={mood.id}>
                      <span className='flex items-center gap-2'>{mood.emoji} {mood.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.mood && (
            <p className='text-red-500 text-sm mt-1'>{errors.mood.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Controller
            name='mood'
            control={control}
            render={({ field }) => (
              <label className='block text-sm font-medium mb-1'>
                {field.value ? getMoodById(field.value)?.prompt : "Write your thoughts..."}
              </label>
            )}
          />
          <Controller
            name='content'
            control={control}
            render={({ field }) => (
              <ReactQuill
                theme="snow"
                value={field.value}
                onChange={field.onChange}
                readOnly={isLoading}
                className={"react-quill_editor"}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["blockquote", "code-block"],
                    ["link"],
                    ["clean"],
                  ],
                }}
              />
            )}
          />
          {errors.content && (
            <p className='text-red-500 text-sm mt-1'>{errors.content.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='block text-sm font-medium mb-1'>Add to Collection (Optional)</label>
          <Controller
            name='collectionId'
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  if (value === 'new') {
                    setIsCollectionDialogOpen(true);
                  } else {
                    field.onChange(value);
                  }
                }}
                value={field.value}
              >
                <SelectTrigger className='bg-white'>
                  <SelectValue placeholder="Choose a collection..." />
                </SelectTrigger>
                <SelectContent>
                  {collections?.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">
                    <span className='text-orange-600'>
                      + Create New Collection
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.collectionId && (
            <p className='text-red-500 text-sm mt-1'>{errors.collectionId.message}</p>
          )}
        </div>

        <div className='space-x-4 flex'>
        {!isEditMode && (
            <Button
              onClick={handleSaveDraft}
              type='button'
              variant={"outline"}
              disabled={savingDraft || !isDirty}
            >
              { savingDraft && <Loader2 className='mr-2 size-4 animate-spin' /> }
              Save as Draft
            </Button>
          )}

          <Button type="submit" variant="journal" disabled={isSavingJournalEntry || !isDirty}>
            {isSavingJournalEntry
              ? isEditMode
                ? 'Updating...'
                : 'Publishing...'
              : isEditMode
                ? 'Update'
                : 'Publish'}
          </Button>

          {isEditMode && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                router.push(`/journal/${existingEntry?.data?.entries[0]?.id}`);
              }}
              variant={"destructive"}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <CollectionForm
        loading={createCollectionLoading}
        onSuccess={handleCreateCollection}
        open={isCollectionDialogOpen}
        setOpen={setIsCollectionDialogOpen}
      />
    </div>
  );
}