
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Product } from "@/types/supabase-extensions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { addProduct, updateProduct } from "@/services/productService";
import { Loader2, Upload } from "lucide-react";
import { checkActiveSession, debugAuthStatus } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  brand: z.string().min(2, "Brand name must be at least 2 characters"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  buyingPrice: z.coerce.number().positive("Buying price must be positive"),
  discountPercentage: z.coerce.number().min(0).max(100, "Discount must be between 0 and 100"),
  stock: z.coerce.number().int().positive("Stock must be a positive integer"),
  lowStockThreshold: z.coerce.number().int().positive("Threshold must be a positive integer"),
  image: z.string().url("Must be a valid URL"),
  color: z.string().optional(),
  size: z.string().optional(),
  itemNumber: z.string().min(3, "Item number must be at least 3 characters"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isEditing = !!product;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication status in ProductForm...");
      const authStatus = await debugAuthStatus();
      console.log("ProductForm auth check result:", authStatus);
      setIsAuthenticated(authStatus.isAuthenticated);
      
      if (!authStatus.isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to add or edit products.",
          variant: "destructive",
        });
      }
    };
    
    checkAuth();
  }, [toast]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: isEditing 
      ? { 
          name: product.name,
          brand: product.brand,
          category: product.category,
          description: product.description,
          price: product.price,
          buyingPrice: product.buyingPrice || 0,
          discountPercentage: product.discountPercentage,
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold,
          image: product.image,
          color: product.color || "",
          size: product.size || "",
          itemNumber: product.itemNumber,
        }
      : {
          name: "",
          brand: "",
          category: "",
          description: "",
          price: 0,
          buyingPrice: 0,
          discountPercentage: 0,
          stock: 0,
          lowStockThreshold: 5,
          image: "https://placehold.co/400x300?text=Product+Image",
          color: "",
          size: "",
          itemNumber: `ITM${Math.floor(Math.random() * 10000)}`,
        }
  });

  const handleSubmit = async (values: ProductFormValues) => {
    console.log("Submitting product form with size:", values.size);
    
    const isActive = await checkActiveSession();
    if (!isActive) {
      console.error("Authentication required to submit product form");
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to add or edit products.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log(`Submitting ${isEditing ? 'update' : 'new'} product to Supabase:`, values);
      
      if (isEditing && product) {
        console.log("Updating product in Supabase:", {
          id: product.id,
          ...values
        });
        
        await updateProduct({
          ...product,
          ...values,
          size: values.size.trim() || null,
          updatedAt: new Date().toISOString()
        });
        
        toast({
          title: "Product updated",
          description: `${values.name} has been updated successfully.`,
        });
      } else {
        console.log("Adding new product to Supabase:", values);
        
        await addProduct({
          name: values.name,
          brand: values.brand,
          category: values.category,
          description: values.description,
          price: values.price,
          buyingPrice: values.buyingPrice,
          discountPercentage: values.discountPercentage,
          stock: values.stock,
          lowStockThreshold: values.lowStockThreshold,
          image: values.image,
          color: values.color,
          size: values.size.trim() || null,
          itemNumber: values.itemNumber,
          // Add required properties that were missing
          quantity: values.stock, // Use stock as the initial quantity
          userId: "system", // Default value for new products
          imageUrl: values.image, // Use the same URL for both image and imageUrl
        });
        
        toast({
          title: "Product added",
          description: `${values.name} has been added successfully.`,
        });
      }
      onSuccess();
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} product:`, error);
      
      toast({
        title: isEditing ? "Update failed" : "Add failed",
        description: error.message || `Failed to ${isEditing ? 'update' : 'add'} product. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      form.setValue('image', base64);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderAuthWarning = () => {
    if (isAuthenticated === false) {
      return (
        <div className="">
          {/*  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
          <p className="text-amber-800 font-medium">Authentication Required</p>
          <p className="text-amber-700 text-sm">You are not currently authenticated with the database. 
          Changes may not be saved. Please log out and log back in to reauthenticate.</p> */}
        </div>
      );
    }
    return null;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {renderAuthWarning()}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="itemNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter product description" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="buyingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buying Price (₹)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  The price at which the product was purchased
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="discountPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low Stock Threshold</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Alert when stock falls below this number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Stock</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Red, Blue, Green" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. S, M, L, XL, 42, 10UK" {...field} />
                </FormControl>
                <FormDescription>
                  For clothing and footwear, specify the available size
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative w-full max-w-[200px] h-[150px] border rounded-md overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Product preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={triggerFileInput}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  
                  <FormControl>
                    <Input 
                      placeholder="Or enter image URL" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setImagePreview(e.target.value);
                      }}
                    />
                  </FormControl>
                </div>
                <FormDescription>
                  Upload a product image or provide an image URL
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
