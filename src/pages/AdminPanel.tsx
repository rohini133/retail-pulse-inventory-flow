
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductForm } from "@/components/admin/ProductForm";
import { SalesReport } from "@/components/admin/SalesReport";
import { DiscountManager } from "@/components/admin/DiscountManager";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
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
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  BarChart3, 
  ClipboardList, 
  DatabaseZap, 
  Download,
  Percent, 
  Plus, 
  Printer,
  Settings2, 
  ShoppingBag 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function AdminPanel() {
  const { userRole, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  
  // Redirect non-admin users
  if (!isLoggedIn || userRole !== "admin") {
    return <Navigate to="/login" />;
  }

  const handleAddProductSuccess = () => {
    setIsAddProductDialogOpen(false);
    toast({
      title: "Product Added",
      description: "New product has been successfully added to your inventory.",
    });
  };

  const handleExportData = (type: string) => {
    toast({
      title: "Exporting Data",
      description: `Your ${type} data is being prepared for export.`,
    });
    
    // In a real implementation, we'd generate a CSV/PDF file here
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${type} data has been exported successfully.`,
      });
      setIsExportDialogOpen(false);
    }, 1500);
  };

  const handleBackupData = () => {
    toast({
      title: "Backup Started",
      description: "Creating local backup of your store data...",
    });
    
    // Simulate backup process
    setTimeout(() => {
      toast({
        title: "Backup Complete",
        description: "Your data has been backed up successfully.",
      });
    }, 2000);
  };

  const handlePrintReport = () => {
    toast({
      title: "Preparing Print",
      description: "Getting your report ready for printing...",
    });
    
    // In a real implementation, we'd open the print dialog here
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const handleSettings = (setting: string) => {
    toast({
      title: "Settings Updated",
      description: `The ${setting} setting has been updated successfully.`,
    });
    setIsSettingsDialogOpen(false);
  };

  return (
    <PageContainer 
      title="Admin Panel" 
      subtitle="Manage your store - products, sales, and more"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-primary/10 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/products')}>
          <CardHeader className="pb-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-medium mt-1">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Manage your product catalog, add new items, and update inventory.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 w-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddProductDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-500/10 hover:shadow-md transition-all cursor-pointer" onClick={() => handlePrintReport()}>
          <CardHeader className="pb-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base font-medium mt-1">Sales Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              View detailed sales analytics - daily, weekly, monthly, and yearly.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 w-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsExportDialogOpen(true);
              }}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Reports
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-green-500/10 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/products')}>
          <CardHeader className="pb-2">
            <Percent className="h-5 w-5 text-green-500" />
            <CardTitle className="text-base font-medium mt-1">Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Set up and manage product discounts individually or in bulk.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 w-full"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/products');
              }}
            >
              Manage Discounts
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-500/10 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/inventory')}>
          <CardHeader className="pb-2">
            <DatabaseZap className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-base font-medium mt-1">Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Monitor stock levels, get low stock alerts, and manage reorders.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleBackupData();
              }}
            >
              Backup Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Store Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsSettingsDialogOpen(true)}>
            <Settings2 className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button onClick={() => setIsAddProductDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid sm:grid-cols-3 grid-cols-1 w-full max-w-md mb-2">
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
                <Button variant="link" className="px-1.5 py-0" onClick={() => navigate('/inventory')}>
                  Inventory Page
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter the details for your new product below
            </DialogDescription>
          </DialogHeader>
          <ProductForm 
            onSuccess={handleAddProductSuccess}
            onCancel={() => setIsAddProductDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Choose what data you want to export
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => handleExportData("inventory")}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Export Inventory Data
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleExportData("sales")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Export Sales Data
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handlePrintReport()}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Monthly Report
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>System Settings</DialogTitle>
            <DialogDescription>
              Configure your Demo system settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Offline Mode</h4>
                <p className="text-sm text-muted-foreground">Run the application in offline mode</p>
              </div>
              <Button 
                variant="outline"
                className="bg-green-50 border-green-100 text-green-600"
                onClick={() => handleSettings("offline mode")}
              >
                Enabled
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto Backup</h4>
                <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleSettings("auto backup")}
              >
                Enable
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Print Receipt</h4>
                <p className="text-sm text-muted-foreground">Automatically print receipt after sale</p>
              </div>
              <Button 
                variant="outline"
                className="bg-green-50 border-green-100 text-green-600"
                onClick={() => handleSettings("print receipt")}
              >
                Enabled
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsSettingsDialogOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default AdminPanel;
