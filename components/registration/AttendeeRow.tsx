"use client";

import { X } from "lucide-react";
import * as React from "react";
import { useFormContext } from "react-hook-form";

import { advanceOnFullPhone, focusNextField } from "@/components/registration/focusNextField";
import { FIELD_CLASS, LABEL_CLASS } from "@/components/registration/FormStep";
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
import { GRADE_CHOICES, gradeChoiceLabel } from "@/lib/registration/grade";
import type { RegistrationFormValues } from "@/lib/registration/schema";
import { cn } from "@/lib/utils";

export const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 8);

export function AttendeeRow({
  index,
  self,
  onRemove,
  autoFocus = false,
  nameLabel,
}: {
  index: number;
  self: boolean;
  onRemove?: () => void;
  autoFocus?: boolean;
  nameLabel?: string;
}) {
  const { control } = useFormContext<RegistrationFormValues>();
  const prefix = `attendees.${index}` as const;

  const nameRef = React.useRef<HTMLInputElement>(null);
  const gradeRef = React.useRef<HTMLButtonElement>(null);
  const advanceRef = React.useRef(false);

  React.useEffect(() => {
    if (autoFocus) nameRef.current?.focus();
  }, [autoFocus]);

  return (
    <div
      role="group"
      aria-label={self ? "Таны мэдээлэл" : `${index + 1}-р хүн`}
      className={cn("grid gap-4", !self && "rounded-xl border border-black/10 p-4")}
    >
      {!self && (
        <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink/60">{index + 1}-р хүн</span>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="-my-1 -mr-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium text-ink/60 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-ink"
              >
                <X className="size-4" />
                Хасах
              </button>
            )}
        </div>
      )}

      <FormField
        control={control}
        name={`${prefix}.fullName`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className={LABEL_CLASS}>{nameLabel ?? (self ? "Таны нэр" : "Нэр")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                ref={nameRef}
                className={FIELD_CLASS}
                placeholder="Жишээ нь: Ганбаярын Тэмүүлэн"
                autoComplete={self ? "name" : "off"}
                enterKeyHint="next"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name={`${prefix}.grade`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>Анги</FormLabel>
              <Select
                value={field.value ?? undefined}
                onValueChange={(v) => {
                  field.onChange(v);
                  advanceRef.current = true;
                }}
              >
                <FormControl>
                  <SelectTrigger ref={gradeRef} className={cn(FIELD_CLASS, "w-full data-[size=default]:h-12")}>
                    <SelectValue placeholder="Сонгоно уу" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent
                  onCloseAutoFocus={(e) => {
                    if (!advanceRef.current) return;
                    advanceRef.current = false;
                    e.preventDefault();
                    focusNextField(gradeRef.current);
                  }}
                >
                  {GRADE_CHOICES.map((choice) => (
                    <SelectItem key={choice} value={choice} className="py-2.5 text-base">
                      {gradeChoiceLabel(choice)}
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
          name={`${prefix}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>
                Утас
                {!self && <span className="font-normal text-ink/50">(заавал биш)</span>}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={(field.value as string | undefined) ?? ""}
                  className={FIELD_CLASS}
                  type="tel"
                  inputMode="numeric"
                  autoComplete={self ? "tel-national" : "off"}
                  maxLength={8}
                  placeholder="8 оронтой дугаар"
                  onChange={(e) => {
                    const digits = onlyDigits(e.target.value);
                    advanceOnFullPhone(field.value as string | undefined, digits, e.currentTarget);
                    field.onChange(digits);
                  }}
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
