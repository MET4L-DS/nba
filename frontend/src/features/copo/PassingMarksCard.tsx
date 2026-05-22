import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Percent, ShieldCheck, UserCheck } from "lucide-react";

interface PassingMarksCardProps {
	coThreshold: number;
	passingThreshold: number;
}

export function PassingMarksCard({
	coThreshold,
	passingThreshold,
}: PassingMarksCardProps) {
	return (
		<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
			{/* Top glow accent border */}
			<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent"></div>
			
			<CardHeader className="py-4 border-b bg-orange-500/[0.03] px-6">
				<CardTitle className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300 bg-clip-text text-transparent">
					<Percent className="h-4 w-4 text-orange-500 group-hover:rotate-12 transition-transform duration-300" />
					Passing Marks Thresholds
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex items-center justify-between px-5 py-4 rounded-xl bg-card/45 border border-emerald-500/15 hover:border-emerald-500/35 hover:bg-emerald-500/[0.02] shadow-xs hover:shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
								<ShieldCheck className="h-5 w-5" />
							</div>
							<span className="text-sm font-semibold text-muted-foreground">
								For CO Attainment
							</span>
						</div>
						<span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
							{coThreshold}%
						</span>
					</div>
					<div className="flex items-center justify-between px-5 py-4 rounded-xl bg-card/45 border border-blue-500/15 hover:border-blue-500/35 hover:bg-blue-500/[0.02] shadow-xs hover:shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
								<UserCheck className="h-5 w-5" />
							</div>
							<span className="text-sm font-semibold text-muted-foreground">
								For Student Pass
							</span>
						</div>
						<span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
							{passingThreshold}%
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
