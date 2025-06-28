
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import Index from "@/pages/Index";
import FormPage from "@/pages/FormPage";
import GenealogyPage from "@/pages/GenealogyPage";
import CellAttendancePage from "@/pages/CellAttendancePage";
import MemberAttendancePage from "@/pages/MemberAttendancePage";
import MessagesPage from "@/pages/MessagesPage";
import { AuthCallback } from "@/pages/AuthCallback";
import { QRRedirect } from "@/pages/QRRedirect";
import NotFound from "@/pages/NotFound";
import { KidsMinistryPage } from "@/pages/KidsMinistryPage";
import { NotificationsPage } from "@/pages/NotificationsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/form" element={<FormPage />} />
                    <Route path="/genealogy" element={<GenealogyPage />} />
                    <Route path="/cell-attendance" element={<CellAttendancePage />} />
                    <Route path="/member-attendance" element={<MemberAttendancePage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/kids-ministry" element={<KidsMinistryPage />} />
                    <Route path="/notificacoes" element={<NotificationsPage />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/qr/:keyword" element={<QRRedirect />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
