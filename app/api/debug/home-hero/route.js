import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ error: 'no supabaseAdmin' });
  const { data, error } = await supabaseAdmin.from('home_content').select('section, updated_at, data');
  const summary = (data || []).map((r) => ({
    section: r.section,
    updated_at: r.updated_at,
    topLevelKeys: Object.keys(r.data || {}),
    hasNestedValue: !!(r.data && typeof r.data === 'object' && 'value' in r.data),
  }));
  return NextResponse.json({ summary, error });
}
