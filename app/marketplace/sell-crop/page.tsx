"use client"

import { useState } from "react"
import { Upload, MapPin, DollarSign, Package, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

const cropCategories = [
  { value: "vegetables", label: "Vegetables" },
  { value: "fruits", label: "Fruits" },
  { value: "grains", label: "Grains" },
  { value: "pulses", label: "Pulses" },
  { value: "spices", label: "Spices" }
]

export default function SellCropPage() {
  const [formData, setFormData] = useState({
    cropName: "",
    category: "",
    variety: "",
    quantity: { available: "", unit: "kg" },
    pricing: { basePrice: "", negotiable: true },
    quality: { grade: "A", organic: false, harvestDate: "" },
    location: { village: "", district: "", state: "", pincode: "" },
    images: []
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const submitListing = async () => {
    setLoading(true)
    try {
      const { marketplaceApi } = await import('@/lib/api')
      await marketplaceApi.sell({
        farmerId: "default_farmer",
        ...formData,
        availability: {
          readyForHarvest: true,
          availableFrom: new Date().toISOString().split('T')[0],
          availableTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        delivery: { farmPickup: true, homeDelivery: false }
      })
      
      alert("Crop listing created successfully!")
      window.location.href = "/marketplace"
    } catch (error) {
      console.error("Error creating listing:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-800 mb-2">Sell Your Crop</h1>
          <p className="text-gray-600">List your crops for direct sale to buyers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Crop Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Crop Name</Label>
                <Input
                  value={formData.cropName}
                  onChange={(e) => setFormData(prev => ({ ...prev, cropName: e.target.value }))}
                  placeholder="e.g., Tomato, Rice, Wheat"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Variety</Label>
                <Input
                  value={formData.variety}
                  onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                  placeholder="e.g., Cherry, Basmati"
                />
              </div>
              <div>
                <Label>Available Quantity (kg)</Label>
                <Input
                  type="number"
                  value={formData.quantity.available}
                  onChange={(e) => handleInputChange('quantity', 'available', e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Base Price (₹ per kg)</Label>
                <Input
                  type="number"
                  value={formData.pricing.basePrice}
                  onChange={(e) => handleInputChange('pricing', 'basePrice', e.target.value)}
                  placeholder="Enter price"
                />
              </div>
              <div>
                <Label>Harvest Date</Label>
                <Input
                  type="date"
                  value={formData.quality.harvestDate}
                  onChange={(e) => handleInputChange('quality', 'harvestDate', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Village</Label>
                <Input
                  value={formData.location.village}
                  onChange={(e) => handleInputChange('location', 'village', e.target.value)}
                  placeholder="Village name"
                />
              </div>
              <div>
                <Label>District</Label>
                <Input
                  value={formData.location.district}
                  onChange={(e) => handleInputChange('location', 'district', e.target.value)}
                  placeholder="District"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>State</Label>
                <Input
                  value={formData.location.state}
                  onChange={(e) => handleInputChange('location', 'state', e.target.value)}
                  placeholder="State"
                />
              </div>
              <div>
                <Label>Pincode</Label>
                <Input
                  value={formData.location.pincode}
                  onChange={(e) => handleInputChange('location', 'pincode', e.target.value)}
                  placeholder="Pincode"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="organic"
                checked={formData.quality.organic}
                onCheckedChange={(checked) => handleInputChange('quality', 'organic', checked)}
              />
              <Label htmlFor="organic">Organic Certified</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="negotiable"
                checked={formData.pricing.negotiable}
                onCheckedChange={(checked) => handleInputChange('pricing', 'negotiable', checked)}
              />
              <Label htmlFor="negotiable">Price is negotiable</Label>
            </div>

            <Button
              onClick={submitListing}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Creating Listing..." : "Create Listing"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}