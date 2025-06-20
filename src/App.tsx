
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import FormPage from "./pages/FormPage";
import { QRRedirect } from "./pages/QRRedirect";
import CellAttendancePage from "./pages/CellAttendancePage";
import MemberAttendancePage from "./pages/MemberAttendancePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/form" element={<FormPage />} />
            <Route path="/qr/:keyword" element={<QRRedirect />} />
            <Route path="/cells/:cellId/attendance" element={<CellAttendancePage />} />
            <Route path="/attendance/:cellId" element={<MemberAttendancePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
