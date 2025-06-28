
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FormPage from "./pages/FormPage";
import { AuthCallback } from './pages/AuthCallback';
import MemberAttendancePage from './pages/MemberAttendancePage';
import CellAttendancePage from './pages/CellAttendancePage';
import { QRRedirect } from './pages/QRRedirect';
import GenealogyPage from './pages/GenealogyPage';
import KidsPage from './pages/KidsPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from "./pages/NotificationsPage";
import MinistriesPage from './pages/MinistriesPage';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/form/:eventKey?" element={<FormPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/attendance/:attendanceCode" element={<MemberAttendancePage />} />
            <Route path="/cell-attendance/:cellToken" element={<CellAttendancePage />} />
            <Route path="/qr/:keyword" element={<QRRedirect />} />

            {/* Rotas protegidas */}
            <Route path="/*" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/contacts" element={<Index />} />
                        <Route path="/pipeline" element={<Index />} />
                        <Route path="/cells" element={<Index />} />
                        <Route path="/ministries" element={<MinistriesPage />} />
                        <Route path="/genealogia" element={<GenealogyPage />} />
                        <Route path="/kids" element={<KidsPage />} />
                        <Route path="/messages" element={<MessagesPage />} />
                        <Route path="/events" element={<Index />} />
                        <Route path="/users" element={<Index />} />
                        <Route path="/settings" element={<Index />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
