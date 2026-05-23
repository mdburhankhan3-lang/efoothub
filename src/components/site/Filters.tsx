import { SlidersHorizontal } from "lucide-react";

const groups = [
  { label: "Budget", options: ["Any", "Under ৳2k", "৳2k–5k", "৳5k–10k", "৳10k+"] },
  { label: "Platform", options: ["All", "Mobile", "PS5", "PS4", "Xbox", "PC"] },
  { label: "Rank", options: ["All", "Bronze", "Silver", "Gold", "Epic", "Legendary"] },
  { label: "Region", options: ["Global", "Bangladesh", "Asia", "EU", "NA"] },
  { label: "Tags", options: ["Verified seller", "Epic cards", "GP rich", "New", "On sale"] },
];

export function Filters() {
  return (
    <aside className="bg-card border border-border rounded-2xl p-5 shadow-soft sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold">Filters</h3>
      </div>

      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{g.label}</div>
            <div className="flex flex-wrap gap-1.5">
              {g.options.map((o, i) => (
                <button
                  key={o}
                  className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                    i === 0
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 h-10 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-primary">
        Apply filters
      </button>
    </aside>
  );
}
