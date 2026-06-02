const stats = [
    ["15K+", "Engineers"],
    ["900+", "Knowledge Articles"],
    ["120+", "Contributors"],
  ];
  
  export default function HeroStats() {
    return (
      <div className="flex flex-wrap items-center gap-10 sm:gap-14 mt-12 xl:mt-16">
        {stats.map(([value, label]) => (
          <div key={label}>
            <h3 className="text-3xl font-bold">{value}</h3>
  
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-mono mt-2">
              {label}
            </p>
          </div>
        ))}
      </div>
    );
  }