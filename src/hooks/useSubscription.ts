"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function useSubscription() {
  const subscription = useQuery(api.subscriptions.getCurrentSubscription);

  const isPremium =
    subscription?.plan === "premium" || subscription?.plan === "vip";
  const isBasic = subscription?.plan === "basic" || isPremium;
  const isFree = !subscription || subscription.plan === "free";

  return {
    subscription,
    isPremium,
    isBasic,
    isFree,
    plan: subscription?.plan ?? "free",
    isActive:
      subscription?.status === "active" ||
      subscription?.status === "trialing",
  };
}
