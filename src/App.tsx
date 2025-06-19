
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { QRRedirect } from "./pages/QRRedirect";
import { FormPage } from "./pages/FormPage";
import { cellRoutes } from "@/routes/cells";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rotas de célula */}
          {cellRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          
          {/* Rotas principais - todas apontam para Index */}
          <Route path="/" element={<Index />} />
          <Route path="/contacts" element={<Index />} />
          <Route path="/cells" element={<Index />} />
          <Route path="/pipeline" element={<Index />} />
          <Route path="/messaging" element={<Index />} />
          <Route path="/events" element={<Index />} />
          <Route path="/settings" element={<Index />} />
          <Route path="/users" element={<Index />} />
          
          {/* Rota do formulário principal */}
          <Route path="/form" element={<FormPage />} />
          <Route path="/form/:keyword" element={<FormPage />} />
          
          {/* Rota de redirecionamento QR - deve redirecionar para /form */}
          <Route path="/qr/:keyword" element={<QRRedirect />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
