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

	if (!hasData) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">
							Direct vs Indirect vs Final
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground text-center py-12">
							No attainment data available. Run "Recalculate" to generate data.
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">
							Final vs Target
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground text-center py-12">
							No attainment data available. Run "Recalculate" to generate data.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{/* Grouped Bar: Direct vs Indirect vs Final */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">
						Direct vs Indirect vs Final
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" fontSize={10} interval={0} angle={-30} textAnchor="end" height={60} />
							<YAxis domain={[0, 3]} fontSize={11} />
							<Tooltip />
							<Legend />
							<Bar
								dataKey="Direct"
								fill="#3b82f6"
								radius={[2, 2, 0, 0]}
							/>
							<Bar
								dataKey="Indirect"
								fill="#8b5cf6"
								radius={[2, 2, 0, 0]}
							/>
							<Bar
								dataKey="Final"
								fill="#10b981"
								radius={[2, 2, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Target Comparison Chart */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">
						Final vs Target
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" fontSize={10} interval={0} angle={-30} textAnchor="end" height={60} />
							<YAxis domain={[0, 3]} fontSize={11} />
							<Tooltip />
							<Legend />
							<Bar
								dataKey="Final"
								fill="#10b981"
								radius={[2, 2, 0, 0]}
							/>
							<Bar
								dataKey="Target"
								fill="#f59e0b"
								radius={[2, 2, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	);
}
