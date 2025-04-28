import MetaLogo from "@/assets/images/meta-image.png";
import { Outlet } from "react-router";
const Layout = () => {
  return (
    <>
      <div className="sticky top-0 right-0 left-0 h-12 bg-gray-200 px-4 py-1">
        <img src={MetaLogo} alt="" className="h-full" />
      </div>
      <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center bg-gradient-to-br from-[#FCF3F8] to-[#F0FAF4] px-4 md:px-0">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
