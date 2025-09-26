import { useLocation,useNavigate } from "react-router-dom";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import UserManagement  from "./UserManagement";
import { PaymentHistory } from "./PaymentHistory";

const Index = () => {
  const { isAuthenticated, isLoading, login } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogin = (tokenOrFlag?: string | boolean) => {
    if (typeof tokenOrFlag === "string" && tokenOrFlag.trim() !== "") {
      // preferred: login with token so hook can persist it
      login(tokenOrFlag);
    } else {
      // fallback: caller didn't provide token, just flip auth state
      login();
    }

    // redirect to original destination (replace so back doesn't go to login)
    navigate(from, { replace: true });
  };

  const from = (location.state as any)?.from?.pathname || "/";
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }
  const renderContent = () => {
    switch (location.pathname) {
      case '/users':
        return <UserManagement />;
      case '/payments':
        return <PaymentHistory />;
      default:
        return <UserManagement />;
    }
  };

  return (
   <SidebarProvider>
  <div className="min-h-screen flex w-full">
    <AdminSidebar />
    <div className="flex-1 flex flex-col">
      {/* Sticky Header */}
      <header className="h-14 flex items-center border-b bg-background px-4 sticky top-0 z-50">
        <SidebarTrigger />
        <div className="ml-4">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="flex-1 p-6 bg-muted/20 overflow-auto">
        {renderContent()}
      </main>
    </div>
  </div>
</SidebarProvider>

  );
};

export default Index;