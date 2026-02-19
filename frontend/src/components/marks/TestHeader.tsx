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
		<div className="flex items-center gap-4">
			<Button variant="ghost" onClick={onBack} className="gap-2">
				<ArrowLeft className="w-4 h-4" />
				Back
			</Button>
			<div className="flex-1">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					{test.name} - All Marks
				</h2>
				{course && (
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{course.course_code} - {course.course_name}
					</p>
				)}
			</div>
			<div className="flex items-center gap-4">
				<div className="text-right">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Full Marks
					</p>
					<p className="text-lg font-semibold text-gray-900 dark:text-white">
						{test.full_marks}
					</p>
				</div>
				<div className="text-right">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Pass Marks
					</p>
					<p className="text-lg font-semibold text-gray-900 dark:text-white">
						{test.pass_marks}
					</p>
				</div>
			</div>
		</div>
	);
}
