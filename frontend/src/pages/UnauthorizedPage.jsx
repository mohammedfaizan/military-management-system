// src/pages/UnauthorizedPage.jsx
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { Link } from "react-router-dom"

export const UnauthorizedPage = ({ route = 'this' }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-2  shadow-lg">
        <CardContent className="text-center py-10">
          <div className="flex justify-center mb-4 text-destructive/90">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-semibold text-destructive/90 mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to view {route} page.
          </p>
          <Button asChild>
            <Link to="/">Go Back Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
