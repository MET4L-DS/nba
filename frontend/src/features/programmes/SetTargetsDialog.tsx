import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { actionPlanApi } from "@/services/api/actionPlans";
import { Target } from "lucide-react";

interface SetTargetsDialogProps {
	programmeId: number;
	batchYear: string;
	poList: string[];
	onSaved: () => void;
}

const MotionButton = motion(Button);

export function SetTargetsDialog({
	programmeId,
	batchYear,
	poList,
	onSaved,
}: SetTargetsDialogProps) {
	const [open, setOpen] = useState(false);
	const [targets, setTargets] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open) return;
		const year = parseInt(batchYear, 10);
		if (!year) return;
		actionPlanApi.getTargets(programmeId, year).then((targets) => {
			const mapped: Record<string, string> = {};
			for (const po of poList) {
				mapped[po] = targets[po] != null ? String(targets[po]) : "";
			}
			setTargets(mapped);
		}).catch(() => {
			const mapped: Record<string, string> = {};
			for (const po of poList) mapped[po] = "";
			setTargets(mapped);
		});
	}, [open, programmeId, batchYear, poList]);

	const handleSave = async () => {
		const year = parseInt(batchYear, 10);
		if (!year) {
			toast.error("Invalid batch year");
			return;
		}
		const cleanTargets: Record<string, number> = {};
		for (const [po, val] of Object.entries(targets)) {
			const n = parseFloat(val);
			if (!isNaN(n) && n >= 0) {
				cleanTargets[po] = n;
			} else if (val === "") {
				cleanTargets[po] = 0;
			}
		}
		setLoading(true);
		try {
			await actionPlanApi.setTargets(programmeId, {
				batch_year: year,
				targets: cleanTargets,
			});
			toast.success("Targets saved");
			onSaved();
			setOpen(false);
		} catch {
			toast.error("Failed to save targets");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<MotionButton
					variant="outline"
					size="sm"
					whileHover={{ scale: 1.03 }}
					whileTap={{ scale: 0.97 }}
					transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
				>
					<Target className="w-4 h-4 mr-1.5 text-primary animate-pulse" />
					Set Targets
				</MotionButton>
			</DialogTrigger>
			<DialogContent className="max-w-lg border border-muted/80 bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden p-6">
				<motion.div
					initial={{ opacity: 0, y: 15, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: "spring" as const, stiffness: 280, damping: 22 }}
					className="space-y-4"
				>
					<DialogHeader>
						<DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
							Set PO/PSO Target Levels
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-1">
						<p className="text-sm text-muted-foreground">
							Set the target attainment level (0-3) for each PO/PSO.
						</p>
						<div className="max-h-[50vh] overflow-y-auto pr-2 overflow-x-hidden">
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
								{poList.map((po, index) => (
									<motion.div
										key={po}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											delay: index * 0.03,
											type: "spring" as const,
											stiffness: 260,
											damping: 20,
										}}
										className="space-y-1.5 p-3 rounded-xl bg-muted/20 border border-muted/40 transition-all hover:bg-muted/30 hover:border-primary/20"
									>
										<Label className="font-semibold text-xs text-foreground/85">{po}</Label>
										<Input
											type="number"
											step="0.1"
											min="0"
											max="3"
											placeholder="e.g. 2.5"
											value={targets[po] ?? ""}
											className="focus-visible:ring-indigo-500/30 transition-all font-mono font-bold bg-background/50 h-9"
											onChange={(e) => {
												const raw = e.target.value;
												const clamped = raw.startsWith('-') ? '0' : raw;
												setTargets((prev) => ({
													...prev,
													[po]: clamped,
												}));
											}}
										/>
									</motion.div>
								))}
							</div>
						</div>
						<MotionButton
							onClick={handleSave}
							disabled={loading}
							className="w-full font-semibold shadow-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 border-none h-11"
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
						>
							{loading ? "Saving..." : "Save Targets"}
						</MotionButton>
					</div>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}

