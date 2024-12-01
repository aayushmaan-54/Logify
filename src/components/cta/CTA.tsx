import { ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"

export default function CTA() {
  return (
    <>
      <div className="mt-24">
        <Card className="bg-gradient-to-r from-orange-100 to-amber-100">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-orange-900 mb-6">
              Start Logging on Your Journey Today
            </h2>
            <p className="text-lg text-orange-700 mb-8 max-w-2xl mx-auto">
              Join the writers who have already discovered the power of
              digital journaling.
            </p>
            <Button size="lg" variant="journal" className="animate-bounce">
              Get Started for Free <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}