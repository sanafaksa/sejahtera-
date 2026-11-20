import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Ilavioo",
  description:
    "How PT. Ilavioo Nusantara Sejahtera collects, uses and protects information when you visit our website or order handcrafted copper from Tumang.",
};

const EMAIL = "marketing@ilavioo.com";

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <p>
        This website is operated by <strong>PT. Ilavioo Nusantara Sejahtera</strong> (&quot;Ilavioo&quot;,
        &quot;we&quot;, &quot;us&quot;), a maker of handcrafted copper and brass products based in Tumang, Cepogo,
        Boyolali, Central Java, Indonesia. We are responsible for the personal data described in this policy. You can
        reach us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
      </p>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: (
      <>
        <p>
          <strong>Information you give us.</strong> When you use our contact form or write to us, we receive your
          name, email address, and optionally your phone number, subject and message. When you request a quotation or
          place an order, we may also collect your company name, delivery address, country and the details needed to
          prepare your invoice.
        </p>
        <p>
          <strong>Anonymous visit statistics.</strong> To understand which products and countries interest our
          visitors, our server records each page view with: the page visited, the approximate country, region, city
          and time zone (derived from your connection at the moment of the visit), the type of device, operating system
          and browser, and how you arrived (for example a search engine, social media or a campaign link). We{" "}
          <strong>do not store your IP address</strong>, and we do not use this data to identify you personally.
        </p>
        <p>
          We do not use third-party advertising trackers or sell any data.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <>
        <p>We use a small number of first-party cookies:</p>
        <ul>
          <li>
            <strong>ilv_vid</strong>: a random identifier that lets us count unique visitors without knowing who you
            are. It expires after 12 months.
          </li>
          <li>
            <strong>ilv_src</strong>: remembers how you arrived on the site (for example &quot;Instagram&quot;) for 30
            minutes, so pages you open afterwards are attributed correctly.
          </li>
          <li>Essential cookies used only by our staff to sign in to the administration area.</li>
        </ul>
        <p>
          You can block or delete cookies in your browser settings. The website will continue to work; we simply
          won&apos;t be able to distinguish returning visitors.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: (
      <ul>
        <li>To reply to your enquiries and prepare quotations.</li>
        <li>To produce, ship and invoice your order, and to keep the records required by law.</li>
        <li>To understand which products and markets are of interest and to improve our website and catalogue.</li>
        <li>To keep the website secure and prevent misuse.</li>
      </ul>
    ),
  },
  {
    id: "legal-basis",
    title: "Legal basis",
    body: (
      <p>
        We process personal data to take steps at your request before entering into a contract and to perform that
        contract (enquiries, quotations and orders), to comply with legal obligations (accounting and tax records),
        and on the basis of our legitimate interest in running and improving our business (anonymous statistics and
        security). This policy is intended to meet Indonesia&apos;s Personal Data Protection Law (Law No. 27 of 2022)
        and, for visitors in the European Economic Area and the United Kingdom, the GDPR.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Service providers and international transfers",
    body: (
      <>
        <p>We use trusted providers that process data on our behalf, only as needed to run this website:</p>
        <ul>
          <li>
            <strong>Vercel</strong>: website hosting. Requests are served from data centres close to you and processed
            in Singapore.
          </li>
          <li>
            <strong>Supabase</strong>: database hosting in Singapore (visit statistics, invoices and product data).
          </li>
          <li>
            <strong>Cloudinary</strong> and <strong>Vercel Blob</strong>: storage of product photos and images.
          </li>
          <li>
            <strong>Resend</strong>: delivery of messages sent through our contact form.
          </li>
        </ul>
        <p>
          These providers may process data outside your country. We rely on their contractual and security commitments
          to protect it. We may also share order details with shipping companies to deliver your products, and with
          authorities when required by law.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep data",
    body: (
      <p>
        Enquiries are kept for as long as needed to respond and follow up. Order and invoice records are kept for the
        period required by Indonesian accounting and tax rules. Anonymous visit statistics are kept for as long as they
        are useful for understanding trends and contain no information that identifies you.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          Depending on where you live, you may ask us to access, correct, delete or export the personal data we hold
          about you, to restrict or object to its processing, or to withdraw consent you have given. Write to{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we will reply within a reasonable time. You also have the right to
          lodge a complaint with your local data protection authority.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        Data is transmitted over encrypted HTTPS connections. Access to our database and administration area is
        restricted to authorised staff, and invoice links use long random addresses that cannot be guessed. No system
        is perfectly secure, but we take reasonable measures to protect your information.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: <p>Our website is intended for adults and businesses. We do not knowingly collect data from children.</p>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy from time to time. The date at the top of this page shows when it last changed.
        Significant changes will be highlighted on this page.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about privacy? Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or use our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How we collect, use and protect your information."
      updated="21 November 2026"
      intro={
        <p>
          Your privacy matters to us. This policy explains what information we collect when you visit ilavioo.com,
          contact us or order our handcrafted copper and brass products, and how we use and protect it.
        </p>
      }
      sections={sections}
    />
  );
}
