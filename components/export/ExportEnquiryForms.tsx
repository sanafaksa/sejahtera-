"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle, Building2, Home } from "lucide-react";

type Status = "idle" | "sending" | "success" | "error";

/** Labelled input/textarea. Keeps the two forms compact and consistent. */
function Field({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  textarea,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  const base =
    "w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-black focus:border-[#A8602A] focus:outline-none focus:bg-white transition-colors";
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-900 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          required={required}
          rows={3}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
          className={base}
        />
      )}
    </div>
  );
}

function StatusBanner({ status }: { status: Status }) {
  if (status === "success")
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        <p className="text-green-800 font-medium">
          Enquiry sent. Our team will reply with a quotation and specifications.
        </p>
      </div>
    );
  if (status === "error")
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <p className="text-red-800 font-medium">
          Something went wrong. Please try again or email marketing@ilavioo.com.
        </p>
      </div>
    );
  return null;
}

const TRADE_INIT = {
  company: "",
  name: "",
  email: "",
  projectType: "",
  country: "",
  categories: "",
  quantity: "",
  dimensions: "",
  references: "",
  finish: "",
  procurement: "",
};
const HOME_INIT = {
  name: "",
  email: "",
  country: "",
  product: "",
  quantity: "",
  dimensions: "",
  finish: "",
  context: "",
  references: "",
};

async function submitEnquiry(subject: string, lines: [string, string][]) {
  const first = lines.find(([l]) => l === "Contact name" || l === "Name");
  const email = lines.find(([l]) => l === "Email")?.[1] ?? "";
  const message = [subject, "", ...lines.filter(([, v]) => v.trim()).map(([l, v]) => `${l}: ${v}`)].join("\n");
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: first?.[1] || "Website enquiry",
      email,
      subject,
      message,
      company: "", // honeypot stays empty
    }),
  });
  if (!res.ok) throw new Error("request failed");
}

export default function ExportEnquiryForms() {
  const [tab, setTab] = useState<"trade" | "home">("trade");
  const [trade, setTrade] = useState(TRADE_INIT);
  const [home, setHome] = useState(HOME_INIT);
  const [status, setStatus] = useState<Status>("idle");

  const setT = (name: string, value: string) => setTrade((p) => ({ ...p, [name]: value }));
  const setH = (name: string, value: string) => setHome((p) => ({ ...p, [name]: value }));

  const submitTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitEnquiry("Trade / hospitality project enquiry", [
        ["Company or studio", trade.company],
        ["Contact name", trade.name],
        ["Email", trade.email],
        ["Project type", trade.projectType],
        ["Country", trade.country],
        ["Product categories", trade.categories],
        ["Quantity", trade.quantity],
        ["Dimensions", trade.dimensions],
        ["Preferred finish", trade.finish],
        ["Procurement requirements", trade.procurement],
        ["Drawings / reference images (links)", trade.references],
      ]);
      setStatus("success");
      setTrade(TRADE_INIT);
    } catch {
      setStatus("error");
    }
  };

  const submitHome = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitEnquiry("Home product enquiry", [
        ["Name", home.name],
        ["Email", home.email],
        ["Country", home.country],
        ["Product of interest", home.product],
        ["Quantity", home.quantity],
        ["Dimensions", home.dimensions],
        ["Preferred finish", home.finish],
        ["Room or project context", home.context],
        ["Reference images (links)", home.references],
      ]);
      setStatus("success");
      setHome(HOME_INIT);
    } catch {
      setStatus("error");
    }
  };

  const sending = status === "sending";

  return (
    <div>
      {/* Path toggle */}
      <div className="inline-flex rounded-full border-2 border-gray-200 bg-white p-1 mb-8">
        <button
          type="button"
          onClick={() => { setTab("trade"); setStatus("idle"); }}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            tab === "trade" ? "bg-[#17120d] text-[#e5be9c]" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Building2 className="w-4 h-4" /> Trade &amp; hospitality
        </button>
        <button
          type="button"
          onClick={() => { setTab("home"); setStatus("idle"); }}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            tab === "home" ? "bg-[#17120d] text-[#e5be9c]" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Home className="w-4 h-4" /> Private home
        </button>
      </div>

      {tab === "trade" ? (
        <form onSubmit={submitTrade} className="space-y-5" aria-label="Trade and project enquiry">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Company or studio" name="company" value={trade.company} onChange={setT} placeholder="Studio or company name" />
            <Field label="Contact name" name="name" value={trade.name} onChange={setT} required placeholder="Your name" />
            <Field label="Email" name="email" type="email" value={trade.email} onChange={setT} required placeholder="you@company.com" />
            <Field label="Project type" name="projectType" value={trade.projectType} onChange={setT} placeholder="Hotel, resort, residence, retail…" />
            <Field label="Country" name="country" value={trade.country} onChange={setT} placeholder="Destination country" />
            <Field label="Product categories" name="categories" value={trade.categories} onChange={setT} placeholder="Bathtubs, basins, doors, panels…" />
            <Field label="Quantity" name="quantity" value={trade.quantity} onChange={setT} placeholder="e.g. 12 bathtubs, 30 basins" />
            <Field label="Dimensions" name="dimensions" value={trade.dimensions} onChange={setT} placeholder="Sizes per item" />
            <Field label="Preferred finish" name="finish" value={trade.finish} onChange={setT} placeholder="Polished, hammered, antique patina…" />
            <Field label="Procurement requirements" name="procurement" value={trade.procurement} onChange={setT} placeholder="Specs, lead time, documentation…" />
          </div>
          <Field label="Drawings or reference images (links)" name="references" value={trade.references} onChange={setT} textarea placeholder="Paste links to drawings, CAD files or reference images" />
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full copper-metal text-white font-semibold relative overflow-hidden hover:brightness-[1.06] transition-[filter] disabled:opacity-60"
          >
            <Send className="w-4 h-4" /> {sending ? "Sending…" : "Request a Trade Project Quote"}
          </button>
          <StatusBanner status={status} />
        </form>
      ) : (
        <form onSubmit={submitHome} className="space-y-5" aria-label="Private home enquiry">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Name" name="name" value={home.name} onChange={setH} required placeholder="Your name" />
            <Field label="Email" name="email" type="email" value={home.email} onChange={setH} required placeholder="you@email.com" />
            <Field label="Country" name="country" value={home.country} onChange={setH} placeholder="Delivery country" />
            <Field label="Product of interest" name="product" value={home.product} onChange={setH} placeholder="Copper bathtub, wash basin…" />
            <Field label="Quantity" name="quantity" value={home.quantity} onChange={setH} placeholder="e.g. 1 bathtub" />
            <Field label="Dimensions" name="dimensions" value={home.dimensions} onChange={setH} placeholder="Desired size" />
            <Field label="Preferred finish" name="finish" value={home.finish} onChange={setH} placeholder="Polished, hammered, antique patina…" />
            <Field label="Room or project context" name="context" value={home.context} onChange={setH} placeholder="Bathroom, powder room, renovation…" />
          </div>
          <Field label="Reference images (links)" name="references" value={home.references} onChange={setH} textarea placeholder="Paste links to inspiration or reference images" />
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full copper-metal text-white font-semibold relative overflow-hidden hover:brightness-[1.06] transition-[filter] disabled:opacity-60"
          >
            <Send className="w-4 h-4" /> {sending ? "Sending…" : "Request a Home Product Quote"}
          </button>
          <StatusBanner status={status} />
        </form>
      )}
    </div>
  );
}
