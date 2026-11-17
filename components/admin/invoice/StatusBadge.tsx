import { STATUS_LABELS_ADMIN, type InvoiceStatus } from "@/lib/invoice/i18n";

const STYLE: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-[#E6F0F8] text-[#1F5F8F]",
  paid: "bg-[#E7F4EC] text-[#1F6B45]",
  overdue: "bg-[#FDECEC] text-[#B42318]",
  cancelled: "bg-gray-100 text-gray-500 line-through",
};

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLE[status]}`}>
      {STATUS_LABELS_ADMIN[status]}
    </span>
  );
}
