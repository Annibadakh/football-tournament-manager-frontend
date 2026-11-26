import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

// Filled with role-specific widgets from Phase 1 onwards
const DashboardHomePage = () => (
  <>
    <PageHeader
      title="Dashboard"
      subtitle="Your tournaments, teams and matches will appear here."
    />
    <EmptyState
      title="Nothing to show yet"
      description="Dashboard features arrive with the next phases."
    />
  </>
);

export default DashboardHomePage;
