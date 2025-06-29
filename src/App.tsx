
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
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
                    <main className="flex-1 flex flex-col">
                      {/* Header sempre visível */}
                      <Header />
                      
                      {/* Conteúdo das páginas */}
                      <div className="flex-1 overflow-auto">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/contatos" element={<Index />} />
                          <Route path="/estagio" element={<Index />} />
                          <Route path="/celulas" element={<Index />} />
                          <Route path="/ministerios" element={<MinistriesPage />} />
                          <Route path="/genealogia" element={<GenealogyPage />} />
                          <Route path="/kids" element={<KidsPage />} />
                          <Route path="/mensagens" element={<MessagesPage />} />
                          <Route path="/eventos" element={<Index />} />
                          <Route path="/usuarios" element={<Index />} />
                          <Route path="/configuracoes" element={<Index />} />
                          <Route path="/avisos" element={<NotificationsPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
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
