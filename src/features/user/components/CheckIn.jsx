"use client"

import PropTypes from 'prop-types'
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/**
 * @typedef {Object} CheckInRequest
 * @property {string} id
 * @property {string} bookingId
 * @property {string} vehicleId
 * @property {string} inspectionType
 * @property {number} batteryLevel
 * @property {number} mileage
 * @property {string} exteriorCondition
 * @property {string} interiorCondition
 * @property {string} tireCondition
 * @property {string[]} accessories
 * @property {string} [damageNotes]
 * @property {string} [notes]
 * @property {string[]} images
 * @property {string} createdAt
 * @property {{name: string, id: string}} [staffInfo]
 * @property {{vehicleName: string, licensePlate: string, startTime: string}} [bookingDetails]
 * @property {'PENDING' | 'CONFIRMED' | 'REJECTED'} [confirmationStatus]
 */

export function CheckInRequestView({ request, onBack, onConfirm, isConfirming }) {
  const [agreedToConditions, setAgreedToConditions] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const getConditionColor = (condition) => {
    switch (condition) {
      case "GOOD":
        return "bg-green-100 text-green-800"
      case "FAIR":
        return "bg-yellow-100 text-yellow-800"
      case "POOR":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isAlreadyConfirmed = request.confirmationStatus === "CONFIRMED"

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Check-In Details</h1>
          <p className="text-muted-foreground">
            {request.bookingDetails?.vehicleName} - {request.bookingDetails?.licensePlate}
          </p>
        </div>
      </div>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Vehicle Name</p>
              <p className="font-semibold text-lg">{request.bookingDetails?.vehicleName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">License Plate</p>
              <p className="font-semibold text-lg">{request.bookingDetails?.licensePlate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-In Time</p>
              <p className="font-semibold">{new Date(request.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Staff</p>
              <p className="font-semibold">{request.staffInfo?.name || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Condition */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Condition Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Battery Level */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Battery Level</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${request.batteryLevel}%` }}
                  />
                </div>
                <span className="font-semibold text-lg">{request.batteryLevel}%</span>
              </div>
            </div>

            {/* Mileage */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Odometer Reading</p>
              <p className="font-semibold text-lg">{request.mileage.toLocaleString()} km</p>
            </div>
          </div>

          {/* Condition Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Exterior</p>
              <Badge className={`${getConditionColor(request.exteriorCondition)} border-0`}>
                {request.exteriorCondition}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Interior</p>
              <Badge className={`${getConditionColor(request.interiorCondition)} border-0`}>
                {request.interiorCondition}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tires</p>
              <Badge className={`${getConditionColor(request.tireCondition)} border-0`}>{request.tireCondition}</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Accessories</p>
              <Badge variant="outline">
                {request.accessories?.includes("ALL_PRESENT") ? "All Present" : "Missing Items"}
              </Badge>
            </div>
          </div>

          {/* Damage Notes */}
          {request.damageNotes && (
            <div className="space-y-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-900">Damage Notes</p>
              <p className="text-sm text-amber-800">{request.damageNotes}</p>
            </div>
          )}

          {/* Additional Notes */}
          {request.notes && (
            <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Additional Notes</p>
              <p className="text-sm text-blue-800">{request.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Photos ({request.images?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {request.images && request.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {request.images.map((image, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Check-in photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No photos available</p>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Section */}
      {!isAlreadyConfirmed && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Confirm Check-In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agree-condition"
                  checked={agreedToConditions}
                  onCheckedChange={setAgreedToConditions}
                  className="mt-1"
                />
                <Label htmlFor="agree-condition" className="text-sm cursor-pointer leading-relaxed">
                  I confirm that I have reviewed all the vehicle condition photos and agree with the documented
                  condition of the vehicle as shown above. I acknowledge the battery level, mileage, and any noted
                  damages.
                </Label>
              </div>
            </div>

            <Button onClick={onConfirm} disabled={!agreedToConditions || isConfirming} className="w-full" size="lg">
              {isConfirming ? "Confirming..." : "Confirm Check-In"}
            </Button>
          </CardContent>
        </Card>
      )}

      {isAlreadyConfirmed && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-900">
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <p className="font-semibold">Check-In Confirmed</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vehicle Photo</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Full size check-in photo"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

CheckInRequestView.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.string.isRequired,
    bookingId: PropTypes.string.isRequired,
    vehicleId: PropTypes.string.isRequired,
    inspectionType: PropTypes.string.isRequired,
    batteryLevel: PropTypes.number.isRequired,
    mileage: PropTypes.number.isRequired,
    exteriorCondition: PropTypes.string.isRequired,
    interiorCondition: PropTypes.string.isRequired,
    tireCondition: PropTypes.string.isRequired,
    accessories: PropTypes.arrayOf(PropTypes.string).isRequired,
    damageNotes: PropTypes.string,
    notes: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    createdAt: PropTypes.string.isRequired,
    staffInfo: PropTypes.shape({
      name: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired
    }),
    bookingDetails: PropTypes.shape({
      vehicleName: PropTypes.string.isRequired,
      licensePlate: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired
    }),
    confirmationStatus: PropTypes.oneOf(['PENDING', 'CONFIRMED', 'REJECTED'])
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isConfirming: PropTypes.bool.isRequired
}
