import { motion } from "framer-motion";
import type { OfferingAttainmentCO } from "@/services/api/types";

interface BlendedAttainmentTableProps {
	attainmentCoData: OfferingAttainmentCO[];
	directWeight: number;
	indirectWeight: number;
}

function matchCoName(coName: string, coNum: number): boolean {
	const n = coName.replace(/[^0-9]/g, "");
	return n === String(coNum);
}

const rowVariants = {
	hidden: { opacity: 0, y: 8 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.35,
			ease: [0.16, 1, 0.3, 1] as const,
		},
	},
};

export function BlendedAttainmentTable({
	attainmentCoData,
	directWeight,
	indirectWeight,
}: BlendedAttainmentTableProps) {
	const hasMatchingData = attainmentCoData.some((c) =>
		[1, 2, 3, 4, 5, 6].some((n) => matchCoName(c.co_name, n)),
	);

	return (
		<div>
			<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
				Calculated Attainment (Direct + Indirect)
			</h4>
			<div className="border rounded-lg overflow-hidden h-full">
				<table className="w-full text-left border-collapse text-sm">
					<thead className="bg-muted/50">
						<tr>
							<th className="p-2 border-b border-r font-semibold">
								Outcome
							</th>
							<th className="p-2 border-b border-r font-semibold">
								Direct ({directWeight}%)
							</th>
							<th className="p-2 border-b border-r font-semibold">
								Indirect ({indirectWeight}%)
							</th>
							<th className="p-2 border-b font-bold text-primary">
								Blended Final
							</th>
						</tr>
					</thead>
					<motion.tbody
						initial="hidden"
						animate="visible"
						variants={{
							visible: {
								transition: {
									staggerChildren: 0.04,
								},
							},
						}}
					>
						{[1, 2, 3, 4, 5, 6].map((coNum) => {
							const coData = attainmentCoData.find(
								(c) => matchCoName(c.co_name, coNum),
							);
							if (!coData) return null;
							const directVal =
								Number(coData.attainment_level ?? 0);
							const indirectVal =
								Number(coData.indirect_attainment_level ?? 0);
							const finalVal =
								Number(coData.final_attainment_level ?? directVal);
							return (
								<motion.tr
									key={coNum}
									variants={rowVariants}
									className="border-b last:border-0 hover:bg-muted/30 transition-colors"
								>
									<td className="p-2 border-r font-semibold">
										CO{coNum}
									</td>
									<td className="p-2 border-r font-mono text-xs">
										{directVal.toFixed(2)}
									</td>
									<td className="p-2 border-r font-mono text-xs">
										{indirectVal.toFixed(2)}
									</td>
									<td className="p-2 font-mono text-xs font-bold bg-primary/5">
										{finalVal.toFixed(2)}
									</td>
								</motion.tr>
							);
						})}
						{!attainmentCoData.length && (
							<tr className="border-b last:border-0">
								<td
									colSpan={4}
									className="p-4 text-center text-muted-foreground text-xs"
								>
									No attainment data yet. Import survey
									responses to see blended attainment.
								</td>
							</tr>
						)}
						{attainmentCoData.length > 0 && !hasMatchingData && (
							<tr className="border-b last:border-0">
								<td
									colSpan={4}
									className="p-4 text-center text-muted-foreground text-xs"
								>
									Attainment data format not recognized. Expected CO1-CO6 names.
								</td>
							</tr>
						)}
					</motion.tbody>
				</table>
			</div>
		</div>
	);
}
