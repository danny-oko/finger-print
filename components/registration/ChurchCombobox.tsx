"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  findCloseChurchNames,
  isSameChurchName,
  normalizeChurchName,
} from "@/lib/registration/churchName";
import { cn } from "@/lib/utils";

export const ChurchCombobox = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    onChange: (value: string) => void;
    onSelected?: () => void;
    onCreate?: (name: string) => void;
    churches: string[];
  }
>(({ value, onChange, onSelected, onCreate, churches }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [pendingCreate, setPendingCreate] = React.useState<string | null>(null);

  const trimmed = search.trim();
  const normalizedTrimmed = normalizeChurchName(trimmed);

  const exactMatch = React.useMemo(
    () =>
      trimmed.length > 0
        ? churches.find((c) => isSameChurchName(c, trimmed))
        : undefined,
    [churches, trimmed],
  );

  const results = React.useMemo(() => {
    const filtered = churches.filter(
      (c) =>
        !trimmed ||
        c.toLowerCase().includes(trimmed.toLowerCase()) ||
        (normalizedTrimmed.length > 0 &&
          normalizeChurchName(c).includes(normalizedTrimmed)),
    );

    return exactMatch && !filtered.includes(exactMatch)
      ? [exactMatch, ...filtered]
      : filtered;
  }, [churches, trimmed, normalizedTrimmed, exactMatch]);

  const closeMatches = React.useMemo(() => {
    if (exactMatch || trimmed.length < 2) return [];
    return findCloseChurchNames(trimmed, churches, 5).filter(
      (c) => !results.includes(c),
    );
  }, [churches, trimmed, exactMatch, results]);

  const showCreateOption = trimmed.length > 1 && !exactMatch;

  function selectChurch(church: string) {
    onChange(church);
    setOpen(false);
    setSearch("");
    onSelected?.();
  }

  function createChurch(name: string) {
    onChange(name);
    onCreate?.(name);
    setOpen(false);
    setSearch("");
    onSelected?.();
  }

  function handleCreateRequest() {
    if (closeMatches.length > 0) {
      setPendingCreate(trimmed);
      setOpen(false);
    } else {
      createChurch(trimmed);
    }
  }

  return (
    <>
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
              {value || "Цуглааныхаа нэр хайх эсвэл сонгох"}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          // Church lists run long and this is the slowest control on the
          // form, so the list gets as much height as the viewport allows and
          // rows get a real touch target. The input wrapper is a fixed h-9 in
          // the shared primitive, so it's raised from here rather than by
          // changing it for every other Command in the app.
          //
          // The width needs var(): Tailwind v3 read a bare `w-[--foo]` as a
          // variable, v4 does not, so this had been silently falling back to
          // the popover's own width instead of matching the trigger.
          className="w-[var(--radix-popover-trigger-width)] p-0 [&_[data-slot=command-input-wrapper]]:h-12"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Цуглааны нэрээр хайх..."
              className="text-base"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="max-h-[min(60vh,26rem)]">
              <CommandEmpty>Олдсонгүй</CommandEmpty>
              <CommandGroup>
                {results.slice(0, 30).map((church) => (
                  <CommandItem
                    key={church}
                    value={church}
                    onSelect={() => selectChurch(church)}
                    className="py-3 text-base"
                  >
                    <Check
                      className={cn(
                        "size-4",
                        value === church ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {church}
                  </CommandItem>
                ))}
              </CommandGroup>

              {closeMatches.length > 0 && (
                <CommandGroup heading="Санал болгож буй ижил төстэй сүмүүд">
                  {closeMatches.map((church) => (
                    <CommandItem
                      key={church}
                      value={`suggestion-${church}`}
                      onSelect={() => selectChurch(church)}
                      className="py-3 text-base"
                    >
                      <Check
                        className={cn(
                          "size-4",
                          value === church ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {church}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {showCreateOption && (
                <CommandGroup>
                  <CommandItem
                    value={`create-${trimmed}`}
                    onSelect={handleCreateRequest}
                  >
                    <span className="text-[#F98C01]">
                      + &quot;{trimmed}&quot; нэмэх
                    </span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <AlertDialog
        open={pendingCreate !== null}
        onOpenChange={(next) => !next && setPendingCreate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ижил төстэй сүм олдлоо</AlertDialogTitle>
            <AlertDialogDescription>
              Та &quot;{pendingCreate}&quot; гэж бичлээ. Жагсаалтад ойролцоо
              нэртэй дараах сүмүүд бүртгэлтэй байна — эдгээрийн аль нэг мөн үү,
              эсвэл үнэхээр өөр шинэ сүм үү?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-1.5">
            {closeMatches.map((church) => (
              <Button
                key={church}
                type="button"
                variant="outline"
                className="justify-start font-normal"
                onClick={() => {
                  selectChurch(church);
                  setPendingCreate(null);
                }}
              >
                <Check className="size-4 opacity-0" />
                {church}
              </Button>
            ))}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingCreate) createChurch(pendingCreate);
              }}
            >
              Үгүй, шинэ сүм үүсгэх
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

ChurchCombobox.displayName = "ChurchCombobox";
