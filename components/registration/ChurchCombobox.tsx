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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  findCloseChurchNames,
  isSameChurchName,
  normalizeChurchName,
} from "@/lib/registration/churchName";
import { cn } from "@/lib/utils";

const DESKTOP = "(min-width: 640px)";

function useIsDesktop() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(DESKTOP);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP).matches,
    () => false,
  );
}

const ITEM = "rounded-lg py-2.5 text-[15px] sm:py-2";

export const ChurchCombobox = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    onChange: (value: string) => void;
    onSelected?: () => void;
    onCreate?: (name: string) => void;
    churches: string[];
    className?: string;
    // Handed down by FormControl so the label, error text and red border
    // reach the trigger.
    id?: string;
    "aria-invalid"?: React.AriaAttributes["aria-invalid"];
    "aria-describedby"?: string;
  }
>(({ value, onChange, onSelected, onCreate, churches, className, ...aria }, ref) => {
  const isDesktop = useIsDesktop();
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

  const picker = (
    <Command shouldFilter={false} className="min-h-0 flex-1">
      <CommandInput
        placeholder="Хайх эсвэл шинээр үүсгэх"
        className="h-12 text-base"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-none flex-1 overscroll-contain sm:max-h-[min(20rem,calc(var(--radix-popover-content-available-height)-3.5rem))]">
        <CommandEmpty>Олдсонгүй</CommandEmpty>
        <CommandGroup>
          {results.slice(0, 30).map((church) => (
            <CommandItem
              key={church}
              value={church}
              onSelect={() => selectChurch(church)}
              className={ITEM}
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
          <CommandGroup heading="Ойролцоо нэртэй цуглаанууд">
            {closeMatches.map((church) => (
              <CommandItem
                key={church}
                value={`suggestion-${church}`}
                onSelect={() => selectChurch(church)}
                className={ITEM}
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
              className={ITEM}
            >
              <span className="font-semibold text-brand-ink">
                + &quot;{trimmed}&quot; нэмэх
              </span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );

  return (
    <>
      <Popover open={open && isDesktop} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            {...aria}
            ref={ref}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between font-normal", className)}
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value || "Цуглааны нэрээр хайх"}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="flex w-[var(--radix-popover-trigger-width)] flex-col overflow-hidden rounded-2xl p-0 shadow-[0_12px_40px_rgba(21,23,28,0.14)] [&_[data-slot=command-input-wrapper]]:h-12"
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
        >
          {picker}
        </PopoverContent>
      </Popover>

      {/* On a phone a popover fights the keyboard and covers the form, so the
          list opens as a sheet instead. The keyboard waits until they tap search. */}
      <Sheet open={open && !isDesktop} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="h-[85dvh] gap-0 rounded-t-3xl px-2 pb-[env(safe-area-inset-bottom)] [&_[data-slot=command-input-wrapper]]:mx-2 [&_[data-slot=command-input-wrapper]]:h-12 [&_[data-slot=command-input-wrapper]]:rounded-xl [&_[data-slot=command-input-wrapper]]:border [&_[data-slot=command-input-wrapper]]:border-black/10 [&_[data-slot=command-input-wrapper]]:bg-black/[0.03]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-black/15" />
          <SheetTitle className="px-4 pt-3 pb-3 text-lg">Цуглаа сонгох</SheetTitle>
          <SheetDescription className="sr-only">Цуглааныхаа нэрээр хайж сонгоно уу.</SheetDescription>
          {picker}
        </SheetContent>
      </Sheet>

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
