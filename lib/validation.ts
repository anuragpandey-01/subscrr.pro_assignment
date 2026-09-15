import { z } from "zod";

/**
 * User registration validation
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

/**
 * User login validation
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

/**
 * Subscription validation
 */
export const subscriptionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Subscription name must be at least 2 characters")
    .max(100, "Subscription name cannot exceed 100 characters"),

  price: z
    .number()
    .finite("Price must be a valid number")
    .min(0, "Price cannot be negative"),

  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, "Currency must be a 3-letter code"),

  billingCycle: z.enum(["monthly", "yearly"]),

  nextBillingDate: z.coerce.date({
    error: "Please provide a valid billing date",
  }),

  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category cannot exceed 50 characters"),

  icon: z
    .string()
    .trim()
    .max(50, "Icon value is too long")
    .optional()
    .default("credit-card"),

  color: z
    .string()
    .trim()
    .max(20, "Color value is too long")
    .optional()
    .default("#FF2500"),

  reminderEnabled: z
    .boolean()
    .optional()
    .default(true),

  reminderDaysBefore: z
    .number()
    .int("Reminder days must be a whole number")
    .min(0, "Reminder days cannot be negative")
    .max(30, "Reminder cannot be more than 30 days before")
    .optional()
    .default(3),

  status: z
    .enum(["active", "paused", "cancelled"])
    .optional()
    .default("active"),
});

/**
 * Subscription update validation.
 *
 * Every field is optional because an update may only
 * modify one or two properties.
 */
export const subscriptionUpdateSchema = subscriptionSchema.partial();