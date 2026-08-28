"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import { ChurchCombobox } from "@/components/registration/ChurchCombobox";
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

export function AttendeeFields({
  namePrefix,
  churches,
  phoneRequired,
}: {
  namePrefix: `attendees.${number}`;
  churches: string[];
  phoneRequired: boolean;
}) {
  const { control, setValue } = useFormContext<RegistrationFormValues>();

  const ageRef = React.useRef<HTMLInputElement>(null);
  const phoneRef = React.useRef<HTMLInputElement>(null);
  const parentPhoneRef = React.useRef<HTMLInputElement>(null);
  const churchRef = React.useRef<HTMLButtonElement>(null);
  const gradeRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={control}
        name={`${namePrefix}.fullName`}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Бүтэн нэр</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Бат-Эрдэнэ Ганбаяр"
                autoComplete="name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    ageRef.current?.focus();
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
        name={`${namePrefix}.age`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Нас</FormLabel>
            <FormControl>
              <Input
                {...field}
                ref={ageRef}
                value={(field.value as string | undefined) ?? ""}
                inputMode="numeric"
                maxLength={2}
                placeholder="15"
                onChange={(e) => {
                  const digits = onlyDigits(e.target.value).slice(0, 2);
                  field.onChange(digits);
                  if (digits.length === 2) phoneRef.current?.focus();
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${namePrefix}.phone`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Хүүхдийн утас {phoneRequired ? "" : <span className="text-muted-foreground">(заавал биш)</span>}
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
          <FormItem>
            <FormLabel>Эцэг эхийн утас</FormLabel>
            <FormControl>
              <Input
                {...field}
                ref={parentPhoneRef}
                value={(field.value as string | undefined) ?? ""}
                inputMode="tel"
                maxLength={8}
                placeholder="99112233"
                onChange={(e) => {
                  const digits = onlyDigits(e.target.value).slice(0, 8);
                  field.onChange(digits);
                  if (digits.length === 8) churchRef.current?.focus();
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${namePrefix}.churchName`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Хамаарах сүм</FormLabel>
            <FormControl>
              <ChurchCombobox
                ref={churchRef}
                value={field.value}
                churches={churches}
                onChange={(v) =>
                  setValue(`${namePrefix}.churchName`, v, { shouldValidate: true })
                }
                onSelected={() => gradeRef.current?.focus()}
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
          <FormItem>
            <FormLabel>Анги</FormLabel>
            <Select
              value={field.value ? String(field.value) : undefined}
              onValueChange={(v) => field.onChange(Number(v))}
            >
              <FormControl>
                <SelectTrigger ref={gradeRef} className="w-full">
                  <SelectValue placeholder="Ангиа сонгох" />
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
    </div>
  );
}
