import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import MarketPrice from "@/server/models/MarketPrice"

export async function GET(request: Request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const market = searchParams.get("market")
    const crop = searchParams.get("crop")
    const district = searchParams.get("district")
    const state = searchParams.get("state")
    const days = parseInt(searchParams.get("days") || "7")
    const type = searchParams.get("type") || "current"
    const region = searchParams.get("region")
    const compare = searchParams.get("compare") === "true"

    let query = {
      date: {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    }

    if (crop) {
      query.cropName = { $regex: crop, $options: "i" }
    }
    if (district) {
      query["market.district"] = { $regex: district, $options: "i" }
    }
    if (state) {
      query["market.state"] = { $regex: state, $options: "i" }
    }
    if (region) {
      query.$or = [
        { "market.district": { $regex: region, $options: "i" } },
        { "market.state": { $regex: region, $options: "i" } },
        { "market.name": { $regex: region, $options: "i" } }
      ]
    }

    if (type === "current") {
      // Get latest prices
      const prices = await MarketPrice.find(query)
        .sort({ date: -1 })
        .limit(20)
        .lean()

      // Calculate trends for each crop
      const pricesWithTrends = await Promise.all(
        prices.map(async (price) => {
          const trend = await MarketPrice.calculateTrend(
            price.cropName,
            price.market.district,
            7
          )
          return {
            crop: price.cropName,
            variety: price.variety,
            price: price.prices.modal,
            change: parseFloat(trend.percentage),
            trend: trend.direction,
            market: price.market.name,
            district: price.market.district,
            state: price.market.state,
            date: price.date,
            minPrice: price.prices.minimum,
            maxPrice: price.prices.maximum,
            avgPrice: price.prices.average,
            arrivals: price.arrivals,
            quality: price.quality
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: {
          prices: pricesWithTrends,
          market: district || state || "All Markets",
          timestamp: new Date().toISOString()
        }
      })
    }

    if (type === "trends") {
      // Get price history for trends
      const trendData = await MarketPrice.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              cropName: "$cropName",
              month: { $month: "$date" },
              year: { $year: "$date" }
            },
            avgPrice: { $avg: "$prices.modal" },
            date: { $first: "$date" }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        }
      ])

      const trends = trendData.reduce((acc, item) => {
        const monthName = new Date(item.date).toLocaleDateString('en', { month: 'short' })
        const existing = acc.find(t => t.month === monthName)
        if (existing) {
          existing[item._id.cropName.toLowerCase()] = Math.round(item.avgPrice)
        } else {
          acc.push({
            month: monthName,
            [item._id.cropName.toLowerCase()]: Math.round(item.avgPrice)
          })
        }
        return acc
      }, [])

      return NextResponse.json({
        success: true,
        data: { trends },
        timestamp: new Date().toISOString()
      })
    }

    if (type === "comparison" || compare) {
      // Compare prices across different markets
      const comparison = await MarketPrice.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              cropName: "$cropName",
              district: "$market.district",
              state: "$market.state"
            },
            avgPrice: { $avg: "$prices.modal" },
            minPrice: { $min: "$prices.minimum" },
            maxPrice: { $max: "$prices.maximum" },
            latestPrice: { $last: "$prices.modal" },
            marketName: { $last: "$market.name" },
            date: { $last: "$date" },
            arrivals: { $sum: "$arrivals" },
            count: { $sum: 1 }
          }
        },
        { $sort: { avgPrice: -1 } }
      ])

      // Calculate price differences
      const comparisonWithDiff = comparison.map(item => {
        const highestPrice = Math.max(...comparison.filter(c => c._id.cropName === item._id.cropName).map(c => c.avgPrice))
        const priceDiff = ((item.avgPrice - highestPrice) / highestPrice * 100).toFixed(2)
        return {
          ...item,
          priceDifference: parseFloat(priceDiff),
          isHighest: item.avgPrice === highestPrice
        }
      })

      return NextResponse.json({
        success: true,
        data: { comparison: comparisonWithDiff },
        timestamp: new Date().toISOString()
      })
    }

    if (type === "regional") {
      // Regional price analysis
      const regional = await MarketPrice.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$market.state",
            crops: {
              $push: {
                cropName: "$cropName",
                price: "$prices.modal",
                district: "$market.district",
                date: "$date"
              }
            },
            avgPrice: { $avg: "$prices.modal" },
            totalArrivals: { $sum: "$arrivals" }
          }
        },
        { $sort: { avgPrice: -1 } }
      ])

      return NextResponse.json({
        success: true,
        data: { regional },
        timestamp: new Date().toISOString()
      })
    }

    if (type === "cropwise") {
      // Crop-wise latest pricing
      const cropwise = await MarketPrice.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$cropName",
            varieties: {
              $push: {
                variety: "$variety",
                price: "$prices.modal",
                market: "$market.name",
                district: "$market.district",
                date: "$date",
                quality: "$quality"
              }
            },
            avgPrice: { $avg: "$prices.modal" },
            minPrice: { $min: "$prices.modal" },
            maxPrice: { $max: "$prices.modal" },
            totalArrivals: { $sum: "$arrivals" },
            marketCount: { $sum: 1 }
          }
        },
        { $sort: { avgPrice: -1 } }
      ])

      return NextResponse.json({
        success: true,
        data: { cropwise },
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: false,
      message: "Invalid request type"
    }, { status: 400 })

  } catch (error) {
    console.error("Market data fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch market data" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const {
      cropName, variety, market, prices, unit, arrivals,
      quality, source, metadata
    } = body

    const marketPrice = new MarketPrice({
      cropName,
      variety,
      market,
      prices,
      unit: unit || "quintal",
      date: new Date(),
      arrivals: arrivals || 0,
      quality: quality || "average",
      source: source || "manual",
      metadata: metadata || {},
      isVerified: true
    })

    await marketPrice.save()

    return NextResponse.json({
      success: true,
      data: marketPrice,
      message: "Market price added successfully"
    })
  } catch (error) {
    console.error("Market price creation error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to add market price" },
      { status: 500 }
    )
  }
}
