import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Test } from "@/services/api";
import { Info, Award, Calendar, HelpCircle, BookOpen } from "lucide-react";

interface AssessmentInfoCardProps {
	test: Test;
	questionsCount: number;
}

export const AssessmentInfoCard = React.memo(function AssessmentInfoCard({
	test,
	questionsCount,
}: AssessmentInfoCardProps) {
	return (
		<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
			{/* Left gradient accent line */}
			<div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-blue-500 via-violet-500 to-transparent"></div>
			
			<CardHeader className="py-4 border-b bg-muted/[.06] px-6">
				<CardTitle className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
					<Info className="h-4 w-4 text-blue-500 group-hover:rotate-12 transition-transform duration-300" />
					Assessment Information
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6 space-y-3.5">
				<div className="flex justify-between items-center py-2.5 border-b border-muted/30 hover:bg-muted/[0.04] px-2 rounded-lg transition-all duration-200">
					<span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
						<BookOpen className="h-4 w-4 text-muted-foreground/75" />
						Test Name
					</span>
					<span className="font-bold text-foreground text-sm max-w-[180px] truncate">{test.name}</span>
				</div>
				<div className="flex justify-between items-center py-2.5 border-b border-muted/30 hover:bg-muted/[0.04] px-2 rounded-lg transition-all duration-200">
					<span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
						<Award className="h-4 w-4 text-emerald-500/80" />
						Full Marks
					</span>
					<Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 font-bold shadow-xs">
						{test.full_marks}
					</Badge>
				</div>
				<div className="flex justify-between items-center py-2.5 border-b border-muted/30 hover:bg-muted/[0.04] px-2 rounded-lg transition-all duration-200">
					<span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
						<Calendar className="h-4 w-4 text-orange-500/80" />
						Pass Marks
					</span>
					<Badge variant="outline" className="bg-orange-500/5 text-orange-600 dark:text-orange-400 border-orange-500/25 font-bold shadow-xs">
						{test.pass_marks}
					</Badge>
				</div>
				<div className="flex justify-between items-center py-2.5 hover:bg-muted/[0.04] px-2 rounded-lg transition-all duration-200">
					<span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
						<HelpCircle className="h-4 w-4 text-indigo-500/80" />
						Total Questions
					</span>
					<Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 shadow-xs">
						{questionsCount}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
});

