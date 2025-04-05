
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import BillHistory from "./pages/BillHistory";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/billing" 
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/bill-history" 
              element={
                <ProtectedRoute>
                  <BillHistory />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute requiredRole="admin" restrictedRoles={["cashier"]}>
                  <Inventory />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/products" 
              element={
                <ProtectedRoute requiredRole="admin" restrictedRoles={["cashier"]}>
                  <Products />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin" restrictedRoles={["cashier"]}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
