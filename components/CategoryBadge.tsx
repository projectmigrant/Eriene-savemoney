import { CATEGORY_COLORS, type Category } from "@/lib/categories";

// 像小印章的分類標記：取分類第一個字，配上分類色
export default function CategoryBadge({ category }: { category: Category }) {
  const color = CATEGORY_COLORS[category];
  return (
    <span
      className="grid size-10 shrink-0 -rotate-6 place-items-center rounded-full border-2 text-base font-bold"
      style={{ borderColor: color, color, backgroundColor: `${color}14` }}
    >
      {category[0]}
    </span>
  );
}
