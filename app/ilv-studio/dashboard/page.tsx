import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin-auth";
import DashboardGreeting from "@/components/admin/DashboardGreeting";
import CountUpNumber from "@/components/animations/CountUpNumber";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Eye,
  Plus,
  ArrowRight,
  ArrowUpRight,
  Pencil,
  Upload,
  FileText,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDashboardStats() {
  try {
    const [totalProducts, totalImages] = await Promise.all([
      prisma.product.count(),
      prisma.productImage.count(),
    ]);

    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          where: { isFeatured: true },
          take: 1,
        },
      },
    });

    return {
      totalProducts,
      totalImages,
      recentProducts,
    };
  } catch (error) {
    console.warn("Database lookup in dashboard stats failed:", error);
    return {
      totalProducts: 0,
      totalImages: 0,
      recentProducts: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const session = await requireAdminPage();
  const stats = await getDashboardStats();
  const name = session.user?.name || "Admin";
  const perProduct =
    stats.totalProducts > 0 ? Math.round((stats.totalImages / stats.totalProducts) * 10) / 10 : 0;

  const statCards = [
    { label: "Total produk", value: stats.totalProducts, icon: Package, hint: "di katalog", count: true },
    { label: "Total foto", value: stats.totalImages, icon: ImageIcon, hint: "semua produk", count: true },
    { label: "Foto per produk", value: perProduct, icon: Layers, hint: "rata-rata", count: false },
    { label: "Produk terbaru", value: stats.recentProducts.length, icon: Sparkles, hint: "5 terakhir", count: true },
  ];

  const actions = [
    { label: "Tambah produk", text: "Buat produk baru", href: "/ilv-studio/products/new", icon: Plus },
    { label: "Upload galeri", text: "Foto & video workshop", href: "/ilv-studio/gallery/new", icon: Upload },
    { label: "Invoice baru", text: "Buat & kirim invoice", href: "/ilv-studio/invoice/baru", icon: FileText },
    { label: "Statistik", text: "Pengunjung & sumber", href: "/ilv-studio/statistik", icon: BarChart3 },
  ];

  return (
    <div className="admin-rise space-y-6 max-w-7xl">
      {/* Hero */}
      <section className="glass rounded-[1.75rem] p-5 sm:p-7 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,#f0b07c_0%,transparent_70%)] opacity-60"
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9e5b24] mb-3">
              <span className="admin-live w-1.5 h-1.5 rounded-full bg-emerald-500 text-emerald-500" />
              Studio aktif
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">
              Halo, {name.split(" ")[0]}
            </h1>
            <p className="text-stone-600 mt-1.5">Ringkasan konten dan aktivitas website hari ini.</p>
          </div>
          <DashboardGreeting name={name} initialNow={Date.now()} />
        </div>
      </section>

      {/* Stats */}
      <section className="admin-rise grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass admin-tile rounded-[1.5rem] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2 mb-5">
                <span className="admin-chip w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-medium text-stone-500 bg-white/70 rounded-full px-2 py-0.5 truncate">
                  {card.hint}
                </span>
              </div>
              <p className="text-sm text-stone-500">{card.label}</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-900 tabular-nums mt-0.5">
                {card.count ? <CountUpNumber value={card.value} /> : card.value}
              </p>
            </div>
          );
        })}
      </section>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Recent products */}
        <section className="glass rounded-[1.75rem] lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3">
            <div>
              <h2 className="font-semibold text-stone-900 text-lg">Produk terbaru</h2>
              <p className="text-sm text-stone-500">Tambahan terakhir ke katalog</p>
            </div>
            <Link
              href="/ilv-studio/products"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-[#9e5b24] hover:text-[#7d441a] rounded-full px-3 py-1.5 hover:bg-white/70 transition"
            >
              Semua
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {stats.recentProducts.length === 0 ? (
            <div className="px-6 pb-10 pt-6 text-center">
              <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-600 mb-4">Belum ada produk</p>
              <Link
                href="/ilv-studio/products/new"
                className="admin-chip inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              >
                <Plus className="w-4 h-4" /> Tambah produk pertama
              </Link>
            </div>
          ) : (
            <ul className="admin-rise px-2 sm:px-3 pb-3">
              {stats.recentProducts.map((product) => (
                <li key={product.id}>
                  <div className="group flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl hover:bg-white/60 transition-colors duration-300">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/70 ring-1 ring-white shrink-0">
                      {product.images[0]?.imageUrl ? (
                        <Image
                          src={product.images[0].imageUrl}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-stone-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 truncate">{product.name}</p>
                      <p className="text-sm text-stone-500 truncate">{product.description || "Tanpa deskripsi"}</p>
                    </div>
                    <p className="hidden sm:block text-xs text-stone-500 text-right shrink-0">
                      {new Date(product.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/ilv-studio/products/${product.id}/edit`}
                        title="Edit"
                        aria-label={`Edit ${product.name}`}
                        className="p-2 rounded-xl text-stone-500 hover:text-[#9e5b24] hover:bg-white transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        title="Lihat"
                        aria-label={`Lihat ${product.name} di website`}
                        className="p-2 rounded-xl text-stone-500 hover:text-[#9e5b24] hover:bg-white transition"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick actions */}
        <section className="glass rounded-[1.75rem] p-3">
          <h2 className="font-semibold text-stone-900 text-lg px-3 pt-2 pb-2">Aksi cepat</h2>
          <ul className="admin-rise space-y-1.5">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <li key={a.href}>
                  <Link
                    href={a.href}
                    className="admin-tile group flex items-center gap-3 rounded-2xl p-3 bg-white/40 hover:bg-white/75"
                  >
                    <span className="admin-chip w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-stone-900">{a.label}</span>
                      <span className="block text-sm text-stone-500 truncate">{a.text}</span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-stone-400 transition-all duration-300 group-hover:text-[#9e5b24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
