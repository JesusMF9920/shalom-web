// lib/supabase.ts (cambió de .js a .ts)
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types"; // Tipos auto-generados

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Tipos de las tablas para usar en componentes
export type Store = Database["public"]["Tables"]["stores"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type InventoryItem = Database["public"]["Tables"]["inventory"]["Row"];
export type Sale = Database["public"]["Tables"]["sales"]["Row"];
