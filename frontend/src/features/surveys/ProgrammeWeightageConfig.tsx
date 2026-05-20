import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SlidersHorizontal, RefreshCw } from "lucide-react";
import { hodApi } from "@/services/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProgrammeWeightageConfigProps {
	programmeId: number;
	onSaved?: () => void;
}

export function ProgrammeWeightageConfig({
	programmeId,
	onSaved,
}: ProgrammeWeightageConfigProps) {
	const [directWeight, setDirectWeight] = useState(80);
	const [indirectWeight, setIndirectWeight] = useState(20);
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (programmeId) {
			setLoading(true);
			hodApi.getDepartmentProgrammes({ limit: 100 }).then((response) => {
				const progs = response.data ?? [];
				const prog = progs.find((p) => p.programme_id === programmeId);
				if (prog) {
					setDirectWeight(prog.direct_weightage ?? 80);
					setIndirectWeight(prog.indirect_weightage ?? 20);
				}
			}).finally(() => setLoading(false));
		}
	}, [programmeId]);

	const saveWeightage = async () => {
		setSaving(true);
		try {
			await hodApi.updateProgrammeWeightage(programmeId, directWeight, indirectWeight);
			toast.success("Programme weightage updated");
			onSaved?.();
		} catch (e: any) {
			toast.error(e.message || "Failed to save weightage");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className="gap-2" disabled={loading}>
					<SlidersHorizontal className="w-4 h-4" />
					<span>Weightage: {directWeight}/{indirectWeight}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80" align="end">
				<div className="space-y-4">
					<div className="flex items-center gap-2 mb-2 border-b pb-2">
						<SlidersHorizontal className="w-4 h-4 text-primary" />
						<h4 className="font-semibold text-sm">
							Programme PO Attainment Weightage
						</h4>
					</div>
					
					<div className="text-xs text-muted-foreground mb-4">
						This split determines how direct (course-level) and indirect (stakeholder surveys) attainment are combined.
					</div>

					<div className="flex flex-col gap-1.5">
						<div className="flex justify-between items-center">
							<label className="text-sm font-medium">
								Direct (Course) Attainment
							</label>
							<span className="text-sm font-bold text-primary">
								{directWeight}%
							</span>
						</div>
						<input
							type="range"
							min="0"
							max="100"
							step={5}
							value={directWeight}
							onChange={(e) => {
								const val = Number(e.target.value);
								setDirectWeight(val);
								setIndirectWeight(100 - val);
							}}
							className="w-full h-2 bg-secondary/30 rounded-lg appearance-none cursor-pointer accent-primary"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<div className="flex justify-between items-center">
							<label className="text-sm font-medium">
								Indirect (Survey) Attainment
							</label>
							<span className="text-sm font-bold text-primary">
								{indirectWeight}%
							</span>
						</div>
						<input
							type="range"
							min="0"
							max="100"
							step={5}
							value={indirectWeight}
							onChange={(e) => {
								const val = Number(e.target.value);
								setIndirectWeight(val);
								setDirectWeight(100 - val);
							}}
							className="w-full h-2 bg-secondary/30 rounded-lg appearance-none cursor-pointer accent-primary"
						/>
					</div>

					<div className="pt-2">
						<Button
							className="w-full"
							size="sm"
							onClick={saveWeightage}
							disabled={saving}
						>
							<RefreshCw
								className={`w-4 h-4 mr-1.5 ${saving ? "animate-spin" : ""}`}
							/>
							Save Configuration
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
