import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("title");
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
