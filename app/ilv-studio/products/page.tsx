import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import { Plus, Pencil, Eye, ExternalLink, Image as ImageIcon, Package, Search } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

async function getProducts(query: string) {
  const where: Prisma.ProductWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};
  try {
    return await prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: [{ isFeatured: "desc" }, { isCatalog: "desc" }, { id: "asc" }],
          take: 1,
        },
        specifications: { select: { price: true } },
        _count: { select: { images: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Failed to fetch products for admin:", error);
    return [];
  }
}

type AdminProduct = Awaited<ReturnType<typeof getProducts>>[number];

const formatDate = (d: Date) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const iconBtn = "p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors";

function Thumb({ product, size }: { product: AdminProduct; size: number }) {
  return product.images[0] ? (
    <Image
      src={product.images[0].imageUrl}
      alt={product.name}
      width={size}
      height={size}
      className="rounded-lg object-cover shrink-0 bg-gray-100"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="rounded-lg bg-gray-100 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <ImageIcon className="text-gray-400" size={20} />
    </div>
  );
}

function Actions({ product }: { product: AdminProduct }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/ilv-studio/products/${product.id}`} className={iconBtn} title="View" aria-label={`View ${product.name}`}>
        <Eye size={18} />
      </Link>
      <Link
        href={`/ilv-studio/products/${product.id}/edit`}
        className={iconBtn}
        title="Edit"
        aria-label={`Edit ${product.name}`}
      >
        <Pencil size={18} />
      </Link>
      <a
        href={`/products/${product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        title="Open on website"
        aria-label={`Open ${product.name} on website`}
      >
        <ExternalLink size={18} />
      </a>
      <DeleteProductButton productId={product.id} productName={product.name} />
    </div>
  );
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  const products = await getProducts(query);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Products</h1>
          <p className="text-gray-600">
            Manage your copper craft products
            {products.length > 0 && <span className="text-gray-400"> · {products.length} items</span>}
          </p>
        </div>
        <Link
          href="/ilv-studio/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#A8602A] hover:bg-[#8f4f21] text-white px-4 py-2 text-sm font-semibold transition-colors self-start sm:self-auto"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <form className="flex gap-3" role="search">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name, slug or description…"
            aria-label="Search products"
            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A8602A]/40"
          />
        </div>
        <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Search
        </button>
        {query && (
          <Link href="/ilv-studio/products" className="self-center text-sm text-gray-500 hover:text-gray-800">
            Clear
          </Link>
        )}
      </form>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 px-6 text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-[#A8602A]" size={26} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {query ? "No products match your search" : "No products yet"}
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            {query ? "Try another keyword." : "Get started by creating your first copper craft product."}
          </p>
          {!query && (
            <Link
              href="/ilv-studio/products/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#A8602A] hover:bg-[#8f4f21] text-white px-4 py-2 text-sm font-semibold"
            >
              <Plus size={18} />
              Add your first product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium text-center">Images</th>
                  <th className="px-3 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Thumb product={product} size={52} />
                        <div className="min-w-0">
                          <Link
                            href={`/ilv-studio/products/${product.id}/edit`}
                            className="font-semibold text-gray-900 hover:text-[#A8602A] line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-md">
                            {product.description || "No description"}
                          </p>
                          <p className="text-[11px] font-mono text-gray-400 line-clamp-1">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700">{product.specifications?.price || "–"}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex min-w-8 justify-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {product._count.images}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-600">{formatDate(product.createdAt)}</td>
                    <td className="px-5 py-2">
                      <Actions product={product} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-gray-100">
            {products.map((product) => (
              <li key={product.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Thumb product={product} size={64} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/ilv-studio/products/${product.id}/edit`}
                      className="font-semibold text-gray-900 line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description || "No description"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.specifications?.price || "No price"} · {product._count.images} images ·{" "}
                      {formatDate(product.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 -mr-2">
                  <Actions product={product} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
