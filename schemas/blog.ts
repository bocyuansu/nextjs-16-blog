import { z } from 'zod';
import { zid } from 'convex-helpers/server/zod4';

export const postSchema = z.object({
  title: z.string().min(3).max(50),
  content: z.string().min(10),
  image: z.instanceof(File).optional(),
});

export const createPostSchema = z.object({
  title: z.string().min(3).max(50),
  content: z.string().min(10),
  imageStorageId: zid('_storage').optional(),
});
