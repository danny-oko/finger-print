"use client";

import { Trash2 } from "lucide-react";
import * as React from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RegistrationFormValues } from "@/lib/registration/schema";

const GRADES = [7, 8, 9, 10, 11, 12];

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * One attendee's fields. Church is asked once for the whole registration and
 * the ticket email once on the payer, so a person is just name + grade +
 * phones — cheap enough that a leader can add ten of them without despair.
 *
 * `phoneRequired` is true only for a lone registrant, whose own number
 * doubles as the payer phone the status lookup keys on.
 */
export function AttendeeRow({
  index,
  phoneRequired,
  onRemove,
  autoFocus = false,
}: {
  index: number;
  phoneRequired: boolean;
  onRemove?: () => void;
  autoFocus?: boolean;
}) {
  const { control } = useFormContext<RegistrationFormValues>();
  const namePrefix = `attendees.${index}` as const;

  const nameRef = React.useRef<HTMLInputElement>(null);
  const phoneRef = React.useRef<HTMLInputElement>(null);
  const parentPhoneRef = React.useRef<HTMLInputElement>(null);
  const gradeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (autoFocus) nameRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold text-neutral-500">{index + 1}-р хүн</p>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label={`${index + 1}-р хүнийг хасах`}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-6">
        <FormField
          control={control}
          name={`${namePrefix}.fullName`}
          render={({ field }) => (
            <FormItem className="sm:col-span-4">
              <FormLabel>Бүтэн нэр</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  ref={nameRef}
                  placeholder="Бат-Эрдэнэ Ганбаяр"
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      gradeRef.current?.focus();
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${namePrefix}.grade`}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Анги</FormLabel>
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={(v) => {
                  field.onChange(Number(v));
                  phoneRef.current?.focus();
                }}
              >
                <FormControl>
                  <SelectTrigger ref={gradeRef} className="w-full">
                    <SelectValue placeholder="Сонгох" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={String(g)}>
                      {g}-р анги
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${namePrefix}.phone`}
          render={({ field }) => (
            <FormItem className="sm:col-span-3">
              <FormLabel>
                Утас{" "}
                {!phoneRequired && (
                  <span className="font-normal text-muted-foreground">
                    (заавал биш)
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  ref={phoneRef}
                  value={(field.value as string | undefined) ?? ""}
                  inputMode="tel"
                  maxLength={8}
                  placeholder="99112233"
                  onChange={(e) => {
                    const digits = onlyDigits(e.target.value).slice(0, 8);
                    field.onChange(digits);
                    if (digits.length === 8) parentPhoneRef.current?.focus();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${namePrefix}.parentPhone`}
          render={({ field }) => (
            <FormItem className="sm:col-span-3">
              <FormLabel>Эцэг эхийн утас</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  ref={parentPhoneRef}
                  value={(field.value as string | undefined) ?? ""}
                  inputMode="tel"
                  maxLength={8}
                  placeholder="99112233"
                  onChange={(e) =>
                    field.onChange(onlyDigits(e.target.value).slice(0, 8))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
