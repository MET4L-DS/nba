import { useEffect, useRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { useInView } from "motion/react";

import { cn } from "@/lib/utils";

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
	value: number;
	startValue?: number;
	direction?: "up" | "down";
	delay?: number;
	decimalPlaces?: number;
	duration?: number;
}

export function NumberTicker({
	value,
	startValue = 0,
	direction = "up",
	delay = 0,
	className,
	decimalPlaces = 0,
	duration = 1.5,
	...props
}: NumberTickerProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const isInView = useInView(ref, { once: true, margin: "0px" });

	useEffect(() => {
		if (!isInView) return;

		let rAFId: number;
		const startVal = direction === "down" ? value : startValue;
		const endVal = direction === "down" ? startValue : value;
		
		const timer = setTimeout(() => {
			const startTime = performance.now();
			const durationMs = duration * 1000;

			const tick = (now: number) => {
				const elapsed = now - startTime;
				const progress = Math.min(elapsed / durationMs, 1);
				
				// easeOutExpo deceleration curve: f(p) = p === 1 ? 1 : 1 - 2^(-10p)
				const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
				const current = startVal + (endVal - startVal) * ease;

				if (ref.current) {
					ref.current.textContent = Intl.NumberFormat("en-US", {
						minimumFractionDigits: decimalPlaces,
						maximumFractionDigits: decimalPlaces,
					}).format(current);
				}

				if (progress < 1) {
					rAFId = requestAnimationFrame(tick);
				}
			};

			rAFId = requestAnimationFrame(tick);
		}, delay * 1000);

		return () => {
			clearTimeout(timer);
			if (rAFId) cancelAnimationFrame(rAFId);
		};
	}, [isInView, value, startValue, direction, delay, decimalPlaces, duration]);

	return (
		<span
			ref={ref}
			className={cn(
				"inline-block tracking-wider text-black tabular-nums dark:text-white",
				className
			)}
			{...props}
		>
			{direction === "down" ? value : startValue}
		</span>
	);
}
