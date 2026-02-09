import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-black py-16 px-4 mt-auto w-full flex justify-center">
      <div className="flex items-center justify-center gap-4 max-w-5xl mx-auto">
        <Link href="/">
          <img
            src="/logo3.png"
            alt="Shooting Star"
            className="h-16 w-auto object-contain hover:opacity-80 transition-opacity invert"
          />
        </Link>
        <span className="text-sm font-medium uppercase tracking-wider" style={{ color: 'hsl(30 33% 93%)' }}>BY</span>
        <a
          href="https://portraits.art-and-see.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
        >
          <img
            src="https://portraits.art-and-see.com/logo.png"
            alt="Art & See"
            className="h-10 w-auto object-contain invert"
          />
        </a>
      </div>
    </footer>
  );
}
