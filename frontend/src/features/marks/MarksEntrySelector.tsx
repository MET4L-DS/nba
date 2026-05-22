import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";
import { apiService } from "@/services/api";
import type { Course, Test } from "@/services/api";
import { formatOrdinal } from "@/lib/utils";
import { EmptyStateCard } from "./EmptyStateCard";
import { TestsListTable } from "./TestsListTable";

interface MarksEntrySelectorProps {
	course: Course | null;
	onTestSelected: (test: Test) => void;
}

export function MarksEntrySelector({
	course,
	onTestSelected,
}: MarksEntrySelectorProps) {
	const [tests, setTests] = useState<Test[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (course) {
			loadTests();
		} else {
			setTests([]);
		}
	}, [course]);

	const loadTests = async () => {
		if (!course) return;

		setLoading(true);
		try {
			const testsData = await apiService.getCourseTests(
				course.offering_id ?? course.course_id,
			);
			setTests(Array.isArray(testsData) ? testsData : []);
		} catch (error) {
			console.error("Failed to load tests:", error);
			setTests([]);
		} finally {
			setLoading(false);
		}
	};

	if (!course) {
		return (
			<EmptyStateCard
				title="No Course Selected"
				description="Select a course from the dropdown above to enter marks"
			/>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
		>
			<Card className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-xl rounded-xl overflow-hidden relative">
				<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-primary to-emerald-500"></div>
				<CardHeader className="py-5 border-b border-muted/20 bg-muted/[0.03]">
					<CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
						Select Assessment for {course.course_code} -{" "}
						{course.course_name}
					</CardTitle>
					<p className="text-xs text-muted-foreground font-medium mt-1">
						{formatOrdinal(course.semester)} Semester, Year{" "}
						{course.year}
					</p>
				</CardHeader>
				<CardContent className="pt-6">
					{loading ? (
						<div className="text-center py-8 text-muted-foreground font-medium animate-pulse">
							Loading assessments...
						</div>
					) : tests.length === 0 ? (
						<div className="text-center py-12 space-y-3">
							<motion.div
								animate={{ y: [0, -6, 0] }}
								transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
							>
								<FileText className="w-12 h-12 mx-auto text-primary/40" />
							</motion.div>
							<div>
								<p className="text-muted-foreground font-semibold text-sm">
									No assessments found for this course
								</p>
								<p className="text-xs text-muted-foreground/60 mt-1">
									Create an assessment first to enter marks
								</p>
							</div>
						</div>
					) : (
						<TestsListTable
							tests={Array.isArray(tests) ? tests : []}
							onTestSelect={onTestSelected}
						/>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
