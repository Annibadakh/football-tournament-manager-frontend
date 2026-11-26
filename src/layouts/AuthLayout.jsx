import { Outlet } from "react-router-dom";
import logoIcon from "@/assets/brand/maidaan-icon.svg";
import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { APP_TAGLINE } from "@/constants/common.constants";

// Split screen: brand panel on desktop, form only on phones
const AuthLayout = () => (
  <div className="grid min-h-dvh lg:grid-cols-2">
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-700 p-10 text-white lg:flex">
      <img
        src={logoIcon}
        alt=""
        className="absolute -right-24 -bottom-24 size-[28rem] rotate-12 opacity-10"
      />
      <span className="font-brand text-3xl font-extrabold">
        Maid<span className="text-accent-400">aa</span>n
      </span>
      <div className="relative">
        <p className="font-brand text-5xl leading-tight font-extrabold">{APP_TAGLINE}</p>
        <p className="mt-4 max-w-md text-brand-100">
          Local football tournaments, live scores and live streams, all in one place.
        </p>
      </div>
      <p className="text-sm text-brand-200">Starting in Maharashtra</p>
    </aside>

    <main className="flex flex-col bg-page">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <Logo size="sm" className="lg:invisible" />
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-start justify-center px-4 pb-10 sm:items-center">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </main>
  </div>
);

export default AuthLayout;
