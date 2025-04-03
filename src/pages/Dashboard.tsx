
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/data/models";
import { sampleDashboardStats } from "@/data/sampleData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchStats = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats(sampleDashboardStats);
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <PageContainer title="Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-40"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
          
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-40"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-md mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // Prepare data for sales chart
  const salesData = [
    { name: "Mon", sales: 430 },
    { name: "Tue", sales: 528 },
    { name: "Wed", sales: 376 },
    { name: "Thu", sales: 390 },
    { name: "Fri", sales: 624 },
    { name: "Sat", sales: 578 },
    { name: "Sun", sales: 332 },
  ];

  return (
    <PageContainer 
      title="Dashboard" 
      subtitle="Overview of store performance and inventory status"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        <StatsCard
          title="Total Sales"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(stats.totalSales)}
          icon={<DollarSign />}
          trend={{ value: 12.5, label: "from last month", direction: "up" }}
        />
        <StatsCard
          title="Today's Sales"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(stats.todaySales)}
          icon={<ShoppingBag />}
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={<AlertCircle />}
          trend={{ value: 8.2, label: "from last week", direction: "up" }}
        />
        <StatsCard
          title="Out of Stock Items"
          value={stats.outOfStockItems}
          icon={<Package />}
          trend={{ value: 2.1, label: "from last week", direction: "down" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Weekly Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(value as number)
                    }
                  />
                  <Bar
                    dataKey="sales"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.topSellingProducts.map(({ product, soldCount }) => (
                <div key={product.id} className="flex items-center">
                  <div className="h-10 w-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.brand} • Item #{product.itemNumber}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium">{soldCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
