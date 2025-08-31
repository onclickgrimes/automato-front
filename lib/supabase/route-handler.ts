import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cria um cliente Supabase para uso em Route Handlers
 * Segue o padrão SSR moderno do Supabase
 */
export async function createRouteHandlerSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}