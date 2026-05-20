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
import type { OfferingAttainmentCO } from "@/services/api/types";

interface AttainmentBarChartProps {
	attainmentCoData: OfferingAttainmentCO[];
}

export function AttainmentBarChart({
	attainmentCoData,
}: AttainmentBarChartProps) {
	if (!attainmentCoData.length) {
		return (
			<div>
				<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
					Direct vs Indirect Variance
				</h4>
				<div className="border rounded-lg bg-muted/20 flex items-center justify-center h-[180px] text-muted-foreground text-xs">
					No attainment data to display
				</div>
			</div>
		);
	}

	const chartData = attainmentCoData.map((c) => ({
		name: c.co_name,
		Direct: Math.min(c.attainment_percentage ?? 0, 100),
		Indirect: Math.min(c.indirect_attainment_percentage ?? 0, 100),
	}));

	return (
		<div>
			<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
				Direct vs Indirect Variance
			</h4>
			<div className="border rounded-lg bg-muted/20 p-3 h-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={chartData}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--border)"
						/>
						<XAxis
							dataKey="name"
							tick={{
								fontSize: 11,
								fill: "var(--muted-foreground)",
							}}
							stroke="var(--border)"
						/>
						<YAxis
							domain={[0, 100]}
							tick={{
								fontSize: 11,
								fill: "var(--muted-foreground)",
							}}
							stroke="var(--border)"
							tickFormatter={(v: number) => `${v}%`}
						/>
						<Tooltip
							contentStyle={{
								background: "var(--popover)",
								border: "1px solid var(--border)",
								borderRadius: "var(--radius)",
								fontSize: 12,
								color: "var(--popover-foreground)",
							}}
							formatter={(value) => {
								const v = Number(value);
								return Number.isFinite(v)
									? `${v.toFixed(1)}%`
									: "-";
							}}
						/>
						<Legend
							wrapperStyle={{
								fontSize: 11,
								paddingTop: 4,
								color: "var(--muted-foreground)",
							}}
						/>
						<Bar
							dataKey="Direct"
							fill="var(--chart-1)"
							radius={[3, 3, 0, 0]}
							maxBarSize={16}
						/>
						<Bar
							dataKey="Indirect"
							fill="var(--chart-2)"
							radius={[3, 3, 0, 0]}
							maxBarSize={16}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
