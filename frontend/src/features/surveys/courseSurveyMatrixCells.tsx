import { TableCell } from "@/components/ui/table";

interface RatingCellProps {
	rating: number | null | undefined;
}

export function RatingCell({ rating }: RatingCellProps) {
	return (
		<TableCell className="text-right border-r font-mono">
			{rating !== null && rating !== undefined
				? Number(rating).toFixed(2)
				: "-"}
		</TableCell>
	);
}

interface WeightedValCellProps {
	rating: number | null | undefined;
	weight: number;
}

export function WeightedValCell({ rating, weight }: WeightedValCellProps) {
	const weightedVal =
		rating !== null && rating !== undefined
			? Number(rating) * Number(weight)
			: null;
	return (
		<TableCell className="text-right font-semibold border-r font-mono">
			{weightedVal !== null ? weightedVal.toFixed(2) : "-"}
		</TableCell>
	);
}

interface VarianceCellProps {
	variance: string | null | undefined;
}

export function VarianceCell({ variance }: VarianceCellProps) {
	return (
		<TableCell className="text-muted-foreground text-xs font-mono">
			{variance ? `σ: ${Number(variance).toFixed(2)}` : "-"}
		</TableCell>
	);
}

interface WeightCellProps {
	weight: number;
}

export function WeightCell({ weight }: WeightCellProps) {
	return (
		<TableCell className="text-right text-muted-foreground border-r font-mono">
			{Number(weight).toFixed(2)}
		</TableCell>
	);
}

interface CoLabelCellProps {
	coNum: number;
	rowSpan: number;
}

export function CoLabelCell({ coNum, rowSpan }: CoLabelCellProps) {
	return (
		<TableCell
			className="text-center font-bold bg-muted/20 border-r"
			rowSpan={rowSpan}
		>
			CO{coNum}
		</TableCell>
	);
}
