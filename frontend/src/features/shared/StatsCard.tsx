import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export interface StatItem {
	label: string;
	value: number;
	icon: LucideIcon;
	gradient?: string;
	bgGradient?: string;
	color?: string;
	bgColor?: string;
	description?: string;
	suffix?: string;
}

interface StatsCardProps {
	stat: StatItem;
	isLoading?: boolean;
	variant?: "gradient" | "solid" | "outline";
}

const cardVariants = {
	hidden: { opacity: 0, y: 12 },
	visible: { 
		opacity: 1, 
		y: 0,
		transition: { ease: [0.16, 1, 0.3, 1] as const, duration: 0.45 } 
	}
};

export function StatsCard({
	stat,
	isLoading = false,
	variant = "outline",
}: StatsCardProps) {
	const Icon = stat.icon;

	if (variant === "gradient") {
		return (
			<motion.div
				variants={cardVariants}
				whileHover={{ y: -5, scale: 1.015, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
				whileTap={{ scale: 0.98 }}
				className="h-full cursor-pointer"
				style={{ willChange: "transform, opacity" }}
			>
				<Card
					className={`bg-linear-to-br ${stat.gradient || "from-blue-500 to-blue-600"} text-white border-0 shadow-lg h-full`}
				>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium opacity-90">
							{stat.label}
						</CardTitle>
						<Icon className="h-4 w-4 opacity-75 animate-pulse" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold font-mono">
							{isLoading ? (
								<span className="animate-pulse">--</span>
							) : (
								<>
									<NumberTicker value={stat.value} />
									{stat.suffix && <span>{stat.suffix}</span>}
								</>
							)}
						</div>
						{stat.description && (
							<p className="text-xs opacity-75 mt-1 font-medium">
								{stat.description}
							</p>
						)}
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	if (variant === "solid") {
		return (
			<motion.div
				variants={cardVariants}
				whileHover={{ y: -5, scale: 1.015 }}
				whileTap={{ scale: 0.98 }}
				className="h-full cursor-pointer"
				style={{ willChange: "transform, opacity" }}
			>
				<Card
					className={`bg-linear-to-br ${stat.bgGradient || "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30"} border border-muted/30 shadow-md h-full`}
				>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
							{stat.label}
						</CardTitle>
						<div
							className={`w-10 h-10 rounded-lg bg-linear-to-br ${stat.bgGradient || "from-blue-500 to-blue-600"} flex items-center justify-center`}
						>
							<Icon className="w-5 h-5 text-white" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold font-mono text-gray-900 dark:text-white">
							{isLoading ? (
								<span className="animate-pulse">--</span>
							) : (
								<>
									<NumberTicker value={stat.value} />
									{stat.suffix && <span>{stat.suffix}</span>}
								</>
							)}
						</div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	// Default: outline variant
	return (
		<motion.div
			variants={cardVariants}
			whileHover={{ y: -5, scale: 1.015 }}
			whileTap={{ scale: 0.98 }}
			className="h-full cursor-pointer"
			style={{ willChange: "transform, opacity" }}
		>
			<Card className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-white/20 dark:border-zinc-800/50 shadow-md h-full relative overflow-hidden group">
				<div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-primary/80 to-primary/20" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-6">
					<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
						{stat.label}
					</CardTitle>
					<div
						className={`p-2 rounded-lg transition-colors group-hover:scale-110 duration-300 ${
							stat.bgColor || "bg-blue-50 dark:bg-blue-950/50"
						}`}
					>
						<Icon
							className={`w-4 h-4 ${stat.color || "text-blue-500"}`}
						/>
					</div>
				</CardHeader>
				<CardContent className="pl-6">
					<div className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
						{isLoading ? (
							<span className="animate-pulse">--</span>
						) : (
							<>
								<NumberTicker value={stat.value} />
								{stat.suffix && <span>{stat.suffix}</span>}
							</>
						)}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

interface StatsGridProps {
	stats: StatItem[];
	isLoading?: boolean;
	variant?: "gradient" | "solid" | "outline";
	columns?: 3 | 4 | 5;
}

export function StatsGrid({
	stats,
	isLoading = false,
	variant = "outline",
	columns = 4,
}: StatsGridProps) {
	const gridCols = {
		3: "md:grid-cols-3",
		4: "md:grid-cols-2 lg:grid-cols-4",
		5: "md:grid-cols-2 lg:grid-cols-5",
	};

	return (
		<motion.div 
			initial="hidden"
			animate="visible"
			variants={{
				visible: {
					transition: {
						staggerChildren: 0.08
					}
				}
			}}
			className={`grid gap-4 ${gridCols[columns]}`}
		>
			{stats.map((stat) => (
				<StatsCard
					key={stat.label}
					stat={stat}
					isLoading={isLoading}
					variant={variant}
				/>
			))}
		</motion.div>
	);
}

// Loading skeleton for stats
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{[...Array(count)].map((_, i) => (
				<Card key={i} className="border border-muted/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
						<div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
					</CardHeader>
					<CardContent>
						<div className="h-8 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}
