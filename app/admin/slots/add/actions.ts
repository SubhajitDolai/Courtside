"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache"

export async function addSlot(formData: FormData) {
  const supabase = await createClient();

  const sport_id = formData.get("sport_id") as string;
  const start_time = formData.get("start_time") as string;
  const end_time = formData.get("end_time") as string;
  const gender = formData.get("gender") as string;

  await supabase.from("slots").insert({
    sport_id,
    start_time,
    end_time,
    gender,
  });

  redirect("/admin/slots");
}

export async function deleteSlot(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("slots").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/slots")
  redirect("/admin/slots")
}
