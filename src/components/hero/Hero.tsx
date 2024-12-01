"use server";
import { handwritting_font } from "@/app/layout";
import { Calendar, ChevronRight } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import Link from "next/link";
import { getDailyAdvice } from "../../../actions/publicApi";

export default async function Hero() {
  const advice = await getDailyAdvice();

  return (
    <>
      <div className="relative container mx-auto px-4 pt-16 pb-16">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className={`${handwritting_font.className} text-5xl md:text-7xl lg:text-8xl mb-6 font-bold gradient-title`}>
            Write it, Feel it <br />
            Logify it.
          </h1>

          <p className="text-sm md:text-lg text-orange-800 mb-8 font-medium">
            Write, express, and reflect with ease in a secure space designed just for you. Logify your thoughts and emotions, making every moment memorable and organized.
          </p>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-50 via-transparent to-transparent pointer-events-none z-10" />
            <div className="bg-white rounded-2xl p-4 max-w-full mx-auto">
              <div className="border-b border-orange-100 pb-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-orange-600" />
                  <span className="text-orange-900 font-medium text-sm">
                    Today&rsquo;s Entry
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-orange-200" />
                  <div className="size-3 rounded-full bg-orange-300" />
                  <div className="size-3 rounded-full bg-orange-400" />
                </div>
              </div>

              <div className="space-y-4 p-4">
                <h3 className="text-lg font-semibold text-orange-900">
                  { advice ? advice: "My Thoughts Today" }
                </h3>
                <Skeleton className="h-4 bg-orange-200 rounded-full w-3/4" />
                <Skeleton className="h-4 bg-orange-200 rounded-full w-full" />
                <Skeleton className="h-4 bg-orange-400 rounded-full w-2/3" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Link href='/dashboard'>
              <Button variant={'journal'} className="px-8 rounded-full flex items-center gap-2 justify-center" >
                <span>Start Writing</span>
                <ChevronRight className="size-5" />
              </Button>
            </Link>

            <Link href='#features'>
              <Button variant={'outline'} className="px-8 rounded-full border-orange-600 text-orange-600 hover:bg-orange-100 hover:text-orange-600" >
                <span>Learn More</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}