import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AttainmentCriteria } from "./types";
import { formatCriteriaRange } from "./utils";
import { BarChart } from "lucide-react";
import { motion } from "framer-motion";

interface AttainmentCriteriaCardProps {
	attainmentCriteria: AttainmentCriteria[];
	getLevelColor: (level: number) => string;
}

const listVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.08 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, scale: 0.88, y: 8 },
	show: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: { type: "spring" as const, stiffness: 340, damping: 24 },
	},
};

export function AttainmentCriteriaCard({
	attainmentCriteria,
	getLevelColor,
}: AttainmentCriteriaCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 280, damping: 26 }}
		>
			<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
				{/* Soft decorative left glow border */}
				<div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-indigo-500 via-primary/50 to-transparent" />

				<CardHeader className="py-4 border-b bg-muted/[.06] px-6">
					<CardTitle className="flex items-center gap-2 text-base font-bold">
						<motion.div
							animate={{ rotate: [0, 8, 0] }}
							transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
						>
							<BarChart className="h-4 w-4 text-indigo-500" />
						</motion.div>
						Attainment Criteria
					</CardTitle>
				</CardHeader>

				<CardContent className="p-6">
					<motion.div
						className="flex gap-3 flex-wrap"
						variants={listVariants}
						initial="hidden"
						animate="show"
					>
						{attainmentCriteria
							.sort((a, b) => b.level - a.level)
							.map((criteria) => (
								<motion.div
									key={criteria.id}
									className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-muted/40 bg-card/45 hover:bg-muted/[.08] hover:border-indigo-500/25 transition-all duration-200 cursor-default"
									variants={itemVariants}
									whileHover={{ scale: 1.05, y: -2 }}
									whileTap={{ scale: 0.96 }}
								>
									<Badge
										className={`${getLevelColor(criteria.level)} rounded-md font-bold px-2.5 py-0.5 shadow-sm`}
									>
										Level {criteria.level}
									</Badge>
									<span className="text-sm font-medium text-muted-foreground">
										{formatCriteriaRange(
											criteria.minPercentage,
											criteria.maxPercentage,
										)}
									</span>
								</motion.div>
							))}
					</motion.div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
