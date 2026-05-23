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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "eFootHub — Premium eFootball Marketplace" },
      { name: "description", content: "Buy & sell eFootball accounts, coins and packs with admin-secured escrow. Tournaments, trusted sellers, and scam protection — built for Bangladesh." },
      { property: "og:title", content: "eFootHub — Premium eFootball Marketplace" },
      { property: "og:description", content: "The trusted eFootball marketplace with escrow deals, tournaments and verified sellers." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
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
    </div>
  );
}
