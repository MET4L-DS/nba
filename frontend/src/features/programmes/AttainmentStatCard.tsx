import { Card } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, type LucideIcon } from "lucide-react";

export interface AttainmentStatItem {
	label: string;
	value: number;
	target?: number;
	icon: LucideIcon;
	iconColorClass: string;
	iconBgClass: string;
	diffValue?: number;
	isStatusCard?: boolean;
	description?: string;
}

interface AttainmentStatCardProps {
	stat: AttainmentStatItem;
	isLoading?: boolean;
}

export function AttainmentStatCard({ stat, isLoading }: AttainmentStatCardProps) {
	const Icon = stat.icon;

	if (stat.isStatusCard) {
		const hasGaps = stat.value > 0;
		const StatusIcon = hasGaps ? AlertCircle : CheckCircle2;
		const statusColor = hasGaps ? "text-red-600" : "text-emerald-600";
		const statusBg = hasGaps ? "bg-red-100" : "bg-emerald-100";
		const statusBorder = hasGaps ? "border-red-200" : "border-emerald-200";

		return (
			<Card className="p-6 rounded-xl border border-outline-variant shadow-sm relative overflow-hidden flex flex-col justify-between">
				<div className={`absolute top-0 right-0 w-24 h-24 opacity-5 rounded-bl-full ${statusBg}`}></div>
				<div className="flex justify-between items-start mb-4">
					<div className={`p-2 rounded-lg ${statusBg}`}>
						<StatusIcon className={`w-5 h-5 ${statusColor}`} />
					</div>
					<span className={`text-xs px-2 py-1 rounded-full border ${statusColor} ${statusBorder}`}>
						{hasGaps ? `${stat.value} PO(s)` : "All met"}
					</span>
				</div>
				<div className="flex-1">
					<h3 className="text-sm font-medium text-muted-foreground">
						{stat.label}
					</h3>
					{stat.description && (
						<p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
					)}
				</div>
				<div className="flex items-baseline gap-2">
					<span className={`text-3xl font-extrabold ${statusColor}`}>
						<NumberTicker value={stat.value} />
					</span>
				</div>
			</Card>
		);
	}

	const isPositive = (stat.diffValue ?? 0) >= 0;

	return (
		<Card className="p-6 rounded-xl border border-outline-variant shadow-sm relative overflow-hidden flex flex-col justify-between">
			<div className={`absolute top-0 right-0 w-24 h-24 opacity-5 rounded-bl-full ${stat.iconColorClass.replace('text-', 'bg-')}`}></div>
			<div className="flex justify-between items-start mb-4">
				<div className={`p-2 rounded-lg ${stat.iconBgClass}`}>
					<Icon className={`w-5 h-5 ${stat.iconColorClass}`} />
				</div>
				{stat.target != null && stat.target > 0 && (
					<span className={`text-xs px-2 py-1 rounded-full border ${stat.iconColorClass} ${stat.iconColorClass.replace('text-', 'border-')}`}>
						Target: {stat.target.toFixed(2)}
					</span>
				)}
			</div>
			<div className="flex-1">
				<h3 className="text-sm font-medium text-muted-foreground">
					{stat.label}
				</h3>
			</div>
			<div className="flex items-baseline gap-2">
				{isLoading ? (
					<span className="text-3xl font-extrabold animate-pulse">--</span>
				) : (
					<>
						<span className={`text-3xl font-extrabold ${stat.label.includes('Blended') ? 'text-primary' : 'text-foreground'}`}>
							<NumberTicker value={stat.value} decimalPlaces={2} />
						</span>
						{stat.diffValue != null && (
							<span className={`text-xs flex items-center ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
								{isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
								{isPositive ? '+' : ''}{stat.diffValue.toFixed(2)}
							</span>
						)}
					</>
				)}
			</div>
		</Card>
	);
}
