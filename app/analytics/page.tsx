"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const translations = {
  en: {
    title: "Farm Analytics",
    overview: "Overview",
    backToDashboard: "Back to Dashboard",
  },
  hi: {
    title: "कृषि विश्लेषण",
    overview: "अवलोकन",
    backToDashboard: "डैशबोर्ड पर लौटें",
  },
} as const

export default function AnalyticsPage() {
  const router = useRouter()
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{translations.en.title}</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          {translations.en.backToDashboard}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{translations.en.overview}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Analytics page content coming soon.</p>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  )
}
 