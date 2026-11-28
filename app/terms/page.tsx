import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "Terms for using the Ilavioo website and ordering handcrafted copper and brass products from PT. Ilavioo Nusantara Sejahtera.",
  path: "/terms",
});

const EMAIL = "marketing@ilavioo.com";

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <p>
        These terms apply to your use of this website and to quotations and orders with{" "}
        <strong>PT. Ilavioo Nusantara Sejahtera</strong> (&quot;Ilavioo&quot;, &quot;we&quot;, &quot;us&quot;),
        Boyolali, Central Java, Indonesia. By using the website or placing an order you agree to them.
        If a quotation or invoice we send you contains specific conditions, those conditions prevail for that order.
      </p>
    ),
  },
  {
    id: "website",
    title: "Using the website",
    body: (
      <ul>
        <li>The website is provided for information about our products and services.</li>
        <li>
          You may not misuse it, attempt to gain unauthorised access to it, or copy its content for commercial use
          without our permission.
        </li>
        <li>We may update or change the website and its content at any time.</li>
      </ul>
    ),
  },
  {
    id: "products",
    title: "Handmade products",
    body: (
      <>
        <p>
          Every piece is hand-hammered and finished by artisans in Boyolali. Small differences in shape, texture, hammer
          marks, colour and patina from the photos are part of the character of handmade copper and brass and are not
          defects.
        </p>
        <p>
          Product photos, sizes and descriptions are given as accurately as possible but are indicative. Copper and
          brass finishes naturally develop a patina over time unless otherwise agreed.
        </p>
      </>
    ),
  },
  {
    id: "quotes-orders",
    title: "Quotations and orders",
    body: (
      <ul>
        <li>
          Prices shown as &quot;Contact for Price&quot; or &quot;Custom Project&quot; are quoted individually based on
          size, material, finish and quantity.
        </li>
        <li>
          A quotation is valid for the period stated on it. An order is confirmed once we have agreed the
          specifications with you in writing and issued an invoice.
        </li>
        <li>
          Production lead times are estimates and start after the agreed conditions (such as payment of any deposit)
          have been met.
        </li>
        <li>
          Because custom and made-to-order pieces are produced specifically for you, changes or cancellations after
          production has started may not be possible or may incur costs.
        </li>
      </ul>
    ),
  },
  {
    id: "payment",
    title: "Prices and payment",
    body: (
      <p>
        Prices, currency, payment schedule, taxes and accepted payment methods are stated on your quotation or
        invoice. Unless agreed otherwise, prices do not include import duties, local taxes or charges in the
        destination country, which are the responsibility of the buyer.
      </p>
    ),
  },
  {
    id: "shipping",
    title: "Shipping and delivery",
    body: (
      <p>
        We pack every piece carefully for international transport. The shipping method, cost, delivery terms and the
        point at which risk passes to you are confirmed in your quotation or invoice. Please inspect your delivery on
        arrival and tell us about any transport damage, with photos, as soon as possible so we can help with a claim.
      </p>
    ),
  },
  {
    id: "issues",
    title: "Problems with your order",
    body: (
      <p>
        If a product arrives damaged or does not match the agreed specifications, contact us at{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a> with your invoice number and photos. We will work with you on a fair
        solution such as repair, replacement or another remedy, depending on the situation and the agreed terms. This
        does not affect any rights you have under the law that applies to you.
      </p>
    ),
  },
  {
    id: "ip",
    title: "Designs and content",
    body: (
      <p>
        The texts, photos, logos and designs on this website belong to Ilavioo or are used with permission. Custom
        designs we create remain our intellectual property unless agreed otherwise in writing. You may share links to
        our pages, but please do not reuse our photos or content without permission.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Liability",
    body: (
      <p>
        We are not liable for indirect or consequential losses, or for damage caused by improper installation, use or
        maintenance of our products. Our total liability for an order is limited to the amount paid for that order, to
        the extent permitted by law.
      </p>
    ),
  },
  {
    id: "privacy",
    title: "Privacy",
    body: (
      <p>
        How we handle personal data is explained in our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of the Republic of Indonesia. We will always try to resolve any
        disagreement amicably first; if that is not possible, disputes will be settled by the competent courts of
        Indonesia, unless the law of your country gives you other mandatory rights.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <p>
        We may update these terms from time to time; the date at the top shows the latest version. Questions? Email{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or visit our <Link href="/contact">contact page</Link>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms for using our website and ordering handcrafted copper from Boyolali."
      updated="21 November 2026"
      intro={
        <p>
          Thank you for your interest in Ilavioo. Please read these terms before using our website or ordering from
          us. They are written to be clear and fair for customers around the world.
        </p>
      }
      sections={sections}
    />
  );
}
