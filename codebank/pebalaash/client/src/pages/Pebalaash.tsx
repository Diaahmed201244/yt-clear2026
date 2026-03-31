import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
<<<<<<< HEAD
import { Loader2, Coins, Package, ShoppingCart } from "lucide-react";
import { AdminDashboard } from "@/components/AdminDashboard";
=======
import { Loader2, Coins, Package, ShoppingCart, Search, Menu, Filter, Star, Zap, Clock } from "lucide-react";
import { AdminDashboard } from "@/components/AdminDashboard";
import { IceOverlay } from "@/components/iceOverlay";
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
import { api } from "@shared/routes";
import { CartPanel } from "@/components/CartPanel";
import { MarqueeSection } from "@/components/MarqueeSection";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
<<<<<<< HEAD
=======
import { Footer } from "@/components/Footer";
import { Heart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)

const purchaseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Valid phone required"),
  address: z.string().min(5, "Address required"),
  notes: z.string().optional(),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  priceCodes: number;
  imageUrl: string;
  categoryId: number;
  stock: number;
  soldCount: number;
}

interface Wallet {
  userId: string;
  codes: number;
}

interface CartItem {
  product: Product;
  addedAt: Date;
}

interface PurchasedItem {
  id: number;
  productName: string;
  priceCodes: number;
  customerName: string;
  purchasedAt: Date;
}

interface FailedPurchase {
  productName: string;
  requiredCodes: number;
  availableCodes: number;
  attemptedAt: Date;
}

const GUEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

<<<<<<< HEAD
=======
// Declare global window property for TypeScript
declare global {
  interface Window {
    __BALLOON_POINTS__: number;
    dispatchPebalaashEvent: (name: string, detail?: any) => void;
  }
}

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
export default function Pebalaash() {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [titleClicks, setTitleClicks] = useState(0);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
<<<<<<< HEAD
=======
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [balloonPoints, setBalloonPoints] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isBulkCheckoutOpen, setIsBulkCheckoutOpen] = useState(false);
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
  const [failedPurchases, setFailedPurchases] = useState<FailedPurchase[]>([]);

<<<<<<< HEAD
=======
  // Listen for balloon points updates
  useEffect(() => {
    // Initialize with current global points
    if (typeof window !== 'undefined') {
      setBalloonPoints(window.__BALLOON_POINTS__ || 0);

      // Load cart from localStorage
      const savedCart = localStorage.getItem("pebalaash_cart");
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setCartItems(parsed.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          })));
        } catch (e) {
          console.error("Failed to load cart", e);
        }
      }

      // Load wishlist from localStorage
      const savedWishlist = localStorage.getItem("pebalaash_wishlist");
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (e) {
          console.error("Failed to load wishlist", e);
        }
      }
      
      const handlePointsUpdate = (e: any) => {
        setBalloonPoints(e.detail.points);
      };

      window.addEventListener('balloon:points:update', handlePointsUpdate);
      
      // Global event dispatcher for components
      window.dispatchPebalaashEvent = (name: string, detail?: any) => {
        window.dispatchEvent(new CustomEvent(name, { detail }));
      };

      const handleCheckoutAll = () => {
        setIsCartOpen(false);
        setIsBulkCheckoutOpen(true);
      };

      window.addEventListener('checkout-all', handleCheckoutAll);

      return () => {
        window.removeEventListener('balloon:points:update', handlePointsUpdate);
        window.removeEventListener('checkout-all', handleCheckoutAll);
      };
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("pebalaash_cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("pebalaash_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async (): Promise<Category[]> => {
      const res = await fetch(api.categories.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Fetch products
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: [api.products.list.path, selectedCategoryId],
    queryFn: async (): Promise<Product[]> => {
      const url = selectedCategoryId 
        ? `${api.products.list.path}?categoryId=${selectedCategoryId}`
        : api.products.list.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  // Fetch wallet
  const { data: wallet, refetch: refetchWallet } = useQuery({
    queryKey: [api.wallet.get.path],
    queryFn: async (): Promise<Wallet> => {
      const res = await fetch(api.wallet.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch wallet");
      return res.json();
    },
  });

  // Form handling
  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  const handleTitleClick = () => {
    const newCount = titleClicks + 1;
    setTitleClicks(newCount);
    if (newCount === 7) {
      setIsAdminOpen(true);
      setTitleClicks(0);
    }
    setTimeout(() => setTitleClicks(0), 2000);
  };

  const handleAddToCart = (product: Product) => {
    setCartItems([...cartItems, { product, addedAt: new Date() }]);
    toast({
      title: "Added to cart",
      description: `${product.name} added to cart.`,
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems(cartItems.filter((item: CartItem) => item.product.id !== productId));
  };

<<<<<<< HEAD
=======
  const toggleWishlist = (productId: number) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
    form.reset();
  };

  const onPurchaseSubmit = async (data: PurchaseFormData) => {
    if (!selectedProduct || !wallet) return;

    setIsProcessing(true);
    try {
      // Check if they can afford it
      if (wallet.codes < selectedProduct.priceCodes) {
        setFailedPurchases([
          ...failedPurchases,
          {
            productName: selectedProduct.name,
            requiredCodes: selectedProduct.priceCodes,
            availableCodes: wallet.codes,
            attemptedAt: new Date(),
          },
        ]);
        throw new Error("Insufficient codes balance");
      }

      const res = await fetch(api.checkout.purchase.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          customerInfo: data,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        setFailedPurchases([
          ...failedPurchases,
          {
            productName: selectedProduct.name,
            requiredCodes: selectedProduct.priceCodes,
            availableCodes: wallet.codes,
            attemptedAt: new Date(),
          },
        ]);
        throw new Error(error.message || "Purchase failed");
      }

      // Add to purchased items
      setPurchasedItems([
        ...purchasedItems,
        {
          id: selectedProduct.id,
          productName: selectedProduct.name,
          priceCodes: selectedProduct.priceCodes,
          customerName: data.name,
          purchasedAt: new Date(),
        },
      ]);

      // Remove from cart if exists
      setCartItems(cartItems.filter((item: CartItem) => item.product.id !== selectedProduct.id));

      setIsSheetOpen(false);
      form.reset();
      refetchWallet();

      toast({
        title: "Purchase Successful!",
        description: `You bought ${selectedProduct.name} for ${selectedProduct.priceCodes} codes.`,
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

<<<<<<< HEAD
  const canAfford = selectedProduct && wallet && wallet.codes >= selectedProduct.priceCodes;
=======
  const onBulkPurchaseSubmit = async (data: PurchaseFormData) => {
    if (cartItems.length === 0 || !wallet) return;

    const cartTotal = cartItems.reduce((sum, item) => sum + item.product.priceCodes, 0);
    if (wallet.codes < cartTotal) {
      toast({
        title: "Insufficient Codes",
        description: "You don't have enough codes to purchase all items.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // For simplicity, we process each item. In production, we'd use a bulk endpoint.
      for (const item of cartItems) {
        await fetch(api.checkout.purchase.path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.product.id,
            customerInfo: data,
          }),
          credentials: "include",
        });

        // Add to purchased items locally
        setPurchasedItems(prev => [
          ...prev,
          {
            id: item.product.id,
            productName: item.product.name,
            priceCodes: item.product.priceCodes,
            customerName: data.name,
            purchasedAt: new Date(),
          },
        ]);
      }

      setCartItems([]);
      setIsBulkCheckoutOpen(false);
      refetchWallet();

      toast({
        title: "Bulk Purchase Successful!",
        description: `Purchased ${cartItems.length} items successfully.`,
      });
    } catch (error) {
      toast({
        title: "Bulk Purchase Partial Failure",
        description: "Some items may not have been purchased correctly.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products
    .filter((p: Product) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price-low") return a.priceCodes - b.priceCodes;
      if (sortBy === "price-high") return b.priceCodes - a.priceCodes;
      if (sortBy === "top-rated") return b.soldCount - a.soldCount;
      return 0; // featured
    });

  const canAfford = selectedProduct && wallet ? wallet.codes >= selectedProduct.priceCodes : false;
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Marquee */}
      <MarqueeSection />

      {/* Navigation */}
<<<<<<< HEAD
      <nav className="bg-card/80 border-b border-border sticky top-0 z-10 backdrop-blur brand-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 cursor-pointer select-none" onClick={handleTitleClick}>
              <h1 className="text-3xl font-display font-black tracking-tight gradient-text">
                Pebalaash<span className="text-blue-500">.</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {wallet && (
                <div className="hidden md:flex items-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-xl border border-blue-500/30 text-blue-300">
                  <Coins className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="font-bold">{wallet.codes.toLocaleString()}</span>
                  <span className="text-xs ml-2 opacity-70">CODES</span>
                </div>
              )}
              <Button 
                size="icon" 
                variant="default"
                onClick={() => setIsCartOpen(true)}
                className="relative cta-gradient cta-gradient-hover"
                >
                <ShoppingCart className="w-5 h-5" />
                {(cartItems.length + purchasedItems.length + failedPurchases.length) > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
=======
      <nav className="bg-[#131921] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-6">
            <div className="flex-shrink-0 cursor-pointer select-none" onClick={handleTitleClick}>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Pebalaash<span className="text-[#FFD814]">.</span>
              </h1>
            </div>

            {/* Central Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-3xl">
              <div className="flex w-full rounded-md overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#FFD814]">
                <div className="bg-gray-100 px-3 flex items-center text-sm text-gray-700 border-r border-gray-300">All</div>
                <Input 
                  placeholder="Search products..." 
                  className="w-full bg-white text-black border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-[#FFD814] hover:bg-[#F7CA00] px-4 flex items-center justify-center transition-colors">
                  <Search className="w-5 h-5 text-gray-900" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {wallet && (
                <div className="hidden md:flex flex-col text-white">
                  <span className="text-[10px] text-gray-300">Your Balance</span>
                  <div className="flex items-center font-bold">
                    <Coins className="w-4 h-4 mr-1 text-[#FFD814]" />
                    {wallet.codes.toLocaleString()} <span className="text-xs ml-1 font-normal">CODES</span>
                  </div>
                </div>
              )}
              {/* Balloon Points Display */}
              <div className="hidden md:flex flex-col text-white">
                <span className="text-[10px] text-gray-300">Rewards</span>
                <div className="flex items-center font-bold">
                  <Package className="w-4 h-4 mr-1 text-green-400" />
                  {balloonPoints.toLocaleString()}
                </div>
              </div>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setIsCartOpen(true)}
                className="relative text-white hover:text-white hover:bg-white/10"
              >
                <div className="flex flex-col items-center">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="text-xs font-bold mt-1">Cart</span>
                </div>
                {(cartItems.length + purchasedItems.length + failedPurchases.length) > 0 && (
                  <span className="absolute top-0 right-0 bg-[#FFD814] text-[#131921] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
                    {cartItems.length + purchasedItems.length + failedPurchases.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
<<<<<<< HEAD
      </nav>

      <div className="flex-grow flex">
        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          
          <div className="mb-12 text-center space-y-4">
            <h2 className="text-5xl font-display font-black gradient-text">Enterprise Marketplace</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              Premium products. Secure transactions. Instant delivery.
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-12 flex flex-wrap gap-3 justify-center">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              onClick={() => setSelectedCategoryId(null)}
              className="enterprise-button font-bold"
            >
              All Products
            </Button>
            {categories.map((cat: Category) => (
              <Button
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategoryId(cat.id)}
                className="enterprise-button font-bold"
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          {isProductsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {products.map((product: Product) => (
                <Card key={product.id} className="group overflow-hidden glass-card transition-all duration-300 flex flex-col h-full">
                  <div className="aspect-[4/3] relative overflow-hidden bg-black/30">
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                        Only {product.stock} left
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 backdrop-blur-sm">
                        <span className="text-white font-bold text-lg border-2 border-blue-500 px-4 py-2 uppercase rounded-lg">Sold Out</span>
                      </div>
                    )}
                    
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      loading="lazy"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      onError={(e: any) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/600x400/f3f4f6/a3a3a3?text=${encodeURIComponent(product.name)}`;
                      }}
                    />
                  </div>

                  <CardContent className="p-8 flex-grow">
                    <h3 className="font-display font-bold text-lg text-foreground mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
                      {product.description || "Premium quality item"}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-3 py-1 rounded-full text-blue-300 font-black text-sm">
                        <Coins className="w-4 h-4 mr-1" />
                        {product.priceCodes}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-8 pt-0 gap-3">
                    <Button 
                      aria-label={`Add ${product.name} to cart`}
                      className="flex-1 enterprise-button" 
                      size="sm"
                      disabled={product.stock === 0}
                      onClick={() => handleAddToCart(product)}
                      variant="outline"
                    >
                      Add Cart
                    </Button>
                    <Button 
                      aria-label={`Buy ${product.name}`}
                      className="flex-1 enterprise-button cta-gradient cta-gradient-hover text-white border-0" 
                      size="sm"
                      disabled={product.stock === 0}
                      onClick={() => handleBuyClick(product)}
                    >
                      Buy
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl shadow-xl border-2 border-dashed border-blue-500/30">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium text-foreground">No products found</h3>
            </div>
          )}
        </main>
      </div>
=======

        {/* Sub Navigation (Categories) */}
        <div className="bg-[#232F3E] text-white">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto no-scrollbar py-2 text-sm">
            <button 
              onClick={() => setSelectedCategoryId(null)}
              className={`whitespace-nowrap flex items-center gap-1 border-b-2 py-0.5 ${selectedCategoryId === null ? 'border-[#FFD814] font-bold text-white' : 'border-transparent text-gray-300 hover:border-white'}`}
            >
              <Menu className="w-4 h-4" /> All
            </button>
            {categories.map((cat: Category) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`whitespace-nowrap border-b-2 py-0.5 ${selectedCategoryId === cat.id ? 'border-[#FFD814] font-bold text-white' : 'border-transparent text-gray-300 hover:border-white'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="flex-grow flex flex-col bg-gray-50">
        {/* Banner/Hero Section */}
        <div className="bg-gradient-to-r from-[#232F3E] to-[#131921] py-8 px-4 w-full">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 h-48 rounded-xl bg-gray-100 p-8 shadow-sm" style={{
            backgroundImage: "url('https://placehold.co/1200x300/e2e8f0/1e293b?text=Huge+Savings+Event')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            <div className="bg-white/95 p-6 rounded-lg shadow-sm max-w-sm">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">Spring Deals</h2>
              <p className="text-sm text-gray-600 mt-2">Get up to 40% off on premium digital assets this week.</p>
              <Button className="mt-4 bg-[#FFD814] text-black hover:bg-[#F7CA00] font-semibold border-none rounded-full shadow-sm">Shop Now</Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Sorting and Filters Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : "All Products"}
              </h2>
              <p className="text-sm text-gray-500">{filteredProducts.length} results found</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-white border-gray-300 rounded-md">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="top-rated">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Grid */}
          <div className="flex-grow">
            {isProductsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product: Product) => (
                  <Card key={product.id} className="group overflow-hidden bg-white border border-gray-200 transition-shadow duration-300 flex flex-col h-full hover:shadow-lg rounded-xl">
                    <div 
                      className="aspect-[4/3] relative overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => handleViewDetails(product)}
                    >
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        loading="lazy"
                        className="object-contain w-full h-full p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        onError={(e: any) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/600x400/f3f4f6/64748b?text=${encodeURIComponent(product.name)}`;
                        }}
                      />
                      {/* Wishlist Heart */}
                      <button 
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:bg-white transition-colors z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                      >
                        <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>
                    </div>

                    <CardContent className="p-4 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 
                          className="font-medium text-lg text-gray-900 group-hover:text-[#FA8900] transition-colors cursor-pointer line-clamp-2"
                          onClick={() => handleViewDetails(product)}
                        >
                          {product.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < 4 || (product.soldCount > 50 && i === 4) ? 'fill-[#FFA41C] text-[#FFA41C]' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                        <span className="text-xs text-blue-600 ml-1">{product.soldCount} Ratings</span>
                      </div>

                      <div className="flex items-baseline gap-1 mt-auto">
                        <span className="text-xs font-semibold text-gray-700">CODES</span>
                        <span className="text-2xl font-bold text-gray-900">{product.priceCodes.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        FREE Delivery on selected models
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 gap-2 flex-col">
                      <Button 
                        className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black font-semibold rounded-full shadow-sm"
                        size="sm"
                        disabled={product.stock === 0}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                      <Button 
                        className="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-black font-semibold rounded-full shadow-sm"
                        size="sm"
                        disabled={product.stock === 0}
                        onClick={() => handleBuyClick(product)}
                      >
                        Buy Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card/30 rounded-3xl border-2 border-dashed border-border/50">
                <Package className="mx-auto h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-xl font-display font-bold text-foreground">No matches found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search or category filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="bottom" className="h-[95vh] sm:h-[85vh] rounded-t-2xl sm:rounded-t-3xl pt-10 px-4 sm:px-8 pb-8 overflow-y-auto bg-white border-t border-gray-200">
          {selectedProduct && (
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
              {/* Image Section */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 flex items-center justify-center aspect-square">
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-contain mix-blend-multiply"
                    onError={(e: any) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/800x800/f3f4f6/64748b?text=${encodeURIComponent(selectedProduct.name)}`;
                    }}
                  />
                </div>
                {/* Fake Thumbnails for realism */}
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`w-16 h-16 rounded-md border-2 ${i === 1 ? 'border-[#FFA41C]' : 'border-gray-200'} bg-gray-50 cursor-pointer p-1`}>
                      <img src={selectedProduct.imageUrl} className="w-full h-full object-contain mix-blend-multiply opacity-70 hover:opacity-100" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Section */}
              <div className="w-full md:w-1/2 flex flex-col">
                <h2 className="text-2xl md:text-3xl font-medium text-gray-900 leading-tight">
                  {selectedProduct.name}
                </h2>
                
                <div className="flex items-center gap-4 mt-2 border-b border-gray-200 pb-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < 4 || (selectedProduct.soldCount > 50 && i === 4) ? 'fill-[#FFA41C] text-[#FFA41C]' : 'fill-gray-200 text-gray-200'}`} />
                      ))}
                      <span className="text-sm font-semibold ml-2 text-blue-600 hover:text-orange-600 hover:underline cursor-pointer">{selectedProduct.soldCount} ratings</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col">
                  <span className="text-sm text-gray-500 font-semibold mb-1">Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{selectedProduct.priceCodes.toLocaleString()}</span>
                    <span className="text-lg font-semibold text-gray-700">CODES</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-bold text-gray-900">FREE delivery</span> usually ships within 24 hours.
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">About this item</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {selectedProduct.description || "Experience premium quality with this top-rated digital asset. Curated specifically for professionals requiring reliable, high-tier products, it comes fully vetted. The package includes standard documentation and a 30-day return policy."}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-700 list-disc pl-5">
                    <li>High quality robust design</li>
                    <li>Instant delivery directly to your account</li>
                    <li>Verified purchase with authenticity guarantee</li>
                    <li>Eligible for points rewards</li>
                  </ul>
                </div>

                <div className="mt-auto pt-8 flex flex-col gap-3">
                  <Button 
                    className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black font-semibold rounded-full shadow-sm py-6 text-lg"
                    disabled={selectedProduct.stock === 0}
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setIsDetailsOpen(false);
                    }}
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    className="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-black font-semibold rounded-full shadow-sm py-6 text-lg"
                    disabled={selectedProduct.stock === 0}
                    onClick={() => {
                      setIsDetailsOpen(false);
                      handleBuyClick(selectedProduct);
                    }}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bulk Checkout Sheet */}
      <Sheet open={isBulkCheckoutOpen} onOpenChange={setIsBulkCheckoutOpen}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto bg-card border-l-2 border-[#FFD814]">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-display text-2xl text-[#FA8900]">Secure Bulk Checkout</SheetTitle>
            <SheetDescription className="text-muted-foreground">Review your cart and finalize purchase</SheetDescription>
          </SheetHeader>

          {cartItems.length > 0 && wallet && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Order Summary ({cartItems.length} items)</p>
                <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  {cartItems.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="truncate flex-1 pr-2">{item.product.name}</span>
                      <span className="font-bold whitespace-nowrap">{item.product.priceCodes} CODES</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#131921] text-white p-4 rounded-xl border border-[#FFD814]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Total Amount</span>
                  <span className="text-xl font-bold text-[#FFD814]">{cartItems.reduce((s, i) => s + i.product.priceCodes, 0).toLocaleString()} CODES</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Balance Available</span>
                  <span>{wallet.codes.toLocaleString()} CODES</span>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onBulkPurchaseSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-name">Full Name</Label>
                  <Input id="bulk-name" {...form.register("name")} placeholder="John Doe" />
                  {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulk-phone">Phone Number</Label>
                  <Input id="bulk-phone" {...form.register("phone")} placeholder="+1 234 567 8900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulk-address">Delivery Address</Label>
                  <Textarea id="bulk-address" {...form.register("address")} placeholder="123 Main St..." />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-black font-bold text-lg rounded-full py-6" 
                  disabled={isProcessing || wallet.codes < cartItems.reduce((s, i) => s + i.product.priceCodes, 0)}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Place Your Order"}
                </Button>
              </form>
            </div>
          )}
        </SheetContent>
      </Sheet>
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)

      {/* Checkout Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto bg-card border-l-2 border-blue-500/40">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-display text-2xl gradient-text">Secure Checkout</SheetTitle>
            <SheetDescription className="text-muted-foreground">Provide delivery information</SheetDescription>
          </SheetHeader>

          {selectedProduct && wallet && (
            <div className="space-y-8">
              {/* Product Summary */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-xl border border-blue-500/30 flex gap-4 items-start">
                <div className="h-16 w-16 rounded-md bg-black/30 border border-orange-500/30 overflow-hidden flex-shrink-0">
                  <img src={selectedProduct.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{selectedProduct.name}</h4>
                  <div className="flex items-center text-blue-400 font-bold mt-1">
                    <Coins className="w-4 h-4 mr-1" />
                    {selectedProduct.priceCodes.toLocaleString()} Codes
                  </div>
                </div>
              </div>

              {/* Wallet Status */}
              <div className={`p-4 rounded-xl border ${canAfford ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30' : 'bg-gradient-to-r from-red-500/10 to-purple-500/10 border-red-500/30'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-muted-foreground">Your Balance</span>
                  <span className="font-bold text-blue-300">{wallet.codes.toLocaleString()} Codes</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Item Price</span>
                  <span className="font-medium text-foreground">-{selectedProduct.priceCodes.toLocaleString()}</span>
                </div>
                <div className="my-2 border-t border-border/50"></div>
                {canAfford ? (
                  <div className="flex justify-between items-center font-bold text-green-400">
                    <span>Remaining</span>
                    <span>{(wallet.codes - selectedProduct.priceCodes).toLocaleString()} Codes</span>
                  </div>
                ) : (
                  <div className="text-red-400 font-bold text-sm">Insufficient balance</div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={form.handleSubmit(onPurchaseSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...form.register("name")} placeholder="John Doe" />
                  {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" {...form.register("phone")} placeholder="+1 234 567 8900" />
                  {form.formState.errors.phone && <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea id="address" {...form.register("address")} placeholder="123 Main St, City, Country" className="min-h-24" />
                  {form.formState.errors.address && <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea id="notes" {...form.register("notes")} placeholder="Any special requests..." className="min-h-20" />
                </div>

                <Button 
                  type="submit" 
                  className="w-full enterprise-button cta-gradient cta-gradient-hover text-white border-0 font-bold text-base" 
                  size="lg"
                  disabled={!canAfford || isProcessing}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {canAfford ? "Confirm Purchase" : "Insufficient Codes"}
                </Button>
              </form>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Cart Side Panel */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="right" className="w-[400px] max-w-[90vw] p-0 bg-card border-l-2 border-blue-500/40">
          <SheetHeader className="p-4 border-b border-border bg-black/20">
            <SheetTitle className="font-display text-2xl gradient-text">Dashboard</SheetTitle>
            <SheetDescription className="text-muted-foreground">Orders & Activity</SheetDescription>
          </SheetHeader>
          <CartPanel
            cartItems={cartItems}
            purchasedItems={purchasedItems}
            failedPurchases={failedPurchases}
            onRemoveFromCart={handleRemoveFromCart}
            wallet={wallet}
          />
        </SheetContent>
      </Sheet>

      {/* Admin Dashboard */}
      {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} />}
<<<<<<< HEAD
=======
      
      {/* Ice Overlay Animation */}
      <IceOverlay />

      {/* Footer */}
      <Footer />
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
    </div>
  );
}
