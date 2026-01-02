import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  return (
    <div
      className="grid-container"
      style={{
        display: "grid",
        gridTemplateColumns: openSidebarToggle ? "260px 1fr" : "260px 1fr", // Simplify for now
        gridTemplateRows: "60px 1fr",
        gridTemplateAreas: '"sidebar header" "sidebar main"',
        height: "100vh",
        transition: "all 0.3s",
      }}
    >
      <Sidebar
        openSidebarToggle={openSidebarToggle}
        OpenSidebar={OpenSidebar}
      />
      <Header OpenSidebar={OpenSidebar} />
      <main
        className="main-container"
        style={{
          gridArea: "main",
          padding: "24px",
          overflowY: "auto",
          backgroundColor: "#f4f7fa",
        }}
      >
        {children}
      </main>

      {/* Mobile styling overrides would be in CSS media queries */}
    </div>
  );
};

export default MainLayout;
