import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "홈" },
  { href: "/flow/generate", label: "만들기" },
  { href: "/flow/sharing", label: "공유하기" },
];

function HeaderContainer({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 md:px-8">
        {children}
      </div>
    </header>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      className="text-lg font-semibold tracking-tight text-foreground"
    >
      Lang Flow
    </Link>
  );
}

function HeaderNav() {
  return (
    <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="transition-colors hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export { HeaderContainer, Logo, HeaderNav };
