import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { FeaturedListings } from "@/components/site/FeaturedListings";
import { Escrow } from "@/components/site/Escrow";
import { Tournaments } from "@/components/site/Tournaments";
import { TrustedSellers } from "@/components/site/TrustedSellers";
import { Community } from "@/components/site/Community";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "eFootHub — Buy & Sell eFootball IDs Safely" },
      { name: "description", content: "Premium eFootball marketplace: buy & sell IDs, coins and packs with admin-secured escrow, private bids, tournaments and verified sellers." },
      { property: "og:title", content: "eFootHub — Buy & Sell eFootball IDs Safely" },
      { property: "og:description", content: "Admin-secured escrow, private bids, verified sellers. The trusted eFootball marketplace." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "eFootHub",
          description: "Premium eFootball marketplace with admin-secured escrow and private bids.",
          url: "/",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen pb-16 lg:pb-0">
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedListings />
        <Escrow />
        <Tournaments />
        <TrustedSellers />
        <Community />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
