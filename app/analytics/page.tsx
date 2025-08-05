"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Filter, Download, BarChart2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useRouter } from "next/navigation"

const translations = {
  en: {
    title: "Farm Analytics",
    overview: "Overview",
    revenue: "Revenue",
    expenses: "Expenses",
    profit: "Profit",
    yield: "Yield",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    thisYear: "This Year",
    lastYear: "Last Year",
    timePeriod: "Time Period",
    filterBy: "Filter by",
    allCrops: "All Crops",
    cropPerformance: "Crop Performance",
    revenueTrends: "Revenue Trends",
    expenseBreakdown: "Expense Breakdown",
    productivityMetrics: "Productivity Metrics",
    downloadReport: "Download Report",
    backToDashboard: "Back to Dashboard",
    month: "Month",
    week: "Week",
    day: "Day",
    category: "Category",
    amount: "Amount",
    percentage: "Percentage",
    total: "Total",
    average: "Average",
    max: "Max",
    min: "Min",
    forecast: "Forecast",
    actual: "Actual",
    target: "Target",
    variance: "Variance",
  },
  hi: {
    title: 
