
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductSearchItem } from "@/components/billing/ProductSearchItem";
import { CartItemRow } from "@/components/billing/CartItemRow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartItem, Product } from "@/data/models";
import { getProducts } from "@/services/productService";
import { createBill, sendBillToWhatsApp } from "@/services/billService";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, SendHorizonal, ShoppingCart, WhatsappIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Billing = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "digital-wallet">("cash");
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [createdBillId, setCreatedBillId] = useState<string | null>(null);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  
  const { toast } = useToast();

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const allProducts = await getProducts();
      
      if (searchTerm.trim() === "") {
        setProducts(allProducts);
      } else {
        const filtered = allProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.itemNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setProducts(filtered);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    // Check if product is already in cart
    const existingItemIndex = cartItems.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex >= 0) {
      // Increment quantity if already in cart
      const newCartItems = [...cartItems];
      const currentQuantity = newCartItems[existingItemIndex].quantity;
      
      // Check if we can add more based on stock
      if (currentQuantity < product.stock) {
        newCartItems[existingItemIndex] = {
          ...newCartItems[existingItemIndex],
          quantity: currentQuantity + 1,
        };
        setCartItems(newCartItems);
        
        toast({
          title: "Item quantity updated",
          description: `${product.name} quantity increased to ${currentQuantity + 1}`,
        });
      } else {
        toast({
          title: "Maximum stock reached",
          description: `Cannot add more ${product.name} as the maximum stock (${product.stock}) has been reached.`,
          variant: "destructive",
        });
      }
    } else {
      // Add new item to cart
      setCartItems([...cartItems, { product, quantity: 1 }]);
      
      toast({
        title: "Item added to cart",
        description: `${product.name} has been added to the cart`,
      });
    }
  };

  const handleUpdateQuantity = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      handleRemoveItem(item);
      return;
    }

    if (newQuantity > item.product.stock) {
      toast({
        title: "Maximum stock reached",
        description: `Cannot add more ${item.product.name} as the maximum stock (${item.product.stock}) has been reached.`,
        variant: "destructive",
      });
      return;
    }

    const newCartItems = cartItems.map((cartItem) =>
      cartItem.product.id === item.product.id
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );

    setCartItems(newCartItems);
  };

  const handleRemoveItem = (item: CartItem) => {
    const newCartItems = cartItems.filter(
      (cartItem) => cartItem.product.id !== item.product.id
    );
    setCartItems(newCartItems);
    
    toast({
      title: "Item removed",
      description: `${item.product.name} has been removed from the cart`,
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const discountedPrice = 
        item.product.price * (1 - item.product.discountPercentage / 100);
      return total + discountedPrice * item.quantity;
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to the cart before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const bill = await createBill(
        cartItems,
        {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        },
        paymentMethod
      );
      
      setCreatedBillId(bill.id);
      setIsCheckoutDialogOpen(true);
      
      // Clear cart after successful checkout
      setCartItems([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setPaymentMethod("cash");
      
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: "There was an error processing your bill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!createdBillId) return;
    
    setIsSendingWhatsApp(true);
    try {
      // In a real app, we'd retrieve the bill by ID and send it
      const bills = await sendBillToWhatsApp({
        id: createdBillId,
        items: cartItems,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        customerName,
        customerPhone,
        customerEmail,
        paymentMethod,
        createdAt: new Date().toISOString(),
        status: "completed"
      });
    } catch (error) {
      toast({
        title: "Failed to send WhatsApp",
        description: "There was an error sending the bill via WhatsApp. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  const formattedSubtotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(subtotal);
  
  const formattedTax = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(tax);
  
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(total);

  return (
    <PageContainer title="Billing" subtitle="Create bills and process sales">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Product Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, brand, or item number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    {isSearching
                      ? "Searching for products..."
                      : "No products found. Try searching for products above."}
                  </p>
                ) : (
                  products.map((product) => (
                    <ProductSearchItem
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Shopping Cart</CardTitle>
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Search for products and add them to your cart
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {cartItems.map((item) => (
                    <CartItemRow
                      key={item.product.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                    />
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formattedSubtotal}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span>{formattedTax}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formattedTotal}</span>
                </div>
              </div>
            </CardContent>
            <Separator />
            <CardHeader className="pb-3 pt-4">
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Customer Name
                </label>
                <Input
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <Input
                  placeholder="Enter phone number (for WhatsApp receipt)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email (optional)
                </label>
                <Input
                  placeholder="Enter email address"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => 
                    setPaymentMethod(value as "cash" | "card" | "digital-wallet")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="digital-wallet">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleCheckout}
                disabled={isLoading || cartItems.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <SendHorizonal className="h-4 w-4 mr-2" />
                    Complete Checkout
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bill Generated Successfully</DialogTitle>
            <DialogDescription>
              Bill #{createdBillId} has been created and inventory has been updated.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">What would you like to do next?</p>
            {customerPhone && (
              <Button 
                className="w-full mb-3"
                onClick={handleSendWhatsApp}
                disabled={isSendingWhatsApp}
              >
                {isSendingWhatsApp ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <WhatsappIcon className="h-4 w-4 mr-2" />
                )}
                Send Receipt via WhatsApp
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCheckoutDialogOpen(false)}
            >
              Return to Billing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Billing;
