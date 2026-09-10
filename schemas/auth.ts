import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(3).max(30),
  email: z.email('無效的 Email !'),
  password: z.string().min(8, '密碼長度至少 8 個字').max(20, '密碼長度不能超過 20 個字'),
});

export const loginSchema = z.object({
  email: z.email('無效的 Email !'),
  password: z.string().min(8, '密碼長度至少 8 個字').max(20, '密碼長度不能超過 20 個字'),
});
