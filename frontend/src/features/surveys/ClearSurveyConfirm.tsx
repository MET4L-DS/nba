import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { surveyApi } from "@/services/api/surveys";
import { motion, AnimatePresence } from "framer-motion";

interface ClearSurveyConfirmProps {
	offeringId: number;
	onCleared?: () => void;
}

export function ClearSurveyConfirm({ offeringId, onCleared }: ClearSurveyConfirmProps) {
	const [open, setOpen] = useState(false);
	const [clearing, setClearing] = useState(false);

	const handleClear = async () => {
		setClearing(true);
		try {
			await surveyApi.clearCourseExit(offeringId);
			toast.success("All survey data cleared");
			setOpen(false);
			onCleared?.();
		} catch (err) {
			console.error("ClearSurveyConfirm: Failed to clear survey data", err);
			toast.error("Failed to clear survey data");
		} finally {
			setClearing(false);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button 
					variant="destructive" 
					size="sm"
					className="h-8 font-semibold bg-rose-600 hover:bg-rose-700 text-white hover:shadow-[0_0_15px_rgba(225,29,72,0.3)] active:scale-95 transition-all duration-200 cursor-pointer"
				>
					<Trash2 className="w-3.5 h-3.5 mr-2" /> Clear All Data
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t-4 border-t-rose-500 border-x border-b border-rose-500/10 dark:border-rose-500/20 shadow-[0_20px_50px_-12px_rgba(239,68,68,0.18)] rounded-2xl p-6 overflow-hidden max-w-md">
				<AnimatePresence mode="wait">
					{open && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 15 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 15 }}
							transition={{ type: "spring", duration: 0.45, bounce: 0.18 }}
							className="space-y-4 w-full"
						>
							<AlertDialogHeader className="space-y-3">
								<AlertDialogTitle className="text-xl font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-3">
									<motion.div
										animate={{ 
											scale: [1, 1.08, 1, 1.08, 1],
											rotate: [0, -5, 5, -5, 0] 
										}}
										transition={{ 
											repeat: Infinity, 
											repeatDelay: 3, 
											duration: 0.6,
											ease: "easeInOut" 
										}}
										className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-inner"
									>
										<AlertTriangle className="w-5 h-5" />
									</motion.div>
									Clear all survey data?
								</AlertDialogTitle>
								<AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed pt-1">
									This will permanently delete all responses <strong className="text-foreground font-semibold">and</strong> the question
									configuration for this course. You will need to reconfigure the questions
									before importing or entering data again. This action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter className="border-t pt-4 border-rose-500/10 gap-2">
								<AlertDialogCancel 
									disabled={clearing}
									className="rounded-xl active:scale-95 transition-transform duration-100 cursor-pointer"
								>
									Cancel
								</AlertDialogCancel>
								<Button 
									variant="destructive"
									disabled={clearing}
									onClick={(e) => {
										e.preventDefault();
										handleClear();
									}}
									className="bg-rose-600 hover:bg-rose-700 font-semibold rounded-xl active:scale-95 transition-transform duration-100 cursor-pointer hover:shadow-[0_0_15px_rgba(225,29,72,0.25)]"
								>
									{clearing ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Clearing...
										</>
									) : (
										"Yes, clear everything"
									)}
								</Button>
							</AlertDialogFooter>
						</motion.div>
					)}
				</AnimatePresence>
			</AlertDialogContent>
		</AlertDialog>
	);
}
