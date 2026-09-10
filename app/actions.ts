"use server";

import { api } from "@/convex/_generated/api";
import { fetchAuthMutation } from "@/lib/auth-server";
import { postSchema } from "@/schemas/blog";
// import { createPostSchema } from '@/schemas/blog';
import { updateTag } from "next/cache";
import z from "zod";

export async function createPostAction(values: z.infer<typeof postSchema>) {
  const parsed = postSchema.safeParse(values);

  if (!parsed.success) {
    throw new Error("資料驗證失敗，請檢查欄位!");
  }

  // 儲存貼文與 storageId，將上傳圖片留在 Client Component
  if (parsed.data.imageStorageId) {
    await fetchAuthMutation(api.posts.createPost, {
      title: parsed.data.title,
      body: parsed.data.content,
      imageStorageId: parsed.data.imageStorageId,
    });
  } else {
    // 無上傳圖片，直接儲存貼文
    await fetchAuthMutation(api.posts.createPost, {
      title: parsed.data.title,
      body: parsed.data.content,
    });
  }

  // Mutate data
  updateTag("blog");
}
