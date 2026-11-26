import { Link } from "react-router-dom";
import { Radio, Search, Trophy } from "lucide-react";
import Logo from "@/components/layout/Logo";
import Badge from "@/components/ui/Badge";
import { APP_TAGLINE } from "@/constants/common.constants";
import { ROUTES } from "@/constants/routes.constants";

const HIGHLIGHTS = [
  {
    Icon: Search,
    title: "Find tournaments",
    text: "Search local tournaments by name, place or near you.",
  },
  {
    Icon: Trophy,
    title: "Run your tournament",
    text: "Teams, fixtures, live scores and points tables in one place.",
  },
  {
    Icon: Radio,
    title: "Watch live",
    text: "Follow live scores and YouTube streams from the ground.",
  },
];

// Simple landing page; algorithmic feeds and CMS content come in the last phase
const HomePage = () => (
  <section className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 py-16 text-center sm:py-24">
    <Badge variant="accent">Now live in Maharashtra</Badge>
    <Logo size="lg" />
    <p className="font-brand text-2xl font-semibold text-brand-700 dark:text-brand-300">
      {APP_TAGLINE}
    </p>
    <p className="max-w-xl text-fg-muted">
      Maidaan brings local football online: tournaments, teams, live scores and live streams,
      starting in Maharashtra.
    </p>
    <Link
      to={ROUTES.TOURNAMENTS}
      className="inline-flex h-12 items-center rounded-lg bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700"
    >
      Browse tournaments
    </Link>
    <div className="mt-4 grid w-full gap-4 sm:grid-cols-3">
      {HIGHLIGHTS.map(({ Icon, title, text }) => (
        <div key={title} className="rounded-xl border border-line bg-surface p-5 text-left">
          <Icon className="size-6 text-brand-600 dark:text-brand-400" aria-hidden="true" />
          <h2 className="mt-3 text-lg text-fg">{title}</h2>
          <p className="mt-1 text-sm text-fg-muted">{text}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HomePage;
