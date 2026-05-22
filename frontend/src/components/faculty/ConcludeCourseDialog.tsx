import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Course } from "@/services/api";
import { AlertCircle, Ban, HelpCircle, Loader2 } from "lucide-react";

interface ConcludeCourseDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	canConclude: boolean;
	isConcluding: boolean;
	course?: Course | null;
	incompleteTests: string[];
	onConclude: () => void;
}

export function ConcludeCourseDialog({
	open,
	onOpenChange,
	canConclude,
	isConcluding,
	course,
	incompleteTests,
	onConclude,
}: ConcludeCourseDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="bg-background/95 backdrop-blur-md border border-muted/50 shadow-2xl rounded-2xl p-6 max-w-lg transition-all duration-300">
				<AlertDialogHeader className="space-y-4">
					<div className="flex items-center gap-3">
						{canConclude ? (
							<div className="p-3 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
								<HelpCircle className="h-6 w-6 animate-pulse" />
							</div>
						) : (
							<div className="p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
								<Ban className="h-6 w-6" />
							</div>
						)}
						<AlertDialogTitle className="text-xl font-bold tracking-tight">
							{canConclude
								? "Are you absolutely sure?"
								: "Action Not Allowed"}
						</AlertDialogTitle>
					</div>
					
					<AlertDialogDescription asChild>
						<div className="text-sm leading-relaxed text-muted-foreground mt-2">
							{!canConclude ? (
								<div className="space-y-3">
									<div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">
										Cannot conclude the session for{" "}
										<span className="font-semibold underline decoration-amber-500/30">
											{course?.course_name}
										</span>
										.
									</div>
									<div className="text-foreground font-semibold mt-4 flex items-center gap-2">
										<AlertCircle className="h-4 w-4 text-amber-500" />
										The following assessments have incomplete marks entries:
									</div>
									<ul className="list-none space-y-1.5 mt-2 pl-2">
										{incompleteTests.map((testName, i) => (
											<li
												key={i}
												className="flex items-center gap-2 text-foreground font-medium bg-secondary/50 p-2 rounded-lg border border-muted/40"
											>
												<span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
												{testName}
											</li>
										))}
									</ul>
									<p className="mt-4 text-xs text-muted-foreground">
										Please ensure that ALL enrolled students have been graded for these assessments or the assessments have appropriate max marks set up.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									<p>
										This will conclude the current session for{" "}
										<strong className="text-foreground">{course?.course_name}</strong>. All
										internal marks will be locked, and attainments will be calculated.
									</p>
									<div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs space-y-1">
										<strong className="font-semibold flex items-center gap-1.5 text-rose-800 dark:text-rose-300">
											<AlertCircle className="h-3.5 w-3.5" />
											Critical Warning:
										</strong>
										<p>You will no longer be able to modify marks for the current assessments once concluded. This action is irreversible.</p>
									</div>
								</div>
							)}
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				
				<AlertDialogFooter className="mt-6 gap-2">
					<AlertDialogCancel 
						disabled={isConcluding}
						className="rounded-xl border border-muted/60 bg-secondary/40 hover:bg-secondary/80 active:scale-95 duration-200 transition-all text-foreground"
					>
						{canConclude ? "Cancel" : "Close"}
					</AlertDialogCancel>
					{canConclude && (
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								onConclude();
							}}
							disabled={isConcluding}
							className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium active:scale-95 duration-200 transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20"
						>
							{isConcluding ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Concluding Session...
								</>
							) : (
								"Yes, Conclude Session"
							)}
						</AlertDialogAction>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
