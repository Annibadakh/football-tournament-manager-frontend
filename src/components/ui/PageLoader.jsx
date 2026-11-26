import Spinner from "@/components/ui/Spinner";

const PageLoader = ({ label = "Loading..." }) => (
  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-brand-600 dark:text-brand-400">
    <Spinner size="lg" label={label} />
    <p className="text-sm text-fg-muted">{label}</p>
  </div>
);

export default PageLoader;
