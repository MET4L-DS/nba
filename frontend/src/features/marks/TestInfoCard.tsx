import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, ClipboardList, Search } from "lucide-react";
import type { Test } from "@/services/api";
import type { ReactNode } from "react";

interface TestInfoCardProps {
	test: Test;
	onSave: () => void;
	isSaving: boolean;
	isDisabled: boolean;
	extraActions?: ReactNode;
	children: ReactNode;
	searchTerm?: string;
	onSearch?: (value: string) => void;
	searchPlaceholder?: string;
}

export function TestInfoCard({
	test,
	onSave,
	isSaving,
	isDisabled,
	extraActions,
	children,
	searchTerm,
	onSearch,
	searchPlaceholder,
}: TestInfoCardProps) {
	return (
		<Card className="w-full overflow-hidden bg-card/85 backdrop-blur-md border border-muted/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group">
			{/* Subtly colored linear border glow at the top */}
			<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-transparent"></div>

			<CardHeader className="p-6 border-b bg-muted/[0.03]">
				<div className="flex flex-row items-center justify-between gap-4 flex-wrap">
					{/* Left: premium gradient icon + title details */}
					<div className="flex items-center gap-3.5">
						<div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300 relative">
							<ClipboardList className="w-5 h-5 text-white" />
							{/* Subtle live indicator pulse */}
							{!isDisabled && (
								<span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
								</span>
							)}
						</div>
						<div>
							<CardTitle className="text-base font-extrabold text-foreground tracking-tight leading-tight">
								{test.name}
							</CardTitle>
							<p className="text-xs text-muted-foreground mt-1 font-semibold flex items-center gap-2">
								<span>Full Marks: <strong className="text-foreground">{test.full_marks}</strong></span>
								<span className="text-muted-foreground/30">•</span>
								<span>Pass Marks: <strong className="text-foreground">{test.pass_marks}</strong></span>
							</p>
						</div>
					</div>

					{/* Right: search + custom extra actions + save triggers */}
					<div className="flex items-center gap-2.5 shrink-0 flex-wrap">
						{onSearch && (
							<div className="relative">
								<Search className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground/75 pointer-events-none" />
								<Input
									placeholder={
										searchPlaceholder ??
										"Search students..."
									}
									value={searchTerm ?? ""}
									onChange={(e) => onSearch(e.target.value)}
									className="pl-9.5 w-56 bg-card/45 border-muted/70 hover:border-indigo-500/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 rounded-xl text-xs h-9"
								/>
							</div>
						)}
						{extraActions}
						<Button
							onClick={onSave}
							disabled={isSaving || isDisabled}
							className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-9 px-4 rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none"
						>
							<Save className="w-4 h-4" />
							<span>{isSaving ? "Saving..." : "Save All Marks"}</span>
						</Button>
					</div>
				</div>
			</CardHeader>
			<div className="p-1">{children}</div>
		</Card>
	);
}
