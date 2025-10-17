"use client"

import { Upload } from "lucide-react"
import { Label } from '../../../shared/components/ui/label'
import { Badge } from '../../../shared/components/ui/badge'

export function ImageUploadSection({ category, imageCount, onImageUpload }) {
    const handleChange = (e) => {
        const files = e.currentTarget.files
        if (!files || files.length === 0) return

        // Validate file sizes
        const maxSize = 10 * 1024 * 1024 // 10MB
        const validFiles = Array.from(files).filter((file) => {
            if (file.size > maxSize) {
                console.warn(`File ${file.name} exceeds 10MB limit`)
                return false
            }
            return true
        })

        if (validFiles.length > 0) {
            onImageUpload({ currentTarget: { files: validFiles } }, category)
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">{category}</Label>
                <Badge variant="outline" className={imageCount > 0 ? "bg-emerald-100 text-emerald-800" : ""}>
                    {imageCount} ảnh
                </Badge>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 transition-all hover:border-emerald-500 hover:bg-emerald-50 active:scale-95">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    aria-label={`Tải lên ảnh cho danh mục ${category}`}
                />
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-center">Nhấp để tải lên hoặc kéo và thả</p>
                <p className="text-xs text-muted-foreground text-center">PNG, JPG, GIF tối đa 10MB</p>
            </label>
        </div>
    )
}
