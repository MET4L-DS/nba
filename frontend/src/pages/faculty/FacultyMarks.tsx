import { useOutletContext } from "react-router-dom";
import type { Course } from "@/services/api";
import { FacultyMarks as MarksComponent } from "@/components/faculty";
import { debugLogger } from "@/lib/debugLogger";
import { motion } from "framer-motion";

export function FacultyMarks() {
	const { selectedCourse } = useOutletContext<{
		selectedCourse: Course | null;
	}>();

	debugLogger.info("FacultyMarks", "Component mounted", {
		selectedCourseId: selectedCourse?.offering_id,
	});

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
				<MarksComponent
					selectedCourse={selectedCourse}
					readOnly={selectedCourse.is_active === 0}
				/>
			) : (
				<div className="flex items-center justify-center h-full text-muted-foreground">
					Please select a course to enter marks.
				</div>
			)}
		</motion.div>
	);
}
