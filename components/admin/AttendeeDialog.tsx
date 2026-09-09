"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { ChurchCombobox } from "@/components/registration/ChurchCombobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  adminAttendeeSchema,
  type AdminAttendeeInput,
  type AdminAttendeeValues,
} from "@/lib/admin/attendeeSchema";
import { GRADE_CHOICES, gradeChoiceLabel } from "@/lib/registration/grade";

const BLANK: AdminAttendeeValues = {
  fullName: "",
  grade: undefined as unknown as AdminAttendeeValues["grade"],
  churchName: "",
  phone: "",
};

export function AttendeeDialog({
  open,
  onOpenChange,
  mode,
  initial,
  context,
  churches,
  working,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initial?: AdminAttendeeValues;
  context?: string;
  churches: string[];
  working: boolean;
  onSubmit: (values: AdminAttendeeInput) => void;
}) {
  const form = useForm<AdminAttendeeValues, unknown, AdminAttendeeInput>({
    resolver: zodResolver(adminAttendeeSchema),
    mode: "onTouched",
    defaultValues: initial ?? BLANK,
  });

  const { reset } = form;

  // Mounted once and reused, so each opening loads its own person.
  React.useEffect(() => {
    if (open) reset(initial ?? BLANK);
  }, [open, initial, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Шинэ хүн нэмэх" : "Хүний мэдээлэл засах"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? context
                ? `${context} бүртгэл дээр нэмнэ. Төлбөрийн дүн өөрчлөгдөхгүй.`
                : "Энэ бүртгэл дээр нэмнэ. Төлбөрийн дүн өөрчлөгдөхгүй."
              : "Засвар тэр даруй хадгалагдана."}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            id="admin-attendee-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 [&_[role=combobox]]:h-11 [&_input]:h-11"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Бүтэн нэр</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Бат-Эрдэнэ Ганбаяр"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Анги</FormLabel>
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Сонгох" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GRADE_CHOICES.map((choice) => (
                          <SelectItem key={choice} value={choice}>
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
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Утас{" "}
                      <span className="font-normal text-muted-foreground">
                        (заавал биш)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={(field.value as string | undefined) ?? ""}
                        inputMode="tel"
                        maxLength={8}
                        placeholder="99112233"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.replace(/\D/g, "").slice(0, 8),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="churchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Хамрагддаг цуглаан</FormLabel>
                  <FormControl>
                    <ChurchCombobox
                      value={field.value}
                      churches={churches}
                      onChange={(value) =>
                        form.setValue("churchName", value, {
                          shouldValidate: true,
                        })
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </FormProvider>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={working}
          >
            Болих
          </Button>
          <Button type="submit" form="admin-attendee-form" disabled={working}>
            {working
              ? "Хадгалж байна..."
              : mode === "add"
                ? "Нэмэх"
                : "Хадгалах"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
