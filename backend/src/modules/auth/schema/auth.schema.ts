import { z } from 'zod';

export const signupBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(190),
  password: z.string().min(6).max(72),
});

export const loginBodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(190),
  password: z.string().min(1).max(72),
});

export type SignupBodyDto = z.infer<typeof signupBodySchema>;
export type LoginBodyDto = z.infer<typeof loginBodySchema>;
