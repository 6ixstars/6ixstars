import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ error: 'no supabaseAdmin' });
  const { data, error } = await supabaseAdmin.from('home_content').select('*').eq('section', 'hero');
  return NextResponse.json({ data, error });
}
