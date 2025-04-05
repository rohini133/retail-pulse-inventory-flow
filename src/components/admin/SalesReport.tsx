
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Loader2 } from "lucide-react";
import { Bill } from "@/data/models";
import { sampleDashboardStats } from "@/data/sampleData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// This would come from the backend in a real app
const generateSampleSalesData = () => {
  // Current month daily sales
  const dailySales = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    sales: Math.floor(Math.random() * 1000) + 200,
  }));

  // Weekly sales for past 12 weeks
  const weeklySales = Array.from({ length: 12 }, (_, i) => ({
    week: `Week ${i + 1}`,
    sales: Math.floor(Math.random() * 5000) + 1000,
  }));

  // Monthly sales for past year
  const monthlySales = [
    { name: "Jan", sales: 4000 },
    { name: "Feb", sales: 3000 },
    { name: "Mar", sales: 5000 },
    { name: "Apr", sales: 2780 },
    { name: "May", sales: 1890 },
    { name: "Jun", sales: 2390 },
    { name: "Jul", sales: 3490 },
    { name: "Aug", sales: 4000 },
    { name: "Sep", sales: 3200 },
    { name: "Oct", sales: 2800 },
    { name: "Nov", sales: 4300 },
    { name: "Dec", sales: 5100 },
  ];

  // Yearly sales for past 5 years
  const yearlySales = [
    { year: "2021", sales: 45000 },
    { year: "2022", sales: 52000 },
    { year: "2023", sales: 49000 },
    { year: "2024", sales: 58000 },
    { year: "2025", sales: 31000 },
  ];

  // Category distribution
  const categoryDistribution = [
    { name: "Electronics", value: 35 },
    { name: "Clothing", value: 25 },
    { name: "Groceries", value: 20 },
    { name: "Home", value: 15 },
    { name: "Others", value: 5 },
  ];

  // Top selling products
  const topProducts = sampleDashboardStats.topSellingProducts;

  // Recent transactions
  const recentTransactions = sampleDashboardStats.recentSales || [];

  return {
    dailySales,
    weeklySales,
    monthlySales,
    yearlySales,
    categoryDistribution,
    topProducts,
    recentTransactions,
  };
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function SalesReport() {
  const [activeTab, setActiveTab] = useState("daily");
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setReportData(generateSampleSalesData());
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (isLoading || !reportData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales - Current Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Sales - Last 12 Weeks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.weeklySales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales - Current Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Yearly Sales - Last 5 Years</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.yearlySales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportData.categoryDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Units Sold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.topProducts.map((item: any) => (
                    <TableRow key={item.product.id}>
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell>{item.product.category}</TableCell>
                      <TableCell className="text-right">{item.soldCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.recentTransactions.slice(0, 5).map((bill: Bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.id}</TableCell>
                    <TableCell>{bill.customerName || "Walk-in Customer"}</TableCell>
                    <TableCell>{new Date(bill.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{bill.items.length} items</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(bill.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
