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
		const statusColor = hasGaps ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400";
		const statusBg = hasGaps ? "bg-rose-500/10" : "bg-emerald-500/10";
		const statusBorder = hasGaps ? "border-rose-500/20" : "border-emerald-500/20";
		const gradientBorder = hasGaps ? "from-rose-500/80 to-transparent" : "from-emerald-500/80 to-transparent";

		return (
			<Card className="p-6 rounded-xl border border-muted/50 bg-card/75 backdrop-blur-sm shadow-sm relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-primary/20 group">
				<div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${gradientBorder}`}></div>
				<div className={`absolute top-0 right-0 w-24 h-24 opacity-5 rounded-bl-full ${statusBg} transition-all duration-300 group-hover:scale-110`}></div>
				<div className="flex justify-between items-start mb-4">
					<div className={`p-2.5 rounded-xl border ${statusBorder} ${statusBg} shadow-inner`}>
						<StatusIcon className={`w-5 h-5 ${statusColor}`} />
					</div>
					<span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusColor} ${statusBorder} bg-background/50 shadow-sm`}>
						{hasGaps ? `${stat.value} Gaps` : "Target Met"}
					</span>
				</div>
				<div className="flex-1 mt-2">
					<h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
						{stat.label}
					</h3>
					{stat.description && (
						<p className="text-xs text-muted-foreground mt-1 leading-snug">{stat.description}</p>
					)}
				</div>
				<div className="flex items-baseline gap-2 mt-4">
					<span className={`text-4xl font-black tracking-tight ${statusColor}`}>
						<NumberTicker value={stat.value} />
					</span>
				</div>
			</Card>
		);
	}

	const isPositive = (stat.diffValue ?? 0) >= 0;
	
	let topGradient = "from-blue-500/80 to-transparent";
	if (stat.label.includes("Indirect")) {
		topGradient = "from-purple-500/80 to-transparent";
	} else if (stat.label.includes("Blended")) {
		topGradient = "from-primary/80 to-transparent";
	}

	return (
		<Card className="p-6 rounded-xl border border-muted/50 bg-card/75 backdrop-blur-sm shadow-sm relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-primary/20 group">
			<div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${topGradient}`}></div>
			<div className={`absolute top-0 right-0 w-24 h-24 opacity-5 rounded-bl-full ${stat.iconBgClass} transition-all duration-300 group-hover:scale-110`}></div>
			<div className="flex justify-between items-start mb-4">
				<div className={`p-2.5 rounded-xl border ${stat.iconColorClass.replace('text-', 'border-')}/20 ${stat.iconBgClass} shadow-inner`}>
					<Icon className={`w-5 h-5 ${stat.iconColorClass}`} />
				</div>
				{stat.target != null && stat.target > 0 && (
					<span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-primary/20 text-primary bg-background/50 shadow-sm`}>
						Target: {stat.target.toFixed(2)}
					</span>
				)}
			</div>
			<div className="flex-1 mt-2">
				<h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
					{stat.label}
				</h3>
			</div>
			<div className="flex items-baseline gap-2 mt-4">
				{isLoading ? (
					<span className="text-4xl font-black tracking-tight animate-pulse text-muted-foreground/30">--</span>
				) : (
					<>
						<span className={`text-4xl font-black tracking-tight ${stat.label.includes('Blended') ? 'text-primary' : 'text-foreground'}`}>
							<NumberTicker value={stat.value} decimalPlaces={2} />
						</span>
						{stat.diffValue != null && (
							<span className={`text-xs font-bold flex items-center ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
								{isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
								{isPositive ? '+' : ''}{stat.diffValue.toFixed(2)}
							</span>
						)}
					</>
				)}
			</div>
		</Card>
	);
}
