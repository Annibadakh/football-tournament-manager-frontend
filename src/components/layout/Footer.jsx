import { APP_NAME, SOCIAL_LINKS } from "@/constants/common.constants";

const Footer = () => (
  <footer className="border-t border-line bg-surface">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-fg-muted">
      <p>
        © {new Date().getFullYear()} {APP_NAME}
      </p>
      <div className="flex gap-4">
        <a
          href={SOCIAL_LINKS.INSTAGRAM}
          target="_blank"
          rel="noreferrer"
          className="hover:text-link"
        >
          Instagram
        </a>
        <a href={SOCIAL_LINKS.YOUTUBE} target="_blank" rel="noreferrer" className="hover:text-link">
          YouTube
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
