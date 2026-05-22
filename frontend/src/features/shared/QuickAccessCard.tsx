import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export interface QuickAccessItem {
	id: string;
	title: string;
	description: string;
	icon: LucideIcon;
	gradient?: string;
	value?: string | number;
}

interface QuickAccessCardProps {
	item: QuickAccessItem;
	onClick: (id: string) => void;
	variant?: "default" | "elevated" | "compact";
	accentColor?: string;
}

const cardVariants = {
	hidden: { opacity: 0, y: 12 },
	visible: { 
		opacity: 1, 
		y: 0,
		transition: { ease: [0.16, 1, 0.3, 1] as const, duration: 0.45 } 
	}
};

export const QuickAccessCard = memo(function QuickAccessCard({
	item,
	onClick,
	variant = "default",
	accentColor = "purple",
}: QuickAccessCardProps) {
	const Icon = item.icon;

	if (variant === "elevated") {
		return (
			<motion.div
				variants={cardVariants}
				whileHover={{ y: -6, scale: 1.015 }}
				whileTap={{ scale: 0.98 }}
				className="h-full cursor-pointer"
				onClick={() => onClick(item.id)}
				style={{ willChange: "transform, opacity" }}
			>
				<Card
					className="h-full hover:shadow-xl border border-muted/20 relative overflow-hidden bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-xl"
				>
					<div className={`absolute bottom-0 left-0 w-full h-[4px] bg-gradient-to-r ${item.gradient || "from-blue-500 to-indigo-600"}`} />
					<CardHeader className="pb-2">
						<div
							className={`w-12 h-12 rounded-lg bg-linear-to-br ${
								item.gradient || "from-blue-500 to-indigo-600"
							} flex items-center justify-center mb-3 shadow-md`}
						>
							<Icon className="w-6 h-6 text-white" />
						</div>
						<CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
							{item.title}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{item.description}
						</p>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	if (variant === "compact") {
		return (
			<motion.div
				variants={cardVariants}
				whileHover={{ y: -4, scale: 1.015 }}
				whileTap={{ scale: 0.98 }}
				className="h-full cursor-pointer"
				onClick={() => onClick(item.id)}
				style={{ willChange: "transform, opacity" }}
			>
				<Card
					className={`h-full border border-muted/20 hover:border-${accentColor}-300 dark:hover:border-${accentColor}-700 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-xl relative overflow-hidden group`}
				>
					<div className={`absolute bottom-0 left-0 w-full h-[3px] bg-${accentColor}-500/20 group-hover:bg-${accentColor}-500 transition-colors duration-300`} />
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<div
								className={`p-2 bg-${accentColor}-50 dark:bg-${accentColor}-950/30 rounded-lg group-hover:scale-110 transition-transform duration-300`}
							>
								<Icon
									className={`w-5 h-5 text-${accentColor}-600 dark:text-${accentColor}-400`}
								/>
							</div>
							<Eye
								className={`w-4 h-4 text-gray-400 group-hover:text-${accentColor}-500 transition-colors`}
							/>
						</div>
					</CardHeader>
					<CardContent>
						<CardTitle
							className={`text-base mb-1 group-hover:text-${accentColor}-600 dark:group-hover:text-${accentColor}-400 transition-colors font-bold`}
						>
							{item.title}
						</CardTitle>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{item.description}
						</p>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	// Default variant
	return (
		<motion.div
			variants={cardVariants}
			whileHover={{ y: -4, scale: 1.015 }}
			whileTap={{ scale: 0.98 }}
			className="h-full cursor-pointer"
			onClick={() => onClick(item.id)}
			style={{ willChange: "transform, opacity" }}
		>
			<Card className="h-full border border-muted/20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-xl relative overflow-hidden pl-1">
				<div className={`absolute left-0 top-0 h-full w-[4px] bg-${accentColor}-500`} style={{ backgroundColor: `var(--${accentColor}-500, currentColor)` }} />
				<CardHeader>
					<CardTitle className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
						<Icon
							className={`h-5 w-5 text-${accentColor}-500`}
							style={{
								color: `var(--${accentColor}-500, currentColor)`,
							}}
						/>
						{item.title}
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						{item.description}
					</p>
				</CardHeader>
				{item.value && (
					<CardContent>
						<p className="text-2xl font-bold font-mono">{item.value}</p>
					</CardContent>
				)}
			</Card>
		</motion.div>
	);
});

interface QuickAccessGridProps {
	items: QuickAccessItem[];
	onItemClick: (id: string) => void;
	variant?: "default" | "elevated" | "compact";
	columns?: 2 | 3 | 4 | 5 | 6;
	accentColor?: string;
}

export const QuickAccessGrid = memo(function QuickAccessGrid({
	items,
	onItemClick,
	variant = "default",
	columns = 3,
	accentColor = "purple",
}: QuickAccessGridProps) {
	const gridCols = {
		2: "md:grid-cols-2",
		3: "md:grid-cols-2 lg:grid-cols-3",
		4: "md:grid-cols-2 lg:grid-cols-4",
		5: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
		6: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
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
			{items.map((item) => (
				<QuickAccessCard
					key={item.id}
					item={item}
					onClick={onItemClick}
					variant={variant}
					accentColor={accentColor}
				/>
			))}
		</motion.div>
	);
});

