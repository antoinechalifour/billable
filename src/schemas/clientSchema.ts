import { z } from "zod";

const PRESET_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FECA57",
  "#FF9FF3",
  "#54A0FF",
  "#5F27CD",
];

export const clientSchema = z.object({
  name: z
    .string()
    .min(1, "Client name is required")
    .max(100, "Client name must be less than 100 characters"),
  pricePerDay: z
    .number({
      required_error: "Price per day is required",
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be greater than 0")
    .max(99999, "Price must be less than 99,999"),
  color: z
    .string()
    .refine((color) => PRESET_COLORS.includes(color), {
      message: "Please select a valid color",
    }),
});

export type ClientFormData = z.infer<typeof clientSchema>;