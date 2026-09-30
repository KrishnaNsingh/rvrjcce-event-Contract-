"use client";

import React, { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface CarouselImage {
  src: string;
  alt?: string;
  title?: string;
  category?: string;
}

export interface CylinderCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  images: CarouselImage[];
  containerClassName?: string;
  cardClassName?: string;
  animationDuration?: number; // in seconds
  cardWidth?: number; // in pixels
  onImageClick?: (image: CarouselImage, index: number) => void;
}

export const CylinderCarousel = React.forwardRef<HTMLDivElement, CylinderCarouselProps>(
  (
    {
      images,
      className,
      containerClassName,
      cardClassName,
      animationDuration = 32,
      cardWidth = 240,
      onImageClick,
      ...props
    },
    ref
  ) => {
    const N = images.length;
    const [currentWidth, setCurrentWidth] = useState(cardWidth);

    // Responsive card width calculation for seamless mobile viewports
    useEffect(() => {
      const handleResize = () => {
        if (typeof window !== "undefined") {
          if (window.innerWidth < 480) {
            setCurrentWidth(140);
          } else if (window.innerWidth < 768) {
            setCurrentWidth(170);
          } else if (window.innerWidth < 1024) {
            setCurrentWidth(200);
          } else {
            setCurrentWidth(cardWidth);
          }
        }
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [cardWidth]);

    // Calculate 3D cylinder radius in pixels for universal browser support
    const radius = useMemo(() => {
      if (N <= 1) return currentWidth;
      const halfAngleRad = Math.PI / N;
      return ((currentWidth / 2) + 8) / Math.tan(halfAngleRad);
    }, [currentWidth, N]);

    const customStyle = {
      "--n": N,
      "--w": `${currentWidth}px`,
      "--ba": `calc(1turn / var(--n))`,
      "--radius": `${radius.toFixed(2)}px`,
      "--anim-dur": `${animationDuration}s`,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={cn(
          "cylinder-carousel-viewport w-full h-full min-h-[460px] md:min-h-[540px] grid place-items-center overflow-hidden",
          className
        )}
        style={{
          perspective: "38em",
          maskImage: "linear-gradient(90deg, transparent 0%, #000 16% 84%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 16% 84%, transparent 100%)",
          display: "grid",
          placeItems: "center",
          width: "100%",
          minHeight: "480px",
          overflow: "hidden",
          position: "relative"
        }}
        {...props}
      >
        <div
          className={cn(
            "cylinder-carousel-ring grid place-items-center [transform-style:preserve-3d]",
            containerClassName
          )}
          style={{
            ...customStyle,
            display: "grid",
            placeItems: "center",
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            animation: "ry var(--anim-dur) linear infinite",
            position: "relative"
          }}
        >
          {/* Keyframes and interactive hover-pause */}
          <style>
            {`
              @keyframes ry {
                to { transform: rotateY(1turn); }
              }
              .cylinder-carousel-ring:hover {
                animation-play-state: paused !important;
              }
              .cylinder-carousel-card:hover {
                transform: rotateY(calc(var(--i) * var(--ba))) translateZ(calc(-1 * var(--radius))) scale(1.04) !important;
              }
            `}
          </style>

          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => onImageClick?.(img, i)}
              className={cn(
                "cylinder-carousel-card [grid-area:1/1] rounded-2xl [backface-visibility:hidden]",
                cardClassName
              )}
              title={img.title || img.alt || `Photo ${i + 1}`}
              style={{
                gridArea: "1 / 1",
                width: "var(--w)",
                aspectRatio: "7/10",
                borderRadius: "1rem",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                "--i": i,
                // Direct translateZ using JavaScript computed radius with CSS tan fallback
                transform: "rotateY(calc(var(--i) * var(--ba))) translateZ(calc(-1 * var(--radius, calc((0.5 * var(--w) + 0.5em) / tan(0.5 * var(--ba))))))",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 18px 40px -10px rgba(14, 34, 61, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease",
              } as React.CSSProperties}
            >
              <img
                src={img.src}
                alt={img.alt || `Carousel image ${i + 1}`}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  pointerEvents: "none"
                }}
              />
              <div
                className="cylinder-card-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(14, 34, 61, 0.88) 0%, rgba(14, 34, 61, 0.15) 50%, transparent 100%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "0.875rem",
                  color: "#FFFFFF",
                  pointerEvents: "none"
                }}
              >
                {img.category && (
                  <span
                    style={{
                      fontSize: "0.625rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "#FFB399",
                      fontWeight: 700,
                      marginBottom: "2px"
                    }}
                  >
                    {img.category}
                  </span>
                )}
                {img.title && (
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      lineHeight: 1.25,
                      textShadow: "0 1px 4px rgba(0, 0, 0, 0.6)"
                    }}
                  >
                    {img.title}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

CylinderCarousel.displayName = "CylinderCarousel";
export default CylinderCarousel;
