"use server";
import { unstable_cache } from "next/cache";


export const getDailyAdvice = unstable_cache(
  async () => {
    try {
      const res = await fetch(`${process.env.ADVICE_API_URL}`, {
        cache: "no-store"
      });

      const data = await res.json();
      return data.slip.advice;
    } catch (err) {
      return {
        success: false,
        data: "What's on your mind today?",
      }
    }
  },
  ["daily-advice"],
  {
    revalidate: 86400, // 24hrs -> 86400sec
    tags: ["daily-advice"]
  }
);



export async function getPixabayImage(query: { query: string }) {
  try {
    const res = await fetch(`${process.env.PIXABAY_API_URL}?q=${query}&key=${process.env.PIXABAY_API_KEY}&min_width=1280&min_height=720&image_type=illustration&category=feelings`);

    const data = await res.json();
    return data.hits[0]?.largeImageURL || null;
  } catch (error) {
    console.error('Pixabay API Error: ', error);
    return null;
  } 
}