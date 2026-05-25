import { useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { attainmentApi } from "@/services/api/attainment";
import type { Course, User } from "@/services/api";
import { FacultyCOPO as COPOComponent } from "@/components/faculty";
import { debugLogger } from "@/lib/debugLogger";
import { motion } from "framer-motion";

export function FacultyCOPO() {
	const {
		selectedCourse,
		setSelectedCourse,
		courses,
		user,
	} = useOutletContext<{
		selectedCourse: Course | null;
		setSelectedCourse: (course: Course | null) => void;
		courses: Course[];
		user: User;
	}>();

	debugLogger.info("FacultyCOPO", "Component mounted");

	const [searchParams] = useSearchParams();
	const urlOfferingId = searchParams.get("offering_id");

	debugLogger.debug("FacultyCOPO", "URL parameter", { urlOfferingId });

	useEffect(() => {
		if (urlOfferingId && courses.length > 0) {
			const foundCourse = courses.find(
				c => String(c.offering_id || c.course_id) === urlOfferingId
			);
			if (foundCourse && (!selectedCourse || String(selectedCourse.offering_id || selectedCourse.course_id) !== urlOfferingId)) {
				debugLogger.info("FacultyCOPO", "Selecting course from URL parameter", {
					courseId: foundCourse.offering_id,
					courseCode: foundCourse.course_code
				});
				setSelectedCourse(foundCourse);
			}
		}
	}, [urlOfferingId, courses, selectedCourse, setSelectedCourse]);

	const selectedCourseId = selectedCourse?.offering_id ?? selectedCourse?.course_id;
	const selectedCourseCode = selectedCourse?.course_code;
	const isSelectedCourseLocked = selectedCourse?.is_active === 0;

	// Snapshot debug: auto-fetch when a locked course is selected
	useEffect(() => {
		if (selectedCourseId && isSelectedCourseLocked) {
			debugLogger.info("FacultyCOPO", "Locked course selected, fetching snapshot", {
				courseCode: selectedCourseCode,
				offeringId: selectedCourseId,
			});
			attainmentApi.getOfferingAttainment(selectedCourseId).then((snap) => {
				debugLogger.info("FacultyCOPO", "Snapshot data for locked course", {
					courseCode: selectedCourseCode,
					offeringId: selectedCourseId,
					co_count: snap.co_attainment?.length ?? 0,
					po_count: snap.po_attainment?.length ?? 0,
					co_attainment: snap.co_attainment?.map((c) => ({
						co: c.co_name,
						pct: c.attainment_percentage,
						level: c.attainment_level,
					})),
					po_attainment: snap.po_attainment?.map((p) => ({
						po: p.po_name,
						value: p.attainment_value,
					})),
				});
			})
			.catch((err) => {
				debugLogger.warn("FacultyCOPO", "Snapshot fetch failed for locked course", {
					courseCode: selectedCourseCode,
					error: err instanceof Error ? err.message : String(err),
				});
			});
		}
	}, [selectedCourseId, isSelectedCourseLocked, selectedCourseCode]);

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
			{selectedCourse && user ? (
				<COPOComponent
					selectedCourse={selectedCourse}
					user={user}
				/>
			) : (
				<div className="flex items-center justify-center h-full text-muted-foreground">
					{!user
						? "Loading user profile..."
						: "Please select a course to configure mappings."}
				</div>
			)}
		</motion.div>
	);
}
