"use client"

import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import {
  tripFormSchema,
  type TripFormInput,
} from "@/lib/validations/trips"
import type { Trip } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function TripForm({
  trip,
  isPending,
  onSubmit,
  onCancel,
}: {
  trip?: Trip
  isPending: boolean
  onSubmit: (data: TripFormInput) => void
  onCancel: () => void
}) {
  const form = useForm<TripFormInput>({
    resolver: standardSchemaResolver(tripFormSchema),
    defaultValues: {
      name: trip?.name ?? "",
      description: trip?.description ?? "",
      duration: trip?.duration ?? "full_day",
      price_cents: trip ? (trip.price_cents / 100).toFixed(2) : "",
      deposit_required: trip?.deposit_required ?? false,
      deposit_cents:
        trip?.deposit_cents != null
          ? (trip.deposit_cents / 100).toFixed(2)
          : "",
      capacity: trip?.capacity ?? 1,
      conditions_notes: trip?.conditions_notes ?? "",
    },
  })

  const depositRequired = form.watch("deposit_required")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trip Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Bass Fishing Adventure" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what the trip includes..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="full_day">Full Day</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    {...field}
                    value={String(field.value ?? "")}
                    onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price_cents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="250.00"
                    {...field}
                    value={String(field.value ?? "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {depositRequired && (
            <FormField
              control={form.control}
              name="deposit_cents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="50.00"
                      {...field}
                      value={String(field.value ?? "")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="deposit_required"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">Require a deposit</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conditions_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conditions Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Weather or water conditions info..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? trip
                ? "Saving..."
                : "Creating..."
              : trip
                ? "Save Changes"
                : "Create Trip"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
