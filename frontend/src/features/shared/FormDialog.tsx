import type { ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export interface FormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: ReactNode;
	children: ReactNode;
	onSave?: () => void;
	saveLabel?: string;
	cancelLabel?: string;
	isLoading?: boolean;
	className?: string; // e.g. "max-w-2xl max-h-[90vh] overflow-y-auto"
	footer?: ReactNode;
}

export function FormDialog({
	open,
	onOpenChange,
	title,
	description,
	children,
	onSave,
	saveLabel = "Save Changes",
	cancelLabel = "Cancel",
	isLoading = false,
	className = "max-w-2xl",
	footer,
}: FormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={`${className} max-h-[90vh] flex flex-col bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-2xl rounded-xl p-6 overflow-hidden`}>
				<AnimatePresence mode="wait">
					{open && (
						<motion.div
							initial={{ opacity: 0, y: 15, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 15, scale: 0.98 }}
							transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
							className="flex flex-col flex-1 min-h-0 space-y-4 w-full overflow-hidden"
						>
							<DialogHeader className="shrink-0">
								<DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
									{title}
								</DialogTitle>
								{description && (
									<DialogDescription className="text-muted-foreground text-sm mt-1">
										{description}
									</DialogDescription>
								)}
							</DialogHeader>

							<div className="flex-1 overflow-y-auto pr-1 py-2 min-h-0">{children}</div>

							{footer ? (
								<DialogFooter className="shrink-0">{footer}</DialogFooter>
							) : (
								<DialogFooter className="shrink-0 gap-2 sm:gap-0 border-t pt-4 border-muted/30">
									<Button
										variant="outline"
										onClick={() => onOpenChange(false)}
										disabled={isLoading}
										className="active:scale-95 transition-transform duration-100 cursor-pointer"
									>
										{cancelLabel}
									</Button>
									{onSave && (
										<Button 
											onClick={onSave} 
											disabled={isLoading}
											className="bg-primary hover:bg-primary/90 active:scale-95 transition-transform duration-100 relative overflow-hidden group cursor-pointer"
										>
											<span className="relative z-10">
												{isLoading ? "Saving..." : saveLabel}
											</span>
											<span className="absolute inset-0 w-full h-full bg-linear-to-r from-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
										</Button>
									)}
								</DialogFooter>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</DialogContent>
		</Dialog>
	);
}

