"use client"

import { X } from "lucide-react"

export function ImagePreview({ images, onRemoveImage }) {
    if (images.length === 0) return null

    return (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {images.map((image) => (
                <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-lg border border-border bg-muted aspect-square"
                >
                    <img
                        src={image.preview || "/placeholder.svg"}
                        alt={`${image.category} photo`}
                        className="h-full w-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => onRemoveImage(image.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                        aria-label={`Xóa ảnh ${image.category}`}
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>
                </div>
            ))}
        </div>
    )
}
