/**
 * Plan type for user subscriptions
 */
export type PlanType = 'free' | 'pro' | 'lifetime' | 'pro+lifetime';

/**
 * Subscription status types
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'expired'
  | 'payment_failed';

/**
 * Payment provider types
 */
export type PaymentProvider = 'stripe' | 'paypal' | 'manual';

/**
 * Payment status types
 */
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

/**
 * Feature limitations based on plan
 */
export interface PlanFeatures {
  dailyLimit: number | null;
  monthlyLimit?: number | null;
  totalCredits?: number | null;
  maxFileSize: number; // MB
  maxFiles: number;
  maxColumns: number | null;
}

/**
 * Plan definition
 */
export interface Plan {
  name: string;
  code: string;
  description: string;
  features: PlanFeatures;
  monthlyPrice?: number;
  yearlyPrice?: number;
  price?: number;
  isLifetime: boolean;
}

/**
 * Structure of plans constant
 */
export interface PlansConfig {
  free: Plan;
  pro: Plan;
  lifetime: Plan;
  [key: string]: Plan;
}
