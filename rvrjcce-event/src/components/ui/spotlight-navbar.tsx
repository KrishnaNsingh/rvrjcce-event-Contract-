"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NavItem {
    label: string;
    href: string;
    route?: string;
    sectionId?: string;
}

export interface SpotlightNavbarProps {
    items?: NavItem[];
    className?: string;
    onItemClick?: (item: NavItem, index: number) => void;
    defaultActiveIndex?: number;
    activeIndex?: number;
}

export function SpotlightNavbar({
    items = [
        { label: "Home", href: "#home" },
        { label: "Events", href: "#discovery-section" },
        { label: "Sports", href: "#sports-section" },
        { label: "Literary & Cultural", href: "#cultural-section" },
        { label: "Register", href: "/register" },
        { label: "Admin Portal", href: "/admin" },
    ],
    className,
    onItemClick,
    defaultActiveIndex = 0,
    activeIndex: controlledActiveIndex,
}: SpotlightNavbarProps) {
    const navRef = useRef<HTMLDivElement>(null);
    const [internalActiveIndex, setInternalActiveIndex] = useState(defaultActiveIndex);
    const [hoverX, setHoverX] = useState<number | null>(null);

    const activeIndex = controlledActiveIndex !== undefined ? controlledActiveIndex : internalActiveIndex;

    // Refs for the "light" positions so we can animate them imperatively
    const spotlightX = useRef(0);
    const ambienceX = useRef(0);

    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = nav.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setHoverX(x);
            spotlightX.current = x;
            nav.style.setProperty("--spotlight-x", `${x}px`);
        };

        const handleMouseLeave = () => {
            setHoverX(null);
            // When mouse leaves, spring the spotlight back to the active item
            const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
            if (activeItem) {
                const navRect = nav.getBoundingClientRect();
                const itemRect = activeItem.getBoundingClientRect();
                const targetX = itemRect.left - navRect.left + itemRect.width / 2;

                animate(spotlightX.current, targetX, {
                    type: "spring",
                    stiffness: 220,
                    damping: 24,
                    onUpdate: (v) => {
                        spotlightX.current = v;
                        nav.style.setProperty("--spotlight-x", `${v}px`);
                    }
                });
            }
        };

        nav.addEventListener("mousemove", handleMouseMove);
        nav.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            nav.removeEventListener("mousemove", handleMouseMove);
            nav.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [activeIndex]);

    // Handle the "Ambience" (Active Item) Movement
    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;
        const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

        if (activeItem) {
            const navRect = nav.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            const targetX = itemRect.left - navRect.left + itemRect.width / 2;

            animate(ambienceX.current, targetX, {
                type: "spring",
                stiffness: 220,
                damping: 24,
                onUpdate: (v) => {
                    ambienceX.current = v;
                    nav.style.setProperty("--ambience-x", `${v}px`);
                },
            });
        }
    }, [activeIndex]);

    const handleItemClick = (item: NavItem, index: number) => {
        setInternalActiveIndex(index);
        onItemClick?.(item, index);
    };

    return (
        <div className={cn("spotlight-navbar-wrapper relative flex justify-center", className)}>
            <nav
                ref={navRef}
                className={cn(
                    "spotlight-nav",
                    "relative h-10 rounded-full transition-all duration-300 overflow-hidden",
                    "flex items-center"
                )}
            >
                {/* Content */}
                <ul className="relative flex items-center h-full px-1.5 gap-0.5 z-[10] list-none m-0 p-0">
                    {items.map((item, idx) => {
                        const isActive = activeIndex === idx;
                        return (
                            <li key={idx} className="relative h-full flex items-center justify-center">
                                <a
                                    href={item.href}
                                    data-index={idx}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleItemClick(item, idx);
                                    }}
                                    className={cn(
                                        "spotlight-nav-link",
                                        isActive ? "spotlight-nav-link-active" : "spotlight-nav-link-inactive"
                                    )}
                                >
                                    {item.label}
                                </a>
                            </li>
                        );
                    })}
                </ul>

                {/* LIGHTING LAYERS */}
                {/* 1. Moving Spotlight (Follows Mouse) */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-full z-[1] transition-opacity duration-300"
                    style={{
                        opacity: hoverX !== null ? 1 : 0,
                        background: `
                            radial-gradient(
                                130px circle at var(--spotlight-x, 50%) 100%, 
                                var(--nav-spotlight-glow, rgba(14, 34, 61, 0.09)) 0%, 
                                transparent 60%
                            )
                        `
                    }}
                />

                {/* 2. Active State Ambience Bar (Underline glow at bottom edge) */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-[2.5px] z-[2]"
                    style={{
                        background: `
                            radial-gradient(
                                70px circle at var(--ambience-x, 50%) 0%, 
                                var(--nav-ambience-glow, #9E472A) 0%, 
                                transparent 100%
                            )
                        `
                    }}
                />
            </nav>
        </div>
    );
}

export default SpotlightNavbar;
