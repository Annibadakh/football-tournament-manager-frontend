import { Outlet } from "react-router-dom";
import Footer from "@/components/layout/Footer";
import PublicHeader from "@/components/layout/PublicHeader";

const PublicLayout = () => (
  <div className="flex min-h-dvh flex-col">
    <PublicHeader />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default PublicLayout;
