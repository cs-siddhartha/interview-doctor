"use server";

import { redirect } from "next/navigation";

import { deleteSession } from "@/lib/api/sessions";
import { requireAppSession } from "@/lib/auth";

export async function deleteInterviewData(sessionId: string) {
  await requireAppSession();
  await deleteSession(sessionId);
  redirect("/");
}
