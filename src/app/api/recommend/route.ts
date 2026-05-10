import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations, Mood, Focus, Size, Pace, World } from '@/lib/recommend';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const mood = (sp.get('mood') ?? 'acao') as Mood;
  const focus = (sp.get('focus') ?? 'protagonista') as Focus;
  const size = (sp.get('size') ?? 'standalone') as Size;
  const pace = sp.get('pace') as Pace | null;
  const world = sp.get('world') as World | null;
  const refBook = sp.get('refBook') ?? undefined;

  const books = await getRecommendations({
    refBook,
    mood,
    focus,
    size,
    pace: pace ?? undefined,
    world: world ?? undefined,
  });

  return NextResponse.json({ books });
}
