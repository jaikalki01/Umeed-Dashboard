import { NavLink, useLocation } from "react-router-dom";
import { Users, CreditCard, LogOut, BarChart3, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import logo from "../../../public/logo.png"

const sidebarItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "User Management", url: "/users", icon: Users },
  { title: "Payment History", url: "/payments", icon: CreditCard },
    { title: "Agora Setting", url: "/agora-setting", icon: Settings },
     { title: "Membership Plan", url: "/membership", icon: BarChart3 },
     { title: "Banners", url: "/banners", icon: BarChart3 },
    { title: "Maintenance", url: "/maintenance", icon: Settings }
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { logout } = useAdminAuth();
  const collapsed = state === "collapsed";

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-[#a955f4] text-white font-semibold shadow-md"
      : "bg-[#a955f4]/80 text-white hover:bg-[#a955f4] transition-all duration-200";

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-60"} flex flex-col bg-background border-r shadow-md transition-all duration-300 shadow-[0px_0px_8px_-4px_#000]`}
      collapsible="icon"
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-4 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500">
        <img
          src={logo}
          alt="Umeed Logo"
          className={collapsed ? "h-8 sm:w-8 object-contain" : "h-10 object-contain"}

        />
      </div>

      {/* Centered menu items */}
    <SidebarContent className="flex flex-col justify-center flex-1 bg-[#a955f4]">
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu className="pb-6 space-y-3">
        {sidebarItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <NavLink
                to={item.url}
                end={item.url === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-md bg-white text-black shadow-md hover:shadow-lg transition-all duration-200 ${
                    isActive ? "ring-2 ring-offset-2 ring-primary" : ""
                  }`
                }
              >
                <item.icon className="h-5 w-5 text-black" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</SidebarContent>



      {/* Logout at bottom */}
      <div className="mt-auto p-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#a955f4] text-white hover:bg-[#fff] transition-all duration-200 border-[0.1px]  hover:border-[#000]"
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}
