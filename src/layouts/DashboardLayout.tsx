import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "@/components/Footer";

const DashboardLayout = () => {
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("lastPath", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-primary-dark md:flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen md:mr-80">
        <main className="flex-1">
          <Outlet />
        </main>
        <hr />
        <Footer showLinks={false} />
      </div>
    </div>
  );
};

export default DashboardLayout;
