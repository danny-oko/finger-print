"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const ChurchCombobox = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    onChange: (value: string) => void;
    onSelected?: () => void;
    churches: string[];
  }
>(({ value, onChange, onSelected, churches }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const trimmed = search.trim();
  const showCreateOption =
    trimmed.length > 1 && !churches.some((c) => c.toLowerCase() === trimmed.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || "Сүмээ хайх эсвэл сонгох"}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Сүмийн нэрээр хайх..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Олдсонгүй</CommandEmpty>
            <CommandGroup>
              {churches
                .filter((c) => c.toLowerCase().includes(trimmed.toLowerCase()))
                .slice(0, 30)
                .map((church) => (
                  <CommandItem
                    key={church}
                    value={church}
                    onSelect={() => {
                      onChange(church);
                      setOpen(false);
                      setSearch("");
                      onSelected?.();
                    }}
                  >
                    <Check
                      className={cn("size-4", value === church ? "opacity-100" : "opacity-0")}
                    />
                    {church}
                  </CommandItem>
                ))}
              {showCreateOption && (
                <CommandItem
                  value={trimmed}
                  onSelect={() => {
                    onChange(trimmed);
                    setOpen(false);
                    setSearch("");
                    onSelected?.();
                  }}
                >
                  <span className="text-[#F98C01]">+ &quot;{trimmed}&quot; нэмэх</span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

ChurchCombobox.displayName = "ChurchCombobox";
