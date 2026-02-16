import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

export function formatDuration(duration: string): string {
  const labels: Record<string, string> = {
    morning: "Morning",
    afternoon: "Afternoon",
    full_day: "Full Day",
  }
  return labels[duration] ?? duration
}
