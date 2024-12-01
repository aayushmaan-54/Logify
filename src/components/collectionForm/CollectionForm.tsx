import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { collectionSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BarLoader from "react-spinners/BarLoader";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

type CollectionFormData = z.infer<typeof collectionSchema>;

interface CollectionFormProps {
  loading: boolean;
  onSuccess: (data: CollectionFormData) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}


export default function CollectionForm({ 
  loading, 
  onSuccess, 
  open, 
  setOpen 
}: CollectionFormProps) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onFormSubmit = handleSubmit(async (data) => {
    onSuccess(data);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          {loading && <BarLoader color="orange" width={"100%"} />}

          <form onSubmit={onFormSubmit} className='space-y-2'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium mb-1'>Collection Name</label>
              <Input
                {...register("name")}
                disabled={loading}
                placeholder='Enter collection name...'
                className={`${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium mb-1'>Collection Description</label>
              <Textarea
                {...register("description")}
                disabled={loading}
                placeholder='Describe your collection...'
                className={`${errors.description ? "border-red-500" : ""}`}
              />
              {errors.description && (
                <p className='text-red-500 text-sm mt-1'>{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant={'ghost'} onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant={'journal'} disabled={loading}>
                {loading ? 'Creating...' : 'Create Collection'}
              </Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}