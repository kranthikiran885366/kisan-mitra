"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ShoppingCart, Star, Heart, MapPin, Package, Plus, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Product {
  id: string
  name: string
  description: string
  category: string
  brand: string
  price: { mrp: number; selling: number; discount: number }
  seller: { name: string; rating: number; location: string }
  ratings: { average: number; count: number }
  shipping: { freeShipping: boolean; deliveryDays: number }
  negotiable: boolean
  images: { url: string; alt: string }[]
}

const categories = [
  { value: "all", label: "All Products" },
  { value: "seeds", label: "Seeds" },
  { value: "fertilizers", label: "Fertilizers" },
  { value: "pesticides", label: "Pesticides" },
  { value: "tools", label: "Tools" },
]

const cropCategories = [
  { value: "all", label: "All Crops" },
  { value: "vegetables", label: "Vegetables" },
  { value: "fruits", label: "Fruits" },
  { value: "grains", label: "Grains" },
  { value: "pulses", label: "Pulses" },
  { value: "spices", label: "Spices" },
]

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cropListings, setCropListings] = useState([])
  const [marketPrices, setMarketPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cartItems, setCartItems] = useState(0)
  const [activeTab, setActiveTab] = useState("products")

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts()
    } else if (activeTab === "crops") {
      fetchCropListings()
    } else if (activeTab === "prices") {
      fetchMarketPrices()
    }
  }, [selectedCategory, searchTerm, activeTab])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (searchTerm) params.append("search", searchTerm)
      
      const { marketplaceApi } = await import('@/lib/api')
      const data = await marketplaceApi.getProducts()
      
      if (data.success) {
        // Mock products data
        setProducts([
          {
            id: "1",
            name: "Organic Rice Seeds",
            description: "High quality organic rice seeds",
            category: "seeds",
            brand: "AgriSeeds",
            price: { mrp: 500, selling: 450, discount: 10 },
            seller: { name: "Farmer Co-op", rating: 4.5, location: "Punjab" },
            ratings: { average: 4.2, count: 25 },
            shipping: { freeShipping: true, deliveryDays: 3 },
            negotiable: true,
            images: [{ url: "/placeholder.jpg", alt: "Rice seeds" }]
          },
          {
            id: "2",
            name: "NPK Fertilizer",
            description: "Balanced NPK fertilizer for all crops",
            category: "fertilizers",
            brand: "FertCorp",
            price: { mrp: 800, selling: 720, discount: 10 },
            seller: { name: "Agri Store", rating: 4.3, location: "Haryana" },
            ratings: { average: 4.0, count: 18 },
            shipping: { freeShipping: false, deliveryDays: 5 },
            negotiable: false,
            images: [{ url: "/placeholder.jpg", alt: "Fertilizer" }]
          }
        ])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCropListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (searchTerm) params.append("search", searchTerm)
      
      const { marketplaceApi } = await import('@/lib/api')
      const data = await marketplaceApi.getProducts() // Using products endpoint for now
      
      if (data.success) {
        // Mock crop listings
        setCropListings([
          {
            id: "1",
            cropName: "Tomatoes",
            variety: "Cherry",
            farmer: { name: "Raj Kumar" },
            location: { district: "Guntur", state: "AP" },
            pricing: { basePrice: 25 },
            quantity: { unit: "kg" },
            remainingQuantity: 500,
            quality: { organic: true, grade: "A" },
            images: [{ url: "/placeholder.jpg" }]
          },
          {
            id: "2",
            cropName: "Rice",
            variety: "Basmati",
            farmer: { name: "Suresh Patel" },
            location: { district: "Krishna", state: "AP" },
            pricing: { basePrice: 45 },
            quantity: { unit: "kg" },
            remainingQuantity: 1000,
            quality: { organic: false, grade: "A" },
            images: [{ url: "/placeholder.jpg" }]
          }
        ])
      }
    } catch (error) {
      console.error("Error fetching crop listings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMarketPrices = async (type = "current") => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("type", type)
      if (searchTerm) params.append("crop", searchTerm)
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      
      const { marketApi } = await import('@/lib/api')
      const data = await marketApi.getPrices()
      
      if (data.success) {
        if (type === "comparison") {
          setMarketPrices(data.data.comparison.map(item => ({
            crop: item._id.cropName,
            variety: "Mixed",
            price: Math.round(item.avgPrice),
            market: item.marketName || "Multiple Markets",
            district: item._id.district,
            date: item.date,
            minPrice: Math.round(item.minPrice),
            maxPrice: Math.round(item.maxPrice),
            arrivals: item.arrivals,
            trend: item.priceDifference > 0 ? "up" : item.priceDifference < 0 ? "down" : "stable",
            change: Math.abs(item.priceDifference)
          })))
        } else if (type === "regional") {
          setMarketPrices(data.data.regional.flatMap(region => 
            region.crops.slice(0, 3).map(crop => ({
              crop: crop.cropName,
              variety: "Regional Average",
              price: Math.round(crop.price),
              market: region._id,
              district: crop.district,
              date: crop.date,
              minPrice: Math.round(crop.price * 0.9),
              maxPrice: Math.round(crop.price * 1.1),
              arrivals: region.totalArrivals,
              trend: "stable",
              change: 0
            }))
          ))
        } else if (type === "cropwise") {
          setMarketPrices(data.data.cropwise.map(crop => ({
            crop: crop._id,
            variety: `${crop.marketCount} Markets`,
            price: Math.round(crop.avgPrice),
            market: "Multiple Markets",
            district: "Various",
            date: new Date(),
            minPrice: Math.round(crop.minPrice),
            maxPrice: Math.round(crop.maxPrice),
            arrivals: crop.totalArrivals,
            trend: crop.avgPrice > crop.minPrice ? "up" : "down",
            change: Math.round(((crop.maxPrice - crop.minPrice) / crop.minPrice) * 100)
          })))
        } else {
          // Mock market prices
          setMarketPrices([
            {
              crop: "Rice",
              variety: "Basmati",
              price: 2500,
              market: "Guntur Market",
              district: "Guntur",
              date: new Date(),
              minPrice: 2400,
              maxPrice: 2600,
              arrivals: 150,
              trend: "up",
              change: 5.2,
              quality: "Grade A"
            },
            {
              crop: "Wheat",
              variety: "Sharbati",
              price: 2200,
              market: "Punjab Market",
              district: "Ludhiana",
              date: new Date(),
              minPrice: 2100,
              maxPrice: 2300,
              arrivals: 200,
              trend: "down",
              change: 2.1,
              quality: "Grade B"
            }
          ])
        }
      }
    } catch (error) {
      console.error("Error fetching market prices:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const { marketplaceApi } = await import('@/lib/api')
      const response = await marketplaceApi.sell({ productId, quantity: 1 }) // Mock cart operation
      
      if (response.ok) {
        setCartItems(prev => prev + 1)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  const placeOrder = async (listingId: string, quantity: number, price: number) => {
    try {
      const { marketplaceApi } = await import('@/lib/api')
      const response = await marketplaceApi.sell({
        listingId,
        action: "add_order",
        buyerId: "default_buyer",
        quantity,
        price,
        notes: "Order placed from marketplace"
      })
      
      const data = await response.json()
      if (data.success) {
        alert("Order placed successfully! Farmer will contact you soon.")
        fetchCropListings() // Refresh listings
      } else {
        alert(data.message || "Failed to place order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-green-800">🌾 Krishi Marketplace</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.location.href = "/marketplace/sell-crop"}>
                <Plus className="h-5 w-5 mr-2" />
                Sell Crop
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/marketplace/orders"}>
                <Package className="h-5 w-5 mr-2" />
                Orders
              </Button>
              <Button variant="outline" className="relative" onClick={() => window.location.href = "/marketplace/cart"}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart ({cartItems})
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="crops">Fresh Crops</TabsTrigger>
            <TabsTrigger value="prices">Market Prices</TabsTrigger>
          </TabsList>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 my-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={activeTab === "products" ? "Search products..." : activeTab === "crops" ? "Search crops..." : "Search prices..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {(activeTab === "crops" ? cropCategories : categories).map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <TabsContent value="products">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={product.images[0]?.url || "/placeholder.jpg"}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Button size="sm" variant="ghost" className="absolute top-2 right-2 p-2">
                        <Heart className="h-4 w-4" />
                      </Button>
                      {product.shipping.freeShipping && (
                        <Badge className="absolute top-2 left-2 bg-green-600">Free Shipping</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{product.brand}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{product.ratings.average}</span>
                        <span className="text-xs text-gray-500">({product.ratings.count})</span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{product.seller.location}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-bold text-green-600">₹{product.price.selling}</span>
                        <span className="text-xs text-gray-500 line-through">₹{product.price.mrp}</span>
                        <Badge variant="secondary" className="text-xs">{product.price.discount}% off</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => addToCart(product.id)}>Add to Cart</Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => window.location.href = `/marketplace/product/${product.id}`}>View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching your criteria.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="crops">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cropListings.map((crop) => (
                  <Card key={crop.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={crop.images[0]?.url || "/placeholder.jpg"}
                        alt={crop.cropName}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      <Badge className={`absolute top-2 left-2 ${
                        crop.quality.organic ? "bg-green-600" : "bg-blue-600"
                      }`}>
                        {crop.quality.organic ? "Organic" : `Grade ${crop.quality.grade}`}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{crop.cropName} - {crop.variety}</h3>
                      <p className="text-sm text-gray-600 mb-2">{crop.farmer.name}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{crop.location.district}, {crop.location.state}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-green-600">₹{crop.pricing.basePrice}/{crop.quantity.unit}</span>
                        <span className="text-sm text-gray-500">{crop.remainingQuantity} {crop.quantity.unit} left</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => placeOrder(crop.id, 1, crop.pricing.basePrice)}
                        >
                          Place Order
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => window.location.href = `/marketplace/crop/${crop.id}`}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!loading && cropListings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No crop listings found.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prices">
            <div className="mb-4 flex gap-2">
              <Button 
                variant={searchTerm === "" ? "default" : "outline"} 
                size="sm" 
                onClick={() => {setSearchTerm(""); fetchMarketPrices()}}
              >
                All Prices
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchMarketPrices("comparison")}
              >
                Compare Markets
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchMarketPrices("regional")}
              >
                Regional Analysis
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchMarketPrices("cropwise")}
              >
                Crop-wise Prices
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {marketPrices.map((price, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{price.crop} - {price.variety}</h3>
                          <p className="text-sm text-gray-600">{price.market}, {price.district}</p>
                          <p className="text-xs text-gray-500">{new Date(price.date).toLocaleDateString()}</p>
                          {price.quality && (
                            <Badge variant="secondary" className="text-xs mt-1">{price.quality}</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-600">₹{price.price}</span>
                            <div className={`flex items-center gap-1 ${
                              price.trend === "up" ? "text-green-600" : price.trend === "down" ? "text-red-600" : "text-gray-600"
                            }`}>
                              <TrendingUp className={`h-4 w-4 ${
                                price.trend === "down" ? "rotate-180" : "
                              }`} />
                              <span className="text-sm">{price.change}%</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Min: ₹{price.minPrice} | Max: ₹{price.maxPrice}</p>
                          {price.arrivals > 0 && (
                            <p className="text-xs text-gray-500">Arrivals: {price.arrivals} quintals</p>
                          )}
                          <div className="flex gap-1 mt-2">
                            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                              View Trend
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                              Compare
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!loading && marketPrices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No market prices available.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}