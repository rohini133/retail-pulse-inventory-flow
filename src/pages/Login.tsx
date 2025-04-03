
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, UserCircle, UserCog } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock login function that would be replaced with real authentication
  const handleLogin = (role: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (username && password) {
        // Store user role in localStorage
        localStorage.setItem("userRole", role);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${username}!`,
        });
        
        navigate("/");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Please provide both username and password.",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <PageContainer>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">RetailPulse</h1>
            <p className="text-gray-500">Billing & Inventory Management System</p>
          </div>

          <Tabs defaultValue="admin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Admin / Owner
              </TabsTrigger>
              <TabsTrigger value="cashier" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Cashier
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="admin">
              <Card className="border-2 border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-primary" />
                    Admin Login
                  </CardTitle>
                  <CardDescription>
                    Sign in with your admin credentials to manage inventory and view reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-username">Username</Label>
                      <Input 
                        id="admin-username" 
                        placeholder="admin" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input 
                        id="admin-password" 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleLogin("admin")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Sign In as Admin"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="cashier">
              <Card className="border-2 border-secondary/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-secondary" />
                    Cashier Login
                  </CardTitle>
                  <CardDescription>
                    Sign in with your cashier credentials to process sales and generate bills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cashier-username">Username</Label>
                      <Input 
                        id="cashier-username" 
                        placeholder="cashier" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cashier-password">Password</Label>
                      <Input 
                        id="cashier-password" 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-secondary hover:bg-secondary/90" 
                    onClick={() => handleLogin("cashier")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Sign In as Cashier"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Demo credentials:</p>
            <p>Admin: admin / admin123</p>
            <p>Cashier: cashier / cashier123</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Login;
