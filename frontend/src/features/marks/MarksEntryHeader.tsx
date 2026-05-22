import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Course } from "@/services/api";
import { motion } from "framer-motion";

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
		<motion.div
			className="relative flex items-center justify-center min-h-14 mb-2 px-2"
			initial={{ opacity: 0, y: -12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 300, damping: 26 }}
		>
			{/* Back button */}
			<motion.div className="absolute left-0" whileTap={{ scale: 0.92 }}>
				<Button
					variant="ghost"
					onClick={onBack}
					className="group/back gap-2 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/[0.06] rounded-xl px-3 py-2 transition-all duration-200"
				>
					<motion.span
						className="inline-flex"
						animate={{ x: 0 }}
						whileHover={{ x: -3 }}
						transition={{ type: "spring", stiffness: 400, damping: 24 }}
					>
						<ArrowLeft className="w-4 h-4" />
					</motion.span>
					<span className="font-semibold text-xs uppercase tracking-wider">Back</span>
				</Button>
			</motion.div>

			{/* Title */}
			<div className="text-center">
				<h2 className="text-xl font-bold text-foreground">{title}</h2>
				{course && (
					<motion.p
						className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold uppercase tracking-wider mt-0.5"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.15 }}
					>
						{course.course_code} · {course.course_name}
					</motion.p>
				)}
			</div>
		</motion.div>
	);
}
