export const CATEGORY_COLORS = [
  { key: "blue", hex: "#4285F4" },
  { key: "red", hex: "#DB4437" },
  { key: "orange", hex: "#F4511E" },
  { key: "amber", hex: "#F9AB00" },
  { key: "green", hex: "#34A853" },
  { key: "teal", hex: "#009688" },
  { key: "purple", hex: "#8E44AD" },
  { key: "pink", hex: "#D81B60" },
  { key: "indigo", hex: "#3F51B5" },
  { key: "brown", hex: "#795548" },
  { key: "slate", hex: "#546E7A" },
  { key: "cyan", hex: "#00ACC1" },
] as const;

export function getCategoryColor(colorKey?: string | null): string {
  return CATEGORY_COLORS.find((color) => color.key === colorKey)?.hex ?? "#64748B";
}
