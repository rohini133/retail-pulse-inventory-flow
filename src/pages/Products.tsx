
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/data/models";
import { getProductStockStatus, getProducts } from "@/services/productService";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search } from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([...products]);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        product.brand.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search) ||
        product.itemNumber.toLowerCase().includes(search)
    );

    setFilteredProducts(filtered);
  };

  const handleSearch = () => {
    filterProducts();
  };

  return (
    <PageContainer title="Products" subtitle="Browse all available products">
      <div className="mb-6">
        <div className="flex gap-2 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products by name, brand, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const stockStatus = getProductStockStatus(product);
              const isOutOfStock = stockStatus === "out-of-stock";
              
              const formattedPrice = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(product.price);
              
              const discountedPrice = product.discountPercentage > 0 
                ? product.price * (1 - product.discountPercentage / 100) 
                : null;
                
              const formattedDiscountedPrice = discountedPrice 
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(discountedPrice)
                : null;

              return (
                <Card 
                  key={product.id} 
                  className={`overflow-hidden transition-opacity ${
                    isOutOfStock ? "opacity-70" : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-48 w-full object-cover"
                    />
                    {stockStatus === "out-of-stock" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                        <Badge variant="destructive" className="text-lg px-3 py-1">
                          SOLD OUT
                        </Badge>
                      </div>
                    )}
                    {stockStatus === "low-stock" && (
                      <Badge 
                        variant="outline" 
                        className="absolute top-2 right-2 bg-yellow-50 text-yellow-700 border-yellow-200"
                      >
                        Low Stock: {product.stock} left
                      </Badge>
                    )}
                    {product.discountPercentage > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute top-2 left-2"
                      >
                        {product.discountPercentage}% OFF
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {product.brand} • {product.category}
                    </p>
                    <div className="flex items-center mb-3">
                      {discountedPrice ? (
                        <>
                          <span className="font-bold text-lg">{formattedDiscountedPrice}</span>
                          <span className="ml-2 text-sm line-through text-gray-500">
                            {formattedPrice}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-lg">{formattedPrice}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.size && (
                        <Badge variant="outline" className="bg-gray-50">
                          Size: {product.size}
                        </Badge>
                      )}
                      {product.color && (
                        <Badge variant="outline" className="bg-gray-50">
                          Color: {product.color}
                        </Badge>
                      )}
                      <Badge variant="outline" className="bg-gray-50">
                        Item #{product.itemNumber}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default Products;
