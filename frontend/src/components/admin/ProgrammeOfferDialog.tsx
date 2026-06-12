import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export interface ProgrammeOfferDialogProps {
	mode: "create" | "edit";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: { batch_year: number; status: "upcoming" | "active" | "completed" }) => Promise<void>;
	isLoading?: boolean;
	initialData?: any;
}

export function ProgrammeOfferDialog({
	mode,
	open,
	onOpenChange,
	onSave,
	isLoading = false,
	initialData,
}: ProgrammeOfferDialogProps) {
	const currentYear = new Date().getFullYear();
	const [batchYear, setBatchYear] = useState<string>(currentYear.toString());
	const [status, setStatus] = useState<"upcoming" | "active" | "completed">("upcoming");

	useEffect(() => {
		if (open) {
			if (initialData && mode === "edit") {
				setBatchYear((initialData.specific_batch_year || initialData.batch_year || currentYear).toString());
				setStatus(initialData.batch_status || initialData.status || "upcoming");
			} else if (initialData && mode === "create") {
				setBatchYear(currentYear.toString());
				setStatus("upcoming");
			} else {
				setBatchYear(currentYear.toString());
				setStatus("upcoming");
			}
		}
	}, [open, initialData, mode, currentYear]);

	const handleSave = async () => {
		const yearNum = parseInt(batchYear, 10);
		if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) return;
		await onSave({
			batch_year: yearNum,
			status,
		});
	};

	const title =
		mode === "create"
			? `Offer Programme to Batch — ${initialData?.programme_code || ""}`
			: `Edit Batch Status — ${initialData?.programme_code || ""} (${initialData?.specific_batch_year || initialData?.batch_year || ""})`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[450px] bg-card/95 backdrop-blur-md border border-muted/50 rounded-2xl shadow-xl p-6">
				<AnimatePresence mode="wait">
					{open && (
						<motion.div
							initial={{ opacity: 0, y: 15, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 15, scale: 0.98 }}
							transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
							className="space-y-4 w-full"
						>
							<DialogHeader>
								<DialogTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
									{title}
								</DialogTitle>
								<DialogDescription className="text-muted-foreground text-xs">
									{mode === "create"
										? "Offer this academic programme to a new batch year."
										: "Update the status and tracking details for this offered batch."}
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4 py-2">
								<div className="space-y-2">
									<Label htmlFor="batch_year" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Batch Year *
									</Label>
									<Input
										id="batch_year"
										type="number"
										min={2000}
										max={2100}
										value={batchYear}
										onChange={(e) => setBatchYear(e.target.value)}
										disabled={isLoading || mode === "edit"} // Don't let users change the batch year if editing, or let them? It's cleaner to freeze it if it has students/mappings, but allow if desired. Let's make it disabled in edit for safety.
										className="bg-background/60 shadow-inner focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all duration-200"
										placeholder="e.g. 2026"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="status" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
										Status
									</Label>
									<Select
										value={status}
										onValueChange={(val: any) => setStatus(val)}
										disabled={isLoading}
									>
										<SelectTrigger className="bg-background/60 shadow-inner focus:ring-2 focus:ring-indigo-500/20 hover:border-indigo-500/50 transition-all duration-200">
											<SelectValue placeholder="Select Status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="upcoming">Upcoming</SelectItem>
											<SelectItem value="active">Active (Ongoing)</SelectItem>
											<SelectItem value="completed">Completed</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-muted/20">
								<Button
									variant="outline"
									onClick={() => onOpenChange(false)}
									disabled={isLoading}
									className="active:scale-95 duration-200 transition-all"
								>
									Cancel
								</Button>
								<Button
									onClick={handleSave}
									disabled={isLoading || !batchYear}
									className="active:scale-95 duration-200 transition-all bg-indigo-600 hover:bg-indigo-700 text-white"
								>
									{isLoading ? "Saving..." : "Save Changes"}
								</Button>
							</DialogFooter>
						</motion.div>
					)}
				</AnimatePresence>
			</DialogContent>
		</Dialog>
	);
}
