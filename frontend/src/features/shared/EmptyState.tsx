import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
	title: string;
	description: string;
	icon?: LucideIcon;
	action?: {
		label: string;
		onClick: () => void;
	};
	variant?: "card" | "inline";
	className?: string;
}

export function EmptyState({
	title,
	description,
	icon: Icon = FileText,
	action,
	variant = "card",
	className = "",
}: EmptyStateProps) {
	const content = (
		<motion.div 
			initial={{ opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, type: "spring", bounce: 0.1 }}
			className="flex flex-col items-center gap-4"
		>
			<motion.div 
				animate={{ y: [0, -6, 0] }}
				transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
				className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-muted-foreground/10 shadow-inner"
			>
				<Icon className="w-8 h-8 text-muted-foreground/60" />
			</motion.div>
			<div className="text-center space-y-1">
				<h3 className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
					{title}
				</h3>
				<p className="text-muted-foreground text-sm max-w-xs leading-relaxed mx-auto">
					{description}
				</p>
			</div>
			{action && (
				<motion.div
					whileHover={{ scale: 1.03 }}
					whileTap={{ scale: 0.97 }}
				>
					<Button onClick={action.onClick} className="mt-2 shadow-sm font-medium cursor-pointer">
						{action.label}
					</Button>
				</motion.div>
			)}
		</motion.div>
	);

	if (variant === "inline") {
		return <div className={`p-12 text-center ${className}`}>{content}</div>;
	}

	return (
		<Card className={`bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border border-white/20 dark:border-zinc-800/40 shadow-md rounded-xl ${className}`}>
			<CardContent className="p-12 text-center">{content}</CardContent>
		</Card>
	);
}

// Specific empty states for common use cases
interface TableEmptyStateProps {
	colSpan: number;
	message?: string;
}

export function TableEmptyState({
	colSpan,
	message = "No data found",
}: TableEmptyStateProps) {
	return (
		<tr>
			<td
				colSpan={colSpan}
				className="text-center py-8 text-muted-foreground"
			>
				{message}
			</td>
		</tr>
	);
}

