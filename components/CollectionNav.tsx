import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

/** Chip links to every product collection; `active` highlights the current one. */
export default function CollectionNav({ active, className = "" }: { active?: string; className?: string }) {
  const base =
    "inline-flex items-center whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors";
  return (
    <nav aria-label="Product collections" className={className}>
      <ul className="flex flex-wrap justify-center gap-2.5">
        <li>
          <Link
            href="/products"
            className={`${base} ${!active ? "bg-[#17120d] text-white" : "bg-white text-stone-700 ring-1 ring-stone-200 hover:ring-[#b87333]/60 hover:text-[#A8602A]"}`}
          >
            All products
          </Link>
        </li>
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/collections/${c.slug}`}
              aria-current={active === c.slug ? "page" : undefined}
              className={`${base} ${
                active === c.slug
                  ? "bg-[#17120d] text-white"
                  : "bg-white text-stone-700 ring-1 ring-stone-200 hover:ring-[#b87333]/60 hover:text-[#A8602A]"
              }`}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
