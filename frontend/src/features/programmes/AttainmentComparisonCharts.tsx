import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts";
import type { CourseLevelProgrammeAttainmentResponse } from "@/services/api";

interface AttainmentComparisonChartsProps {
	data: CourseLevelProgrammeAttainmentResponse;
}

const MotionCard = motion(Card);

export function AttainmentComparisonCharts({
	data,
}: AttainmentComparisonChartsProps) {
	const chartData = data.po_list.map((po) => ({
		name: po,
		Direct: Number(data.averages[po] ?? 0),
		Indirect:
			data.indirect[po] != null ? Number(data.indirect[po]) : null,
		Final: Number(data.finals[po] ?? 0),
		Target:
			data.targets[po] != null ? Number(data.targets[po]) : null,
	}));

	const hasData = chartData.some(
		(d) => d.Direct > 0 || d.Final > 0 || (d.Indirect ?? 0) > 0,
	);

	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const cardVariants = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
	};

	if (!hasData) {
		return (
			<motion.div
				className="grid grid-cols-1 md:grid-cols-2 gap-4"
				variants={containerVariants}
				initial="hidden"
				animate="show"
			>
				<MotionCard variants={cardVariants} className="bg-card/75 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-md">
					<CardHeader className="border-b bg-muted/[0.05]">
						<CardTitle className="text-sm font-semibold flex items-center gap-2">
							<span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
							Direct vs Indirect vs Final
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-6">
						<p className="text-sm text-muted-foreground text-center py-12">
							No attainment data available. Run "Recalculate" to generate data.
						</p>
					</CardContent>
				</MotionCard>
				<MotionCard variants={cardVariants} className="bg-card/75 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-md">
					<CardHeader className="border-b bg-muted/[0.05]">
						<CardTitle className="text-sm font-semibold flex items-center gap-2">
							<span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
							Final vs Target
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-6">
						<p className="text-sm text-muted-foreground text-center py-12">
							No attainment data available. Run "Recalculate" to generate data.
						</p>
					</CardContent>
				</MotionCard>
			</motion.div>
		);
	}

	return (
		<motion.div
			className="grid grid-cols-1 md:grid-cols-2 gap-4"
			variants={containerVariants}
			initial="hidden"
			animate="show"
		>
			{/* Grouped Bar: Direct vs Indirect vs Final */}
			<MotionCard
				variants={cardVariants}
				whileHover={{ y: -2 }}
				className="bg-card/75 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-md hover:border-primary/20 transition-all duration-300 relative"
			>
				<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
				<CardHeader className="pb-3 border-b bg-muted/[0.05] pt-4">
					<CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground/90">
						<span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse" />
						Direct vs Indirect vs Final Attainment
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
							<XAxis dataKey="name" fontSize={10} interval={0} angle={-30} textAnchor="end" height={60} stroke="currentColor" opacity={0.5} />
							<YAxis domain={[0, 3]} fontSize={11} stroke="currentColor" opacity={0.5} />
							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(var(--background), 0.9)",
									borderRadius: "8px",
									borderColor: "rgba(var(--border), 0.5)",
									backdropFilter: "blur(4px)",
								}}
							/>
							<Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
							<Bar
								dataKey="Direct"
								fill="#3b82f6"
								radius={[3, 3, 0, 0]}
								maxBarSize={16}
							/>
							<Bar
								dataKey="Indirect"
								fill="#8b5cf6"
								radius={[3, 3, 0, 0]}
								maxBarSize={16}
							/>
							<Bar
								dataKey="Final"
								fill="#10b981"
								radius={[3, 3, 0, 0]}
								maxBarSize={16}
							/>
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</MotionCard>

			{/* Target Comparison Chart */}
			<MotionCard
				variants={cardVariants}
				whileHover={{ y: -2 }}
				className="bg-card/75 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-md hover:border-primary/20 transition-all duration-300 relative"
			>
				<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />
				<CardHeader className="pb-3 border-b bg-muted/[0.05] pt-4">
					<CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground/90">
						<span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
						Final Attainment vs Target
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
							<XAxis dataKey="name" fontSize={10} interval={0} angle={-30} textAnchor="end" height={60} stroke="currentColor" opacity={0.5} />
							<YAxis domain={[0, 3]} fontSize={11} stroke="currentColor" opacity={0.5} />
							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(var(--background), 0.9)",
									borderRadius: "8px",
									borderColor: "rgba(var(--border), 0.5)",
									backdropFilter: "blur(4px)",
								}}
							/>
							<Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
							<Bar
								dataKey="Final"
								fill="#10b981"
								radius={[3, 3, 0, 0]}
								maxBarSize={20}
							/>
							<Bar
								dataKey="Target"
								fill="#f59e0b"
								radius={[3, 3, 0, 0]}
								maxBarSize={20}
							/>
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</MotionCard>
		</motion.div>
	);
}

