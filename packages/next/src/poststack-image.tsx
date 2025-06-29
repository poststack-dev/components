"use client"

import * as React from "react"
import { cn } from "./lib/utils"
import { useEffect, useState, useCallback } from "react"

export interface PoststackImageProps extends React.HTMLAttributes<HTMLDivElement> {
  projectId?: string
  mediaId: string
  maxWidth?: number
  proportions?: "4:3" | "1:1" | "16:9" | "9:16"
  publicKey?: string
  debug?: boolean
  className?: string
  responsive?: boolean // Whether to refetch on resize
}

function getAspectRatio(proportions?: string): number {
  switch (proportions) {
    case "4:3":
      return 75
    case "1:1":
      return 100
    case "16:9":
      return 56.25
    case "9:16":
      return 177.78
    default:
      return 0 // Will make the image adapt to its natural aspect ratio
  }
}

async function testImageSupport(testImage: string): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  return new Promise<boolean>((resolve) => {
    const img = document.createElement('img')
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = testImage
  })
}

async function checkImageSupport(): Promise<{ avif: boolean; webp: boolean }> {
  if (typeof window === 'undefined') return { avif: false, webp: false }
  
  const testImages = {
    avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=',
    webp: 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
  }

  const [avif, webp] = await Promise.all([
    testImageSupport(testImages.avif),
    testImageSupport(testImages.webp)
  ])

  return { avif, webp }
}

export function PoststackImage({
  projectId,
  mediaId,
  maxWidth,
  proportions,
  publicKey,
  debug = false,
  className,
  responsive = false,
  ...props
}: PoststackImageProps) {
  const [elementWidth, setElementWidth] = useState<number>(0)
  const [viewportWidth, setViewportWidth] = useState<number>(0)
  const [imageSupport, setImageSupport] = useState({ avif: false, webp: false })
  const [imageUrl, setImageUrl] = useState<string>("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const resizeTimeoutRef = React.useRef<number>(0)

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      setElementWidth(containerRef.current.offsetWidth)
    }
    setViewportWidth(window.innerWidth)
  }, [])

  const debouncedUpdateDimensions = useCallback(() => {
    if (resizeTimeoutRef.current) {
      window.clearTimeout(resizeTimeoutRef.current)
    }
    resizeTimeoutRef.current = window.setTimeout(() => {
      updateDimensions()
    }, 2000)
  }, [updateDimensions])

  useEffect(() => {
    // Initial check for image format support
    checkImageSupport().then(setImageSupport)

    // Initial dimensions
    updateDimensions()

    // Update dimensions on resize if responsive is enabled
    if (responsive) {
      window.addEventListener('resize', debouncedUpdateDimensions)
      return () => {
        window.removeEventListener('resize', debouncedUpdateDimensions)
        if (resizeTimeoutRef.current) {
          window.clearTimeout(resizeTimeoutRef.current)
        }
      }
    }
  }, [responsive, debouncedUpdateDimensions, updateDimensions])

  // Get project ID from env if not provided
  const finalProjectId = projectId || process.env.NEXT_PUBLIC_POSTSTACK_PROJECT
  // Get public key from env if not provided
  const finalPublicKey = publicKey || process.env.NEXT_PUBLIC_POSTSTACK_PK
  const endpoint = process.env.NEXT_PUBLIC_POSTSTACK_ENDPOINT || 'https://api-euw1.poststack.dev'

  // Error state if required params are missing
  if (!finalProjectId || !finalPublicKey) {
    const aspectRatio = getAspectRatio(proportions)
    const containerStyle = aspectRatio ? { paddingBottom: `${aspectRatio}%` } : { minHeight: '200px' }

    return (
      <div
        className={cn("relative w-full", className)}
        {...props}
      >
        <div 
          className="relative w-full bg-muted rounded-lg overflow-hidden" 
          style={containerStyle}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-muted-foreground/5">
            <div className="text-center p-4">
              <p className="text-base font-medium text-muted-foreground">
                Missing Configuration
              </p>
              <p className="text-sm text-muted-foreground/80 mt-1">
                Please provide a project ID and public key
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Update image URL when dimensions change
  useEffect(() => {
    if (viewportWidth === 0) return

    const url = new URL(`${endpoint}/projects/${finalProjectId}/media/${mediaId}`)
    url.searchParams.append('public_key', finalPublicKey)
    url.searchParams.append('viewport_width', viewportWidth.toString())
    url.searchParams.append('max_width', (maxWidth || elementWidth).toString())
    
    setImageUrl(url.toString())
  }, [endpoint, finalProjectId, mediaId, finalPublicKey, viewportWidth, elementWidth, maxWidth])

  const aspectRatio = getAspectRatio(proportions)
  const containerStyle = aspectRatio ? { paddingBottom: `${aspectRatio}%` } : {}

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      {...props}
    >
      <div 
        className="w-full h-0 relative"
        style={containerStyle}
      >
        {viewportWidth > 0 && imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}
        
        {debug && (
          <div className="absolute top-0 left-0 bg-black/75 text-white p-2 text-xs font-mono z-10">
            <div>Element Width: {elementWidth}px</div>
            <div>Viewport Width: {viewportWidth}px</div>
            <div>Format Support: {JSON.stringify(imageSupport)}</div>
            <div>Project ID: {finalProjectId}</div>
            <div>Media ID: {mediaId}</div>
            <div>Responsive: {responsive.toString()}</div>
          </div>
        )}
      </div>
    </div>
  )
} 