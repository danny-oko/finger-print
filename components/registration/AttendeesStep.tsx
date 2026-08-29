"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { AttendeeFields } from "@/components/registration/AttendeeFields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RegistrationFormValues } from "@/lib/registration/schema";

const BLANK_ATTENDEE: RegistrationFormValues["attendees"][number] = {
  fullName: "",
  age: undefined,
  phone: "",
  email: "",
  parentPhone: "",
  churchName: "",
  grade: undefined,
};

export function AttendeesStep({ churches }: { churches: string[] }) {
  const { control } = useFormContext<RegistrationFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "attendees" });

  return (
    <div className="grid gap-4">
      {fields.map((field, index) => (
        <Card key={field.id} className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{index + 1}-р хүүхэд</CardTitle>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                aria-label="Хасах"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <AttendeeFields
              namePrefix={`attendees.${index}`}
              churches={churches}
              phoneRequired={false}
            />
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => append(BLANK_ATTENDEE)}
      >
        <Plus className="size-4" />
        Хүүхэд нэмэх
      </Button>
    </div>
  );
}
