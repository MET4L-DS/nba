import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Course } from "@/services/api";

interface MarksEntryHeaderProps {
	title: string;
	course: Course | null;
	onBack: () => void;
}

export function MarksEntryHeader({
	title,
	course,
	onBack,
}: MarksEntryHeaderProps) {
	return (
		<div className="flex items-center gap-4">
			<Button variant="ghost" onClick={onBack} className="gap-2">
				<ArrowLeft className="w-4 h-4" />
				Back
			</Button>
			<div className="flex-1">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					{title}
				</h2>
				{course && (
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{course.course_code} - {course.course_name}
					</p>
				)}
			</div>
		</div>
	);
}
