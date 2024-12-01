"use server";
import { pool } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

interface Entry {
  id: string;
  userId: string;
  mood: string;
  moodScore: number;
  createdAt: Date;
}

interface AnalyticsData {
  date: string;
  averageScore: number;
  entryCount: number;
}

interface OverallStats {
  totalEntries: number;
  averageScore: number;
  mostFrequentMood: string | null;
  dailyAverage: number;
}


export async function getAnalytics(period: string = '30d') {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const userResult = await pool.query(
    'SELECT * FROM "users" WHERE "clerkId" = $1',
    [userId]
  );

  if (userResult.rows.length === 0) throw new Error("User not found!");
  const user = userResult.rows[0];

  const startDate = new Date();

  switch (period) {
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;

    case "15d":
      startDate.setDate(startDate.getDate() - 15);
      break;

    case "30d":
    default:
      startDate.setDate(startDate.getDate() - 30);
      break;
  }

  const entriesResult = await pool.query<Entry>(`
    SELECT * FROM "entries" 
    WHERE "userId" = $1 
    AND "createdAt" >= $2
    ORDER BY "createdAt" ASC 
  `, [user.id, startDate]);

  const entries = entriesResult.rows;

  const moodData = entries.reduce((acc: Record<string, { totalScore: number, count: number, entries: Entry[] }>, entry: Entry) => {
    const date = entry.createdAt.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = {
        totalScore: 0,
        count: 0,
        entries: [],
      };
    }
    acc[date].totalScore += entry.moodScore;
    acc[date].count += 1;
    acc[date].entries.push(entry);
    return acc;
  }, {});

  const analyticsData: AnalyticsData[] = Object.entries(moodData).map(([date, data]) => ({
    date,
    averageScore: Number((data.totalScore / data.count).toFixed(1)),
    entryCount: data.count,
  }));

  const overallStats: OverallStats = {
    totalEntries: entries.length,
    averageScore: entries.length > 0
      ? Number(
        (
          entries.reduce((acc, entry) => acc + entry.moodScore, 0) /
          entries.length
        ).toFixed(1)
      )
      : 0,
    mostFrequentMood: entries.length > 0
      ? Object.entries(
        entries.reduce((acc: Record<string, number>, entry: Entry) => {
          acc[entry.mood] = (acc[entry.mood] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || null
      : null,
    dailyAverage: entries.length > 0
      ? Number(
        (
          entries.length / (period === "7d" ? 7 : period === "15d" ? 15 : 30)
        ).toFixed(1)
      )
      : 0,
  };

  return {
    success: true,
    data: {
      timeline: analyticsData,
      stats: overallStats,
      entries: entries,
    },
  };
}