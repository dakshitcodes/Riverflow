"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { ReactElement, useEffect, useMemo, useState } from "react";

export const AnimatedList = React.memo(
    ({
        className,
        children,
        delay = 1000,
    }: {
        className?: string;
        children: React.ReactNode;
        delay?: number;
    }) => {
        const [index, setIndex] = useState(0);
        
        // Memoize childrenArray to prevent resetting useMemo dependency on every render
        const childrenArray = useMemo(() => React.Children.toArray(children), [children]);

        // Reset index when children change
        useEffect(() => {
            setIndex(0);
        }, [childrenArray]);

        useEffect(() => {
            if (childrenArray.length === 0) return;
            
            const interval = setInterval(() => {
                setIndex(prevIndex => {
                    if (prevIndex >= childrenArray.length - 1) {
                        clearInterval(interval);
                        return prevIndex;
                    }
                    return prevIndex + 1;
                });
            }, delay);

            return () => clearInterval(interval);
        }, [childrenArray.length, delay]);

        const itemsToShow = useMemo(
            () => childrenArray.slice(0, index + 1),
            [index, childrenArray]
        );

        return (
            <div className={`flex flex-col items-center gap-4 ${className}`}>
                <AnimatePresence mode="popLayout">
                    {itemsToShow.map(item => (
                        <AnimatedListItem key={(item as ReactElement).key}>{item}</AnimatedListItem>
                    ))}
                </AnimatePresence>
            </div>
        );
    }
);

AnimatedList.displayName = "AnimatedList";

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
    const animations = {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1, originY: 0 },
        exit: { scale: 0, opacity: 0 },
        transition: { type: "spring", stiffness: 350, damping: 40 },
    } as const;

    return (
        <motion.div {...animations} layout="position" className="mx-auto w-full">
            {children}
        </motion.div>
    );
}
