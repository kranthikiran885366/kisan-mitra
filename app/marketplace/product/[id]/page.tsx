"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Star, Heart, ShoppingCart, Truck, MessageCircle, Phone, MapPin, Plus, Minus, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductDetail {
  id: string
  name: string
  description: string
  category: string
  brand: string
  price: { mrp: number; selling: number; discount: number }
  specifications: any
  seller: any
  ratings: { average: number; count: number }
  reviews: any[]
  shipping: { freeShipping: boolean; deliveryDays: number }
  negotiable: boolean
  images: { url: string; alt: string }[]
  tags: string[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showNegotiation, setShowNegotiation] = useState(false)
  const [negotiationPrice, setNegotiationPrice] = useState("")
  const [negotiationMessage, setNegotiationMessage] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/marketplace/products/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setProduct(data.data)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    try {
      await fetch("/api/marketplace/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product?.id, quantity })
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  const startNegotiation = async () => {
    try {
      const response = await fetch("/api/marketplace/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          proposedPrice: parseInt(negotiationPrice),
          message: negotiationMessage
        })
      })
      
      if (response.ok) {
        setShowNegotiation(false)
        setNegotiationPrice("")
        setNegotiationMessage("")
        alert("Negotiation request sent to seller!")
      }
    } catch (error) {
      console.error("Error starting negotiation:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images[selectedImage]?.url || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-4 right-4 p-2 bg-white/80"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={img.alt}
                    className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                      selectedImage === idx ? "border-green-500" : "border-gray-200"
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              <div className="flex items-center gap-2 mb-4">
                {product.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.ratings.average}</span>
                <span className="text-gray-500">({product.ratings.count} reviews)</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-green-600">₹{product.price.selling}</span>
                <span className="text-lg text-gray-500 line-through">₹{product.price.mrp}</span>
                <Badge className="bg-green-100 text-green-800">
                  {product.price.discount}% OFF
                </Badge>
              </div>
              <p className="text-sm text-gray-600">Inclusive of all taxes</p>
            </div>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{product.seller.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{product.seller.rating}</span>
                      {product.seller.verified && (
                        <Badge variant="secondary" className="text-xs ml-2">Verified</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-3 w-3" />
                  {product.seller.location}
                </div>
              </CardContent>
            </Card>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2">{quantity}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={addToCart}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                    Buy Now
                  </Button>
                </div>
                
                {product.negotiable && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowNegotiation(true)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Negotiate Price
                  </Button>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Delivery Information</span>
              </div>
              <p className="text-sm text-gray-600">
                {product.shipping.freeShipping ? "Free delivery" : "Shipping charges apply"} • 
                Delivered in {product.shipping.deliveryDays} days
              </p>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="specifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.ratings.count})</TabsTrigger>
            <TabsTrigger value="seller">Seller Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-gray-600">{value as string}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.reviews?.map((review, idx) => (
                    <div key={idx} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.user}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="seller" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Business Name</span>
                    <span>{product.seller.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{product.seller.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Location</span>
                    <span>{product.seller.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Contact</span>
                    <span>{product.seller.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Negotiation Modal */}
        {showNegotiation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Negotiate Price</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Offer (₹)</label>
                  <input
                    type="number"
                    value={negotiationPrice}
                    onChange={(e) => setNegotiationPrice(e.target.value)}
                    placeholder={`Current price: ₹${product.price.selling}`}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Message to Seller</label>
                  <textarea
                    value={negotiationMessage}
                    onChange={(e) => setNegotiationMessage(e.target.value)}
                    placeholder="Explain your offer..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNegotiation(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={startNegotiation}
                  disabled={!negotiationPrice || !negotiationMessage}
                >
                  Send Offer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}