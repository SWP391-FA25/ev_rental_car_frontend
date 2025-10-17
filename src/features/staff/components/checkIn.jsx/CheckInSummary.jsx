"use client"

import { Card, CardContent } from '../../../shared/components/ui/card'
import { CheckCircle, AlertCircle } from "lucide-react"

export function CheckInSummary({ totalImages, categoriesCovered, totalCategories }) {
    const isComplete = totalImages > 0 && categoriesCovered === totalCategories

    return (
        <Card className={isComplete ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}>
            <CardContent className="pt-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tổng Số Ảnh:</span>
                        <span className="font-semibold text-lg">{totalImages}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Danh Mục Đã Tải:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">
                                {categoriesCovered}/{totalCategories}
                            </span>
                            {isComplete ? (
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
