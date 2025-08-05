import { NextResponse } from "next/server"

// Mock market data - in production, this would call Agmarknet API
const mockMarketData = {
  prices: [
    {
      crop: "Rice",
      variety: "Basmati",
      price: 2500,
      change: 5.2,
      trend: "up",
      market: "Guntur",
      date: "2024-01-15",
      minPrice: 2400,
      maxPrice: 2600,
      avgPrice: 2500,
    },
    {
      crop: "Wheat",
      variety: "Durum",
      price: 2200,
      change: -2.1,
      trend: "down",
      market: "Guntur",
      date: "2024-01-15",
      minPrice: 2150,
      maxPrice: 2250,
      avgPrice: 2200,
    },
    {
      crop: "Cotton",
      variety: "Medium Staple",
      price: 5800,
      change: 8.7,
      trend: "up",
      market: "Guntur",
      date: "2024-01-15",
      minPrice: 5600,
      maxPrice: 6000,
      avgPrice: 5800,
    },
    {
      crop: "Sugarcane",
      variety: "Co-86032",
      price: 350,
      change: 1.5,
      trend: "up",
      market: "Guntur",
      date: "2024-01-15",
      minPrice: 340,
      maxPrice: 360,
      avgPrice: 350,
    },
  ],
  trends: [
    { month: "Jan", rice: 2300, wheat: 2100, cotton: 5200 },
    { month: "Feb", rice: 2400, wheat: 2150, cotton: 5400 },
    { month: "Mar", rice: 2350, wheat: 2200, cotton: 5600 },
    { month: "Apr", rice: 2450, wheat: 2180, cotton: 5500 },
    { month: "May", rice: 2500, wheat: 2200, cotton: 5800 },
  ],
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const market = searchParams.get("market") || "Guntur"
  const crop = searchParams.get("crop")

  let data = mockMarketData

  if (crop) {
    data = {
      ...mockMarketData,
      prices: mockMarketData.prices.filter((p) => p.crop.toLowerCase().includes(crop.toLowerCase())),
    }
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json({
    success: true,
    data: data,
    market: market,
    timestamp: new Date().toISOString(),
  })
}
