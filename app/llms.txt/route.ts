import { getProductList } from "@/lib/public-data";
import { SITE, absoluteUrl } from "@/lib/site";

// Plain-text site summary for AI assistants (https://llmstxt.org). Rebuilt hourly like the sitemap.
export const revalidate = 3600;

export async function GET() {
  let productLines = "";
  try {
    const products = await getProductList("", "newest");
    productLines = products
      .map((p) => {
        const desc = p.description?.replace(/\s+/g, " ").trim();
        return `- [${p.name}](${absoluteUrl(`/products/${p.slug}`)})${desc ? `: ${desc}` : ""}`;
      })
      .join("\n");
  } catch (error) {
    console.error("llms.txt: could not load products", error);
  }

  const body = `# ${SITE.name}

> ${SITE.name} (${SITE.legalName}) makes handcrafted copper and brass products in Tumang, Cepogo, Boyolali, Central Java, Indonesia: bathtubs, basins and sinks, lighting, doors and wall panels, and decor. Pieces are hand-hammered by local artisans, made to order in custom sizes, and exported worldwide. Prices are quoted per project.

- Contact: ${SITE.email}, WhatsApp ${SITE.telephone}
- Workshop visits in Tumang are by appointment.

## Main pages

- [Home](${absoluteUrl("/")})
- [Products](${absoluteUrl("/products")}): full catalog
- [Our process](${absoluteUrl("/process")}): how pieces are made
- [About](${absoluteUrl("/about")}): company and Tumang copper heritage
- [Gallery](${absoluteUrl("/gallery")}): finished projects
- [Contact and quotations](${absoluteUrl("/contact")})

## Products

${productLines || `- [Product catalog](${absoluteUrl("/products")})`}

## Optional

- [Privacy Policy](${absoluteUrl("/privacy")})
- [Terms of Service](${absoluteUrl("/terms")})
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
