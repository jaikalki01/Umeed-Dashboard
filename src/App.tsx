import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { AdminLayout } from "./pages/AdminLayout";
import  UserManagement  from "./pages/UserManagement";
import { PaymentHistory } from "./pages/PaymentHistory";
import  AgoraConfigPage  from "./pages/AgoraConfig";
import UserProfile  from "./pages/UserProfile";
import  EditUserProfile  from "./pages/EditUserProfile";
import {ChangePassword} from "./pages/ChangePassword";
import { MembershipPlans } from "./pages/MembershipPlans";
import NotFound from "./pages/NotFound";
import {MembershipsManager} from "./pages/membershipPlan";
import { BannerManager } from "./pages/BannerList";
import MaintenancePage from "./pages/MaintenancePage";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Index />} />
          <Route path="/" element={<Index />} />
          <Route path="/users" element={<Index />} />
          <Route path="/payments" element={<Index />} />
          <Route path="/user/:userId" element={<UserProfile />} />
          <Route path="/user/:userId/edit" element={<EditUserProfile />} />
          <Route path="/user/:userId/password" element={<ChangePassword />} />
          <Route path="/membership-plans" element={<MembershipPlans />} />
          <Route path="/admin/users/:id" element={<UserProfile />} />
          <Route path="/agora-setting" element={<AgoraConfigPage />} />
          <Route path="/membership" element={<MembershipsManager />} />
          <Route path="/banners" element={<BannerManager />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
