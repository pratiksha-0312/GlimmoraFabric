import { loadStripe } from "@stripe/stripe-js";

// Must be a single module-level constant — never recreated
const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
export const stripePromise = key ? loadStripe(key) : null;
