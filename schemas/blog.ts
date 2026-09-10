import { z } from "zod";
import { zid } from "convex-helpers/server/zod4";

export const postSchema = z.object({
  title: z.string().min(3, "標題不得少於 3 個字").max(50, "標題過長"),
  content: z.string().min(10, "文章內容不得少於 10 個字"),
  image: z.instanceof(File).optional(),
  imageStorageId: zid("_storage").optional(),
});
