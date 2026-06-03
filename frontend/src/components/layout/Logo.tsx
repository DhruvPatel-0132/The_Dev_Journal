import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-4">
      <Image
        src="/Logo.png"
        alt="The Dev Journal Logo"
        width={48}
        height={48}
        className="object-contain rounded-lg"
        priority
      />

      <div>
        <h1 className="text-lg font-bold tracking-tight">
          The Dev Journal
        </h1>

        <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 font-mono mt-0.5">
          Engineering Blog
        </p>
      </div>
    </div>
  );
}