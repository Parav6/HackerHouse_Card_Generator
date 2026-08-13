import { z } from "zod";

export const createBuilderSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name must not exceed 50 characters." })
    .trim(),
  role: z
    .string()
    .min(1, { message: "Please select a primary role." })
    .trim(),
  stack: z
    .string()
    .min(1, { message: "Please select a primary stack/technology." })
    .trim(),
  xHandle: z
    .string()
    .optional()
    .transform((val) => (val && val.startsWith("@") ? val.slice(1) : val)),
  github: z.string().trim().optional(),
  city: z.string().trim().optional(),
  cardImage: z.string().refine((val) => val.startsWith("data:image/"), {
    message: "Invalid card image. Must be a base64 encoded data URI.",
  }),
  connectionToken: z.string().optional(),
});

export const claimBuilderSchema = z.object({
  passcode: z
    .string()
    .min(4, { message: "Passcode must be at least 4 characters." })
    .max(10, { message: "Passcode must not exceed 10 characters." }),
});

export const loginBuilderSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  passcode: z.string().min(4, { message: "Passcode is required." }),
});
