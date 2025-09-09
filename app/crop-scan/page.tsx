"use client"

import { useState, useRef } from "react"
import { Camera, Upload, Scan, Leaf, AlertTriangle, CheckCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const cropTypes = [
  { value: "rice", label: "Rice" },
  { value: "wheat", label: "Wheat" },
  { value: "tomato", label: "Tomato" },
  { value: "cotton", label: "Cotton" }
]

export default function CropScanPage() {
  const [selectedImages, setSelectedImages] = useState([])
  const [cropName, setCropName] = useState("")
  const [diagnosis, setDiagnosis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef(null)

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: "leaf"
    }))
    setSelectedImages(prev => [...prev, ...newImages])
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      alert("Unable to access camera")
    }
  }

  const scanCrop = async () => {
    if (!cropName || selectedImages.length === 0) {
      alert("Please select crop type and upload at least one image")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/crop-diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId: "default_farmer",
          cropName,
          images: selectedImages.map(img => ({
            url: img.url,
            type: img.type
          })),
          symptoms: {
            observed: [],
            severity: "moderate",
            affectedArea: "leaves"
          },
          location: {
            district: "Sample District",
            state: "Sample State"
          }
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setDiagnosis(data.data)
        createCropGuidance(data.data)
      }
    } catch (error) {
      console.error("Error scanning crop:", error)
    } finally {
      setLoading(false)
    }
  }

  const createCropGuidance = async (diagnosisData) => {
    try {
      await fetch("/api/crop-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId: "default_farmer",
          cropName,
          variety: "Common",
          location: {
            district: "Sample District",
            state: "Sample State"
          },
          growthStage: "vegetative",
          healthStatus: {
            overall: diagnosisData.priority === "high" ? "poor" : "fair",
            issues: [{
              type: "disease",
              severity: diagnosisData.priority,
              description: diagnosisData.aiDiagnosis.disease.name
            }]
          },
          images: selectedImages,
          soilType: "mixed"
        })
      })
    } catch (error) {
      console.error("Error creating guidance:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-800 mb-2">🔍 Crop Disease Scanner</h1>
          <p className="text-gray-600">AI-powered crop disease detection and treatment recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Capture Crop Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!cameraActive ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Take a photo of affected crop parts</p>
                  <Button onClick={startCamera} className="mb-2">
                    <Camera className="h-4 w-4 mr-2" />
                    Open Camera
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                  <Button onClick={() => setCameraActive(false)} className="w-full">
                    Capture Photo
                  </Button>
                </div>
              )}
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Or upload images</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button type="button" variant="outline">Choose Images</Button>
                </Label>
              </div>

              {selectedImages.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Selected Images ({selectedImages.length})</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedImages.map((img, index) => (
                      <img key={index} src={img.url} alt={`Crop ${index + 1}`} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Crop Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Crop Type</Label>
                <Select value={cropName} onValueChange={setCropName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map((crop) => (
                      <SelectItem key={crop.value} value={crop.value}>{crop.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={scanCrop}
                disabled={loading || !cropName || selectedImages.length === 0}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? "Analyzing..." : "Scan Crop"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {diagnosis && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                AI Diagnosis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Primary Diagnosis
                  </h3>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{diagnosis.aiDiagnosis.disease.name}</span>
                      <Badge variant="secondary">{diagnosis.aiDiagnosis.disease.confidence}% confidence</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Category: {diagnosis.aiDiagnosis.disease.category}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Treatment Recommendations
                  </h3>
                  <div className="space-y-2">
                    {diagnosis.treatment.recommended.map((treatment, index) => (
                      <div key={index} className="bg-green-50 p-3 rounded-lg">
                        <span className="font-medium text-sm">{treatment.product}</span>
                        <p className="text-xs text-gray-600">{treatment.dosage} • {treatment.frequency}</p>
                        <p className="text-xs text-green-600 font-medium">Est. Cost: ₹{treatment.cost}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.location.href = "/consultation"}
                >
                  Consult Expert
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => window.location.href = "/marketplace?tab=products&search=" + diagnosis.treatment.recommended[0]?.product}
                >
                  Buy Treatment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}