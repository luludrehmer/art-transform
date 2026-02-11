"use client";

import { useState } from "react";
import { ChevronDown, Brush, Sparkles, Crown, Gem, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";
import { allStyles, styleData } from "@/lib/styles";
import { STYLE_PRESET_LABELS, type StylePresetId } from "@/lib/style-presets";
import { STYLE_PRESET_IMAGES } from "@/lib/preset-images";
import type { ArtStyle } from "@shared/schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const STYLE_PRESET_IDS: StylePresetId[] = ["none", "neoclassical", "royal_noble", "heritage"];

const PRESET_ICONS: Record<StylePresetId, typeof Brush> = {
  none: Brush,
  intelligent: Sparkles,
  neoclassical: Crown,
  royal_noble: Gem,
  heritage: TreePine,
};

/** Gradient/visual for preset "thumbnail" (no image asset). */
const PRESET_THUMB_STYLES: Record<StylePresetId, string> = {
  none: "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700",
  intelligent: "from-violet-100 to-fuchsia-100 dark:from-violet-900/50 dark:to-fuchsia-900/50",
  neoclassical: "from-amber-100 to-amber-200/80 dark:from-amber-900/50 dark:to-yellow-900/50",
  royal_noble: "from-rose-100 to-amber-100 dark:from-rose-900/50 dark:to-amber-900/50",
  heritage: "from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50",
};

interface StylePickerProps {
  selectedStyle: ArtStyle;
  onSelect: (style: ArtStyle) => void;
  selectedStylePreset?: StylePresetId;
  onStylePresetSelect?: (preset: StylePresetId) => void;
  disabled?: boolean;
  stepLabel: string;
}

/* Card styles — only the selected card has visible ring + tinted bg; unselected are plain */
const cardBase =
  "flex flex-col items-center rounded-lg p-1.5 transition-all text-left font-sans cursor-pointer " +
  "outline-none focus:outline-none focus-visible:outline-none";
const cardSelected = "ring-2 ring-primary bg-primary/10";
const cardDefault = "opacity-75 hover:opacity-100 hover:bg-muted/20";
const cardLabel = "text-[8.5px] font-medium mt-1.5 line-clamp-1 w-full text-center leading-tight";

function StyleGrid({
  selectedStyle,
  onSelect,
  onPick,
  className,
}: {
  selectedStyle: ArtStyle;
  onSelect: (style: ArtStyle) => void;
  onPick?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-3 gap-2.5", className)}>
      {allStyles.map((style) => {
        const isSelected = selectedStyle === style.id;
        return (
          <button
            key={style.id}
            type="button"
            onClick={() => {
              onSelect(style.id as ArtStyle);
              onPick?.();
            }}
            className={cn(cardBase, isSelected ? cardSelected : cardDefault)}
            data-testid={`button-style-${style.id}`}
          >
            <div className="w-full aspect-square rounded-md overflow-hidden flex-shrink-0 bg-muted min-h-0">
              <img src={style.image} alt="" className="w-full h-full object-cover" />
            </div>
            <span className={cn(cardLabel, isSelected ? "text-primary font-semibold" : "text-foreground")}>
              {style.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function StylePicker({
  selectedStyle,
  onSelect,
  selectedStylePreset = "none",
  onStylePresetSelect,
  disabled = false,
  stepLabel,
}: StylePickerProps) {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const current = styleData[selectedStyle];
  const trigger = (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 px-1 py-0.5 text-left transition-all min-h-0",
        "hover:opacity-70 focus:outline-none",
        "disabled:opacity-50 disabled:pointer-events-none"
      )}
      data-testid="style-picker-trigger"
    >
      <span className="font-sans text-[11px] text-muted-foreground/60 whitespace-nowrap">Choose a style</span>
      <ChevronDown className="w-2.5 h-2.5 text-muted-foreground/40 flex-shrink-0" />
    </button>
  );

  const SectionTitle = ({ children, className }: { children: string; className?: string }) => (
    <h3 className={cn("text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2.5 [font-family:var(--font-sans)]", className)}>
      {children}
    </h3>
  );

  /* Mood cards — close dropdown on click */
  const renderPresetSection = (onPick?: () => void) => (
    <div className="mb-8">
      <SectionTitle>Mood</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {STYLE_PRESET_IDS.map((id) => {
          const Icon = PRESET_ICONS[id];
          const isSelected = selectedStylePreset === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => { onStylePresetSelect?.(id); onPick?.(); }}
              className={cn(cardBase, isSelected ? cardSelected : cardDefault)}
              data-testid={`style-preset-${id}`}
            >
              <div className="w-full aspect-square rounded-md overflow-hidden flex-shrink-0 bg-muted min-h-0">
                {STYLE_PRESET_IMAGES[id] ? (
                  <img src={STYLE_PRESET_IMAGES[id]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className={cn(
                      "h-full w-full bg-gradient-to-br flex items-center justify-center",
                      PRESET_THUMB_STYLES[id]
                    )}
                  >
                    <Icon
                      className={cn("w-6 h-6", isSelected ? "text-primary" : "text-muted-foreground")}
                      strokeWidth={1.5}
                    />
                  </div>
                )}
              </div>
              <span className={cn(cardLabel, isSelected ? "text-primary font-semibold" : "text-foreground")}>
                {STYLE_PRESET_LABELS[id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="font-sans rounded-none border-0 h-[100dvh] max-h-[100dvh] w-full flex flex-col pt-14 pb-8 px-4 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
        >
          <SheetHeader className="text-left pb-3 border-b border-border/50">
            <SheetTitle className="text-base font-semibold text-foreground font-sans">
              {stepLabel}
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto flex-1 py-5 -mx-1 px-1 space-y-6">
            {renderPresetSection(() => setSheetOpen(false))}
            <div>
              <SectionTitle>Medium</SectionTitle>
              <StyleGrid
                selectedStyle={selectedStyle}
                onSelect={onSelect}
                onPick={() => setSheetOpen(false)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        className="font-sans w-[min(calc(100vw-2rem),400px)] p-4"
        sideOffset={8}
      >
        <p className="text-xs font-medium text-foreground mb-4">{stepLabel}</p>
        {renderPresetSection(() => setPopoverOpen(false))}
        <div className="mt-0.5">
          <SectionTitle>Medium</SectionTitle>
          <StyleGrid
            selectedStyle={selectedStyle}
            onSelect={(style) => {
              onSelect(style);
              setPopoverOpen(false);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
