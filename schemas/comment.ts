import { z } from 'zod';
import { zid } from 'convex-helpers/server/zod4';

export const commentSchema = z.object({
  body: z.string().min(10, '請至少輸入十個字！'),
  postId: zid('posts'),
});
