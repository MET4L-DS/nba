import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Course, Test } from "@/services/api";

interface TestHeaderProps {
	test: Test;
	course: Course | null;
	onBack: () => void;
}

export function TestHeader({ test, course, onBack }: TestHeaderProps) {
	return (
		<div className="relative flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-muted/50 bg-card/85 backdrop-blur-md shadow-sm mb-6 overflow-hidden">
			{/* Subtly colored linear border glow at the top */}
			<div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent"></div>

			{/* Left side: Back action button */}
			<div className="w-full md:w-auto flex justify-start">
				<Button
					variant="ghost"
					onClick={onBack}
					className="group/back gap-2 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/[0.05] rounded-xl px-4 py-2 transition-all duration-200 active:scale-95"
				>
					<ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover/back:-translate-x-1" />
					<span className="font-semibold text-xs uppercase tracking-wider">Back</span>
				</Button>
			</div>

			{/* Middle side: Main headers */}
			<div className="text-center md:flex-1">
				<h2 className="text-lg md:text-xl font-black text-foreground tracking-tight">
					{test.name} - Marks Registry
				</h2>
				{course && (
					<p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mt-1 uppercase tracking-widest">
						{course.course_code} • {course.course_name}
					</p>
				)}
			</div>

			{/* Right side: High contrast statistics counters */}
			<div className="w-full md:w-auto flex justify-center md:justify-end items-center gap-3">
				<div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-500/[0.04] dark:bg-blue-500/[0.07] border border-blue-500/15">
					<div className="text-right">
						<span className="block text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
							Full Marks
						</span>
						<span className="text-base font-black text-blue-700 dark:text-blue-300 leading-tight">
							{test.full_marks}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-orange-500/[0.04] dark:bg-orange-500/[0.07] border border-orange-500/15">
					<div className="text-right">
						<span className="block text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
							Pass Marks
						</span>
						<span className="text-base font-black text-orange-700 dark:text-orange-300 leading-tight">
							{test.pass_marks}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
