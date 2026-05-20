import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { hodApi } from "@/services/api/hod";
import type { ProgrammeBatch } from "@/services/api";

interface BatchSelectorProps {
	programmeId: number | null;
	value?: number | null;
	onChange?: (batchId: number | null, batch?: ProgrammeBatch) => void;
	label?: string;
	includeAll?: boolean;
	disabled?: boolean;
	statusFilter?: "upcoming" | "active" | "completed";
}

export function BatchSelector({
	programmeId,
	value,
	onChange,
	label = "Batch",
	includeAll = false,
	disabled = false,
	statusFilter,
}: BatchSelectorProps) {
	const [batches, setBatches] = useState<ProgrammeBatch[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!programmeId) {
			setBatches([]);
			return;
		}
		setLoading(true);
		hodApi
			.getBatchesByProgramme(programmeId)
			.then((data) => {
				let filtered = data ?? [];
				if (statusFilter) {
					filtered = filtered.filter(
						(b) => b.status === statusFilter,
					);
				}
				setBatches(filtered);
			})
			.catch(() => setBatches([]))
			.finally(() => setLoading(false));
	}, [programmeId, statusFilter]);

	return (
		<div className="space-y-2">
			{label && <Label>{label}</Label>}
			<Select
				value={value ? String(value) : ""}
				onValueChange={(val) => {
					if (val === "__all__") {
						onChange?.(null, undefined);
						return;
					}
					const batch = batches.find(
						(b) => b.batch_id === Number(val),
					);
					onChange?.(batch?.batch_id ?? null, batch);
				}}
				disabled={disabled || loading || batches.length === 0}
			>
				<SelectTrigger>
					<SelectValue
						placeholder={
							loading
								? "Loading batches..."
								: batches.length === 0
									? "No batches available"
									: "Select a batch"
						}
					/>
				</SelectTrigger>
				<SelectContent>
					{includeAll && (
						<SelectItem value="__all__">All Batches</SelectItem>
					)}
					{batches.map((batch) => (
						<SelectItem
							key={batch.batch_id}
							value={String(batch.batch_id)}
						>
							{batch.batch_year}{" "}
							{batch.status === "upcoming"
								? "(Upcoming)"
								: batch.status === "completed"
									? "(Completed)"
									: ""}
							{batch.student_count != null &&
								` — ${batch.student_count} students`}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
