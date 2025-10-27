"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckInRequestView } from "../components/CheckIn"

/**
 * @typedef CheckInRequest
 * @type {object}
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

/** @type {CheckInRequest[]} */
const MOCK_CHECK_IN_REQUESTS = [
  {
    id: "checkin-001",
    bookingId: "booking-001",
    vehicleId: "vehicle-001",
    inspectionType: "CHECK_IN",
    batteryLevel: 85,
    mileage: 12450,
    exteriorCondition: "GOOD",
    interiorCondition: "GOOD",
    tireCondition: "GOOD",
    accessories: ["ALL_PRESENT"],
    damageNotes: "Small scratch on right door",
    notes: "Vehicle returned in good condition",
    images: [
      "/car-exterior-front-view.jpg",
      "/car-exterior-side-view.jpg",
      "/car-interior-dashboard.jpg",
      "/car-interior-seats.png",
      "/car-tires.jpg",
      "/car-battery.png",
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    staffInfo: {
      name: "Nguyễn Văn A",
      id: "staff-001",
    },
    bookingDetails: {
      vehicleName: "Tesla Model 3",
      licensePlate: "51A-123.45",
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    confirmationStatus: "PENDING",
  },
  {
    id: "checkin-002",
    bookingId: "booking-002",
    vehicleId: "vehicle-002",
    inspectionType: "CHECK_IN",
    batteryLevel: 92,
    mileage: 8920,
    exteriorCondition: "FAIR",
    interiorCondition: "GOOD",
    tireCondition: "GOOD",
    accessories: ["ALL_PRESENT"],
    damageNotes: "Minor dent on rear bumper",
    notes: "Vehicle needs minor touch-up",
    images: [
      "/car-exterior-front.png",
      "/car-exterior-rear.png",
      "/modern-car-interior.png",
      "/damaged-car.png",
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    staffInfo: {
      name: "Trần Thị B",
      id: "staff-002",
    },
    bookingDetails: {
      vehicleName: "VinFast VF8",
      licensePlate: "51B-456.78",
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    confirmationStatus: "CONFIRMED",
  },
  {
    id: "checkin-003",
    bookingId: "booking-003",
    vehicleId: "vehicle-003",
    inspectionType: "CHECK_IN",
    batteryLevel: 78,
    mileage: 15680,
    exteriorCondition: "POOR",
    interiorCondition: "FAIR",
    tireCondition: "FAIR",
    accessories: ["MISSING_ITEMS"],
    damageNotes: "Significant damage on left side, missing floor mat",
    notes: "Vehicle requires repair before next rental",
    images: [
      "/car-damage-left-side.jpg",
      "/car-interior-damage.jpg",
      "/car-tire-wear.jpg",
      "/car-missing-items.jpg",
      "/car-damage-detail.jpg",
      "/car-overall-condition.jpg",
    ],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    staffInfo: {
      name: "Lê Văn C",
      id: "staff-003",
    },
    bookingDetails: {
      vehicleName: "BMW i3",
      licensePlate: "51C-789.01",
      startTime: new Date().toISOString(),
    },
    confirmationStatus: "PENDING",
  },
]

export default function CheckInRequestPage() {
  const [requests, setRequests] = useState(MOCK_CHECK_IN_REQUESTS)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)

  const handleConfirmRequest = async (requestId) => {
    try {
      setConfirmingId(requestId)
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, confirmationStatus: "CONFIRMED" } : req)),
      )
      setSelectedRequest(null)
    } catch (error) {
      console.error("Failed to confirm request:", error)
    } finally {
      setConfirmingId(null)
    }
  }

  if (selectedRequest) {
    return (
      <CheckInRequestView
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
        onConfirm={() => handleConfirmRequest(selectedRequest.id)}
        isConfirming={confirmingId === selectedRequest.id}
      />
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Check-In Requests</h1>
        <p className="text-muted-foreground mt-1">Review vehicle condition photos and confirm check-in details</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No check-in requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{request.bookingDetails?.vehicleName || "Vehicle"}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{request.bookingDetails?.licensePlate}</p>
                  </div>
                  <Badge variant={request.confirmationStatus === "CONFIRMED" ? "default" : "secondary"}>
                    {request.confirmationStatus || "PENDING"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Battery Level</p>
                    <p className="font-semibold">{request.batteryLevel}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mileage</p>
                    <p className="font-semibold">{request.mileage.toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Exterior</p>
                    <p className="font-semibold">{request.exteriorCondition}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Photos</p>
                    <p className="font-semibold">{request.images?.length || 0} images</p>
                  </div>
                </div>

                {request.images && request.images.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {request.images.slice(0, 4).map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Check-in photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {request.images.length > 4 && (
                      <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">+{request.images.length - 4}</span>
                      </div>
                    )}
                  </div>
                )}

                <Button onClick={() => setSelectedRequest(request)} variant="outline" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
