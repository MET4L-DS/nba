import { useOutletContext } from "react-router-dom";
import type { Course } from "@/services/api";
import { FacultyCourseSurvey } from "@/components/faculty";
import { motion } from "framer-motion";

export function FacultySurvey() {
	const { selectedCourse } = useOutletContext<{
		selectedCourse: Course | null;
	}>();

	const pageVariants = {
		initial: { opacity: 0, y: 15 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -15 },
	};

	const pageTransition = {
		duration: 0.45,
		ease: [0.16, 1, 0.3, 1] as const,
	};

	return (
		<motion.div
			initial="initial"
			animate="animate"
			exit="exit"
			variants={pageVariants}
			transition={pageTransition}
			className="flex-1 overflow-y-auto p-4 md:p-6"
		>
			{selectedCourse ? (
				<FacultyCourseSurvey selectedCourse={selectedCourse} />
			) : (
				<div className="flex items-center justify-center h-full text-muted-foreground">
					Please select a course to view the course exit survey.
				</div>
			)}
		</motion.div>
	);
}

