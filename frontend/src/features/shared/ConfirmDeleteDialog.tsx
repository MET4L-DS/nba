import { Loader2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDeleteDialogProps {
	title?: ReactNode;
	description: ReactNode;
	onConfirm: () => void | Promise<void>;
	isLoading?: boolean;
	trigger?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	confirmText?: string;
}

export function ConfirmDeleteDialog({
	title = "Confirm Deletion",
	description,
	onConfirm,
	isLoading = false,
	trigger,
	open,
	onOpenChange,
	confirmText = "Delete",
}: ConfirmDeleteDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			{trigger && (
				<AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
			)}
			<AlertDialogContent className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-2xl rounded-xl p-6 overflow-hidden">
				<AnimatePresence mode="wait">
					{open !== false && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
							className="space-y-4 w-full"
						>
							<AlertDialogHeader>
								<AlertDialogTitle className="text-xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
									<motion.span
										animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
										transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
									>
										⚠️
									</motion.span>
									{title}
								</AlertDialogTitle>
								<AlertDialogDescription className="text-muted-foreground text-sm mt-1">
									{description}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter className="border-t pt-4 border-muted/30">
								<AlertDialogCancel 
									disabled={isLoading}
									className="active:scale-95 transition-transform duration-100 cursor-pointer"
								>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={(e) => {
										e.preventDefault();
										onConfirm();
									}}
									className="bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 active:scale-95 transition-transform duration-100 cursor-pointer"
									disabled={isLoading}
								>
									{isLoading && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{confirmText}
								</AlertDialogAction>
							</AlertDialogFooter>
						</motion.div>
					)}
				</AnimatePresence>
			</AlertDialogContent>
		</AlertDialog>
	);
}

