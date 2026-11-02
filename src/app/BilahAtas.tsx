import Link from "next/link";

export default function BilahAtas() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
          Topi<span className="text-accent">Surya</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium" aria-label="Navigasi utama">
          <a href="#cara-kerja" className="hover:text-accent">
            Cara kerja
          </a>
          <a href="#perangkat" className="hover:text-accent">
            Perangkat
          </a>
          <a href="#data" className="hover:text-accent">
            Data
          </a>
          <a
            href="https://github.com/bintangyudhis/topi-surya-iot"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden hover:text-accent sm:inline"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
