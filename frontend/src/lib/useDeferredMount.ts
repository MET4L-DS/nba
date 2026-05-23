import { useState, useEffect } from "react";

/**
 * useDeferredMount — custom hook to defer rendering of heavy elements.
 * Promotes page load speed by staggering mounts across multiple animation frames.
 */
export function useDeferredMount(delayMs: number = 100): boolean {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsMounted(true);
		}, delayMs);
		return () => clearTimeout(timer);
	}, [delayMs]);

	return isMounted;
}
