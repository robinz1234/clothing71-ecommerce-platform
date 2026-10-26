import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name."),
  phone: z.string().trim().min(6, "Please enter a valid phone number."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().min(5, "Please enter your full delivery address."),
  locality: z.string().trim().min(2, "Please enter your area or locality."),
  city: z.string().trim().min(2, "Please enter your city or district."),
  note: z.string().trim().max(300, "Delivery note is too long.").optional(),
  deliveryZone: z.enum(["DHAKA", "SUB_AREA", "OUTSIDE_DHAKA"], {
    message: "Please select a delivery zone.",
  }),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
