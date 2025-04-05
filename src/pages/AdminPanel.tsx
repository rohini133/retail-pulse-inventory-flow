
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductForm } from "@/components/admin/ProductForm";
import { SalesReport } from "@/components/admin/SalesReport";
import { DiscountManager } from "@/components/admin/DiscountManager";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  BarChart3, 
  ClipboardList, 
  DatabaseZap, 
  Percent, 
  Plus, 
  Settings2, 
  ShoppingBag 
} from "lucide-react";

export function AdminPanel() {
  const { userRole, isLoggedIn } = useAuth();
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  
  // Redirect non-admin users
  if (!isLoggedIn || userRole !== "admin") {
    return <Navigate to="/login" />;
  }

  return (
    <PageContainer 
      title="Admin Panel" 
      subtitle="Manage your store - products, sales, and more"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-primary/10">
          <CardHeader className="pb-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-medium mt-1">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Manage your product catalog, add new items, and update inventory.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-500/10">
          <CardHeader className="pb-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base font-medium mt-1">Sales Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              View detailed sales analytics - daily, weekly, monthly, and yearly.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-500/10">
          <CardHeader className="pb-2">
            <Percent className="h-5 w-5 text-green-500" />
            <CardTitle className="text-base font-medium mt-1">Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Set up and manage product discounts individually or in bulk.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-500/10">
          <CardHeader className="pb-2">
            <DatabaseZap className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-base font-medium mt-1">Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Monitor stock levels, get low stock alerts, and manage reorders.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Store Management</h2>
        <Button onClick={() => setIsAddProductDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-2">
          <TabsTrigger value="products" className="flex items-center">
            <ClipboardList className="mr-2 h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="discounts" className="flex items-center">
            <Percent className="mr-2 h-4 w-4" />
            Discounts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Product Management
              </CardTitle>
              <CardDescription>
                Add, edit, or remove products from your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                For detailed product management, visit the 
                <Button variant="link" className="px-1.5 py-0" asChild>
                  <a href="/inventory">Inventory Page</a>
                </Button>
                which provides a complete interface for product management.
              </p>
              
              <Button onClick={() => setIsAddProductDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-4">
          <SalesReport />
        </TabsContent>
        
        <TabsContent value="discounts" className="space-y-4">
          <DiscountManager />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter the details for your new product below
            </DialogDescription>
          </DialogHeader>
          <ProductForm 
            onSuccess={() => setIsAddProductDialogOpen(false)}
            onCancel={() => setIsAddProductDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default AdminPanel;
