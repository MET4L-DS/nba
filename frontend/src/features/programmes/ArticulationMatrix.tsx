import { Card } from "@/components/ui/card";

interface ArticulationMatrixProps {
	data: {
		courses: any[];
		averages: Record<string, number>;
		indirect: Record<string, number>;
		finals: Record<string, number>;
		targets: Record<string, number>;
	};
	poList: string[];
}

export function ArticulationMatrix({ data, poList }: ArticulationMatrixProps) {
	return (
		<Card className="border border-outline-variant shadow-sm overflow-hidden flex flex-col">
			<div className="p-4 border-b bg-muted/20">
				<h3 className="text-lg font-semibold flex items-center gap-2">
					<div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
					</div>
					Programme Articulation Matrix
				</h3>
				<p className="text-sm text-muted-foreground mt-1 ml-10">
					Course-level PO/PSO attainment with summary footer rows.
				</p>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full text-sm whitespace-nowrap">
					<thead className="bg-muted/40 sticky top-0 z-10 shadow-sm border-b">
						<tr>
							<th className="text-left px-4 py-3 w-12 font-medium text-muted-foreground">#</th>
							<th className="text-left px-4 py-3 min-w-[100px] font-medium text-muted-foreground">
								Code
							</th>
							<th className="text-left px-4 py-3 min-w-[200px] font-medium text-muted-foreground">
								Course
							</th>
							{poList.map((po) => (
								<th
									key={po}
									className="text-center px-4 py-3 min-w-[64px] font-semibold"
								>
									{po}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y">
						{data.courses.length === 0 ? (
							<tr>
								<td
									colSpan={3 + poList.length}
									className="px-4 py-8 text-muted-foreground text-center"
								>
									No courses found for this programme and
									batch.
								</td>
							</tr>
						) : (
							data.courses.map((course, idx) => (
								<tr key={course.offering_id} className="hover:bg-muted/10 transition-colors">
									<td className="px-4 py-2.5 text-muted-foreground">
										{idx + 1}
									</td>
									<td className="px-4 py-2.5 font-mono text-xs font-medium">
										{course.course_code}
									</td>
									<td className="px-4 py-2.5 text-ellipsis overflow-hidden max-w-[250px]" title={course.course_name}>
										{course.course_name}
									</td>
									{poList.map((po) => {
										const val = course.values[po];
										return (
											<td
												key={po}
												className="px-4 py-2.5 text-center tabular-nums"
											>
												{val != null
													? (
														<span className="inline-block bg-muted/30 px-2 py-0.5 rounded text-xs font-medium">
															{Number(val).toFixed(2)}
														</span>
													)
													: <span className="text-muted-foreground/30">—</span>}
											</td>
										);
									})}
								</tr>
							))
						)}
					</tbody>
					{data.courses.length > 0 && (
						<tfoot className="font-medium text-sm border-t-2">
							{/* Direct row */}
							<tr className="bg-muted/10 border-t">
								<td
									colSpan={3}
									className="px-4 py-3 text-muted-foreground text-right pr-6"
								>
									Direct Attainment (Average)
								</td>
								{poList.map((po) => (
									<td
										key={po}
										className="px-4 py-3 text-center tabular-nums font-semibold"
									>
										{Number(
											data.averages[po] ?? 0,
										).toFixed(2)}
									</td>
								))}
							</tr>
							{/* Indirect row */}
							<tr className="bg-muted/10 border-t border-dashed">
								<td
									colSpan={3}
									className="px-4 py-3 text-muted-foreground text-right pr-6"
								>
									Indirect Attainment (Surveys)
								</td>
								{poList.map((po) => {
									const val = data.indirect[po];
									return (
										<td
											key={po}
											className="px-4 py-3 text-center tabular-nums font-semibold"
										>
											{val != null
												? Number(val).toFixed(2)
												: <span className="text-muted-foreground/30">—</span>}
										</td>
									);
								})}
							</tr>
							{/* Final row */}
							<tr className="bg-primary/5 border-t border-primary/20">
								<td
									colSpan={3}
									className="px-4 py-4 text-primary font-semibold text-right pr-6"
								>
									Final Attainment (Blended)
								</td>
								{poList.map((po) => (
									<td
										key={po}
										className="px-4 py-4 text-center tabular-nums font-bold text-primary"
									>
										{Number(
											data.finals[po] ?? 0,
										).toFixed(2)}
									</td>
								))}
							</tr>
							{/* Target row */}
							<tr className="bg-muted/30 border-t">
								<td
									colSpan={3}
									className="px-4 py-3 text-muted-foreground font-semibold text-right pr-6"
								>
									Target Level
								</td>
								{poList.map((po) => {
									const val = data.targets[po];
									const final = data.finals[po] ?? 0;
									const isMet = val != null && final >= val;
									return (
										<td
											key={po}
											className="px-4 py-3 text-center tabular-nums"
										>
											{val != null
												? (
													<span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded text-xs font-bold ${isMet ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
														{Number(val).toFixed(2)}
													</span>
												)
												: <span className="text-muted-foreground/30">—</span>}
										</td>
									);
								})}
							</tr>
						</tfoot>
					)}
				</table>
			</div>
		</Card>
	);
}
