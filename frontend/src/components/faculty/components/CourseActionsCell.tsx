import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Archive, Eye } from "lucide-react";
import type { Course } from "@/services/api";

interface CourseActionsCellProps {
	course: Course;
	onConclude: (course: Course) => void;
	onNavigate: (path: string) => void;
}

export const CourseActionsCell = memo(function CourseActionsCell({
	course,
	onConclude,
	onNavigate,
}: CourseActionsCellProps) {
	const offeringId = course.offering_id || course.course_id;

	if (course.is_active === 0 || course.cfa_is_active === 0) {
		return (
			<div className="flex justify-start gap-2">
				<Button
					variant="ghost"
					size="sm"
					title="View CO-PO Mapping"
					onClick={() => onNavigate(`/faculty/copo?offering_id=${offeringId}`)}
					className="h-8 gap-2 text-primary hover:bg-primary/[0.06] hover:text-primary font-semibold active:scale-95 duration-200 transition-all border border-muted/50 hover:border-primary/20"
				>
					<Eye className="h-4 w-4 text-primary" />
					CO-PO
				</Button>
			</div>
		);
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => onConclude(course)}
			className="h-8 gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 active:scale-95 duration-200 transition-all font-semibold border border-rose-500/20"
		>
			<Archive className="h-4 w-4 text-rose-500" />
			Conclude
		</Button>
	);
});
