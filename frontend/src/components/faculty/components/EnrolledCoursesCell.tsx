import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EnrolledCoursesCellProps {
	enrolledCourses: string | null | undefined;
	isExpanded: boolean;
	onToggleExpand: () => void;
}

export const EnrolledCoursesCell = memo(function EnrolledCoursesCell({
	enrolledCourses,
	isExpanded,
	onToggleExpand,
}: EnrolledCoursesCellProps) {
	const courses = enrolledCourses ? enrolledCourses.split(", ") : [];
	const visibleCourses = isExpanded ? courses : courses.slice(0, 2);
	const hasMore = courses.length > 2;

	return (
		<div className="flex items-start gap-2 py-1">
			<div className="flex flex-col items-start">
				<AnimatePresence initial={false}>
					{visibleCourses.length > 0 ? (
						visibleCourses.map((course, idx) => {
							const isRepeater = course.endsWith(" [Repeater]");
							const cleanCourse = isRepeater ? course.slice(0, -11) : course;
							return (
								<motion.div
									key={`${course}-${idx}`}
									initial={{
										opacity: 0,
										height: 0,
										overflow: "hidden",
									}}
									animate={{
										opacity: 1,
										height: "auto",
									}}
									exit={{ opacity: 0, height: 0 }}
									transition={{
										duration: 0.2,
										ease: "easeInOut",
									}}
								>
									<div className="pb-1 flex items-center gap-1.5 flex-wrap">
										<Badge
											variant="outline"
											className="px-1.5 py-0 font-normal rounded-lg border-muted/50 bg-background/50"
										>
											{cleanCourse}
										</Badge>
										{isRepeater && (
											<Badge variant="secondary" className="text-[9px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-900 py-0 px-1 font-semibold uppercase tracking-wider">
												Repeater
											</Badge>
										)}
									</div>
								</motion.div>
							);
						})
					) : (
						<span className="text-xs text-muted-foreground pb-1">
							—
						</span>
					)}
				</AnimatePresence>
			</div>
			{hasMore && (
				<Button
					variant="ghost"
					size="sm"
					className="h-5 w-5 p-0 mt-0.5 group hover:bg-violet-500/10 hover:text-violet-600 transition-colors shrink-0 rounded-lg active:scale-95"
					onClick={onToggleExpand}
					title={
						isExpanded
							? "Show less"
							: `Show ${courses.length - 2} more`
					}
				>
					<ChevronDown
						className={`h-4 w-4 text-muted-foreground group-hover:text-violet-600 transition-transform duration-200 ${
							isExpanded ? "rotate-180" : ""
						}`}
					/>
				</Button>
			)}
		</div>
	);
});
