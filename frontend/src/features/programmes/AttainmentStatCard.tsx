import { Card } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";

export interface AttainmentStatItem {
	label: string;
	value: number;
	target: number;
	icon: LucideIcon;
	iconColorClass: string;
	iconBgClass: string;
	diffValue: number;
}

interface AttainmentStatCardProps {
	stat: AttainmentStatItem;
	isLoading?: boolean;
}

export function AttainmentStatCard({ stat, isLoading }: AttainmentStatCardProps) {
	const Icon = stat.icon;
	const isPositive = stat.diffValue >= 0;

	return (
		<Card className="p-6 rounded-xl border border-outline-variant shadow-sm relative overflow-hidden">
			<div className={`absolute top-0 right-0 w-24 h-24 opacity-5 rounded-bl-full ${stat.iconColorClass.replace('text-', 'bg-')}`}></div>
			<div className="flex justify-between items-start mb-4">
				<div className={`p-2 rounded-lg ${stat.iconBgClass}`}>
					<Icon className={`w-5 h-5 ${stat.iconColorClass}`} />
				</div>
				<span className={`font-label-sm text-xs px-2 py-1 rounded-full border ${stat.iconColorClass} ${stat.iconColorClass.replace('text-', 'border-')}`}>
					Target: {stat.target.toFixed(2)}
				</span>
			</div>
			<h3 className="text-sm font-medium text-muted-foreground">
				{stat.label}
			</h3>
			<div className="flex items-baseline gap-2 mt-1">
				{isLoading ? (
					<span className="text-3xl font-extrabold animate-pulse">--</span>
				) : (
					<>
						<span className={`text-3xl font-extrabold ${stat.label.includes('Blended') ? 'text-primary' : 'text-foreground'}`}>
							<NumberTicker value={stat.value} />
						</span>
						<span className={`text-xs flex items-center ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
							{isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
							{isPositive ? '+' : ''}{stat.diffValue.toFixed(2)}
						</span>
					</>
				)}
			</div>
		</Card>
	);
}
