"use client"

import { useState, useEffect } from "react"
import { Package, Clock, CheckCircle, XCircle, Eye, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [cropOrders, setCropOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    fetchCropOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/marketplace/orders?userId=default_user")
      const data = await response.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const fetchCropOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/marketplace/sell?farmerId=default_buyer")
      const data = await response.json()
      if (data.success) {
        const ordersFromListings = data.data.listings.flatMap(listing => 
          listing.orders.map(order => ({
            ...order,
            cropName: listing.cropName,
            variety: listing.variety,
            farmerName: listing.farmer.name,
            farmerMobile: listing.farmer.mobile,
            listingId: listing.id
          }))
        )
        setCropOrders(ordersFromListings)
      }
    } catch (error) {
      console.error("Error fetching crop orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (listingId, orderId, status) => {
    try {
      const response = await fetch("/api/marketplace/sell", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          action: "update_order",
          orderId,
          status,
          deliveryDate: status === "accepted" ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null
        })
      })
      
      const data = await response.json()
      if (data.success) {
        alert(data.message)
        fetchCropOrders()
      }
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "accepted": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "completed": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />
      case "accepted": return <CheckCircle className="h-4 w-4" />
      case "rejected": return <XCircle className="h-4 w-4" />
      case "completed": return <Package className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-800 mb-2">📦 My Orders</h1>
          <p className="text-gray-600">Track your product and crop orders</p>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Product Orders</TabsTrigger>
            <TabsTrigger value="crops">Crop Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Product Orders</h3>
                  <p className="text-gray-500">You haven't placed any product orders yet</p>
                  <Button className="mt-4" onClick={() => window.location.href = "/marketplace"}>
                    Browse Products
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Order #{order.orderId}</CardTitle>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Items</h4>
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {item.name} x {item.quantity}
                            </div>
                          ))}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Total Amount</h4>
                          <p className="text-lg font-bold text-green-600">₹{order.pricing.total}</p>
                          <p className="text-sm text-gray-500">Payment: {order.payment.method}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Delivery</h4>
                          <p className="text-sm text-gray-600">{order.shippingAddress.name}</p>
                          <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                          <p className="text-sm text-gray-500">
                            Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="crops">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : cropOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Crop Orders</h3>
                  <p className="text-gray-500">You haven't placed any crop orders yet</p>
                  <Button className="mt-4" onClick={() => window.location.href = "/marketplace?tab=crops"}>
                    Browse Fresh Crops
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {cropOrders.map((order) => (
                  <Card key={order._id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{order.cropName} - {order.variety}</CardTitle>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Order Details</h4>
                          <p className="text-sm text-gray-600">Quantity: {order.quantity} kg</p>
                          <p className="text-sm text-gray-600">Price: ₹{order.price} per kg</p>
                          <p className="text-sm text-gray-600">Total: ₹{order.quantity * order.price}</p>
                          <p className="text-sm text-gray-500">
                            Ordered: {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Farmer Details</h4>
                          <p className="text-sm text-gray-600">{order.farmerName}</p>
                          <p className="text-sm text-gray-600">{order.farmerMobile}</p>
                          {order.deliveryDate && (
                            <p className="text-sm text-gray-500">
                              Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Actions</h4>
                          {order.status === "pending" && (
                            <div className="space-y-2">
                              <Button 
                                size="sm" 
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => updateOrderStatus(order.listingId, order._id, "accepted")}
                              >
                                Accept Order
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full"
                                onClick={() => updateOrderStatus(order.listingId, order._id, "rejected")}
                              >
                                Reject Order
                              </Button>
                            </div>
                          )}
                          {order.status === "accepted" && (
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => updateOrderStatus(order.listingId, order._id, "completed")}
                            >
                              Mark as Delivered
                            </Button>
                          )}
                          {order.status === "completed" && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>Rate this order</span>
                            </div>
                          )}
                          <Button size="sm" variant="outline" className="w-full mt-2">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                      {order.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <h5 className="font-medium text-sm mb-1">Notes:</h5>
                          <p className="text-sm text-gray-600">{order.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}