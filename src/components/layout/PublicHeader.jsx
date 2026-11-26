import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";

const PublicHeader = () => (
  <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
      <Logo />
      <ThemeToggle />
    </div>
  </header>
);

export default PublicHeader;
