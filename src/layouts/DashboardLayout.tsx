
import { useState } from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "@/components/UserSidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <UserSidebar />
      
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
