import { useState } from "react";
import { toast } from "sonner";

type FetchFunction<T> = (...args: any[]) => Promise<T>;

interface UseFetchResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  fn: (...args: any[]) => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
}


const useFetch = <T>(cb: FetchFunction<T>): UseFetchResult<T> => {

  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { 
    data, 
    loading, 
    error, 
    fn, 
    setData
  };
};

export default useFetch;
