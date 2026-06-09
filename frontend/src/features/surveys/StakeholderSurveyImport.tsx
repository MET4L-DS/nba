import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";
import { surveyApi } from "@/services/api/surveys";
import { useCSVParser } from "@/features/shared/useCSVParser";

const PO_PATTERNS = [
	/^PO\s*(\d+)$/i,
	/^P[SO]\s*(\d+)$/i,
	/^PSO\s*(\d+)$/i,
];

const LIKERT_TEXT_MAP: Record<string, number> = {
	"strongly agree": 5,
	agree: 4,
	neutral: 3,
	disagree: 2,
	"strongly disagree": 1,
};

function parseLikertValue(raw: unknown): number | null {
	if (raw === undefined || raw === null) return null;
	if (typeof raw === "number" && raw >= 1 && raw <= 5) return raw;
	const s = String(raw).trim().toLowerCase();
	if (s === "") return null;
	const n = parseInt(s, 10);
	if (!isNaN(n) && n >= 1 && n <= 5) return n;
	const mapped = LIKERT_TEXT_MAP[s];
	if (mapped !== undefined) return mapped;
	return null;
}

function detectPoName(header: string): string | null {
	const trimmed = header.trim();
	for (const pat of PO_PATTERNS) {
		const m = trimmed.match(pat);
		if (m) {
			const prefix = trimmed.toUpperCase().startsWith("PSO") ? "PSO" : "PO";
			return `${prefix}${m[1]}`;
		}
	}
	return null;
}

function detectMetaColumn(header: string): "name" | "qualification" | null {
	const lower = header.trim().toLowerCase();
	if (lower === "name" || lower === "respondent name" || lower === "respondent_name") return "name";
	if (lower === "qualification" || lower === "designation" || lower === "position") return "qualification";
	return null;
}

interface StakeholderSurveyImportProps {
	programmeId: number;
	batchYear: string;
	stakeholderType: string;
	onImportComplete?: () => void;
}

export function StakeholderSurveyImport({
	programmeId,
	batchYear,
	stakeholderType,
	onImportComplete,
}: StakeholderSurveyImportProps) {
	const { parseCSV, isParsing, error: parseError } = useCSVParser<any>();
	const [columnMapping, setColumnMapping] = useState<Record<string, string | null>>({});
	const [metaMapping, setMetaMapping] = useState<Record<string, "name" | "qualification" | null>>({});
	const [parsedData, setParsedData] = useState<any[] | null>(null);
	const [headers, setHeaders] = useState<string[]>([]);
	const [importing, setImporting] = useState(false);
	const [hasData, setHasData] = useState(false);

	const poOptions = useMemo(
		() => [...Array(12)].map((_, i) => `PO${i + 1}`),
		[],
	);
	const psoOptions = useMemo(
		() => [...Array(3)].map((_, i) => `PSO${i + 1}`),
		[],
	);

	const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		parseCSV(file, {
			requiredHeaders: [],
			onParseComplete: (data: any[]) => {
				if (data.length === 0) {
					toast.error("CSV file is empty");
					return;
				}
				const cols = Object.keys(data[0]);
				setHeaders(cols);
				setParsedData(data);

				const mapping: Record<string, string | null> = {};
				const meta: Record<string, "name" | "qualification" | null> = {};
				for (const col of cols) {
					const po = detectPoName(col);
					if (po) {
						mapping[col] = po;
					} else {
						const metaType = detectMetaColumn(col);
						if (metaType) {
							meta[col] = metaType;
							mapping[col] = null;
						} else {
							mapping[col] = null;
						}
					}
				}
				setColumnMapping(mapping);
				setMetaMapping(meta);
			},
		});
	};

	const handleMappingChange = (column: string, value: string) => {
		setColumnMapping((prev) => ({
			...prev,
			[column]: value || null,
		}));
	};

	const getPoColumns = () =>
		Object.entries(columnMapping).filter(
			([col, v]) => v !== null && !metaMapping[col],
		);

	const handleImport = async () => {
		if (!parsedData || !columnMapping) return;
		const year = parseInt(batchYear, 10);
		if (!year || year < 1900 || year > 2100) {
			toast.error("Invalid batch year");
			return;
		}
		if (!stakeholderType) {
			toast.error("No stakeholder type selected");
			return;
		}

		const usedPoColumns = getPoColumns();
		if (usedPoColumns.length === 0) {
			toast.error("No PO/PSO columns mapped");
			return;
		}

		const responses: Array<{
			po_name: string;
			likert_rating: number;
			respondent_identifier: string | null;
			respondent_name: string | null;
			qualification: string | null;
		}> = [];

		for (let ri = 0; ri < parsedData.length; ri++) {
			const row = parsedData[ri];
			const respondentId = `ROW_${ri}`;
			const respondentName = metaMapping
				? (Object.entries(metaMapping).find(
						([, v]) => v === "name",
					)?.[0] ?? null)
				: null;
			const qualificationCol = metaMapping
				? (Object.entries(metaMapping).find(
						([, v]) => v === "qualification",
					)?.[0] ?? null)
				: null;

			const nameVal = respondentName
				? String(row[respondentName] ?? "").trim() || null
				: null;
			const qualVal = qualificationCol
				? String(row[qualificationCol] ?? "").trim() || null
				: null;

			for (const [col, poName] of Object.entries(columnMapping)) {
				if (!poName) continue;
				if (metaMapping[col]) continue;
				const rating = parseLikertValue(row[col]);
				if (rating === null) continue;

				responses.push({
					po_name: poName,
					likert_rating: rating,
					respondent_identifier: respondentId,
					respondent_name: nameVal,
					qualification: qualVal,
				});
			}
		}

		if (responses.length === 0) {
			toast.error("No valid Likert ratings found in mapped columns");
			return;
		}

		setImporting(true);
		try {
			const existing = await surveyApi.getStakeholderSurvey(
				programmeId,
				year,
				stakeholderType,
			);
			if (!existing || !existing.questions?.length) {
				const usedPos = getPoColumns();
				const uniquePos = [...new Set(usedPos.map(([, v]) => v))];
				const autoQuestions = uniquePos
					.filter((po): po is string => po !== null)
					.map((po, i) => ({
						question_number: i + 1,
						question_text: `Rate ${po}`,
						po_name: po,
						mapping_weight: 1.0,
					}));
				await surveyApi.saveStakeholderQuestions(
					programmeId,
					year,
					stakeholderType,
					autoQuestions,
				);
			}
			const result = await surveyApi.importStakeholderCsv(programmeId, {
				batch_year: year,
				stakeholder_type: stakeholderType,
				responses,
			});
			toast.success(
				`Imported ${result.imported_count} responses` +
					(result.error_count > 0
						? ` (${result.error_count} errors)`
						: ""),
			);
			setHasData(true);
			onImportComplete?.();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to import stakeholder survey");
		} finally {
			setImporting(false);
		}
	};

	const handleClear = async () => {
		const year = parseInt(batchYear, 10);
		if (!confirm("Clear all stakeholder survey data for this programme/batch?"))
			return;
		try {
			await surveyApi.clearStakeholder(programmeId, year, stakeholderType);
			toast.success("Stakeholder survey data cleared");
			setHasData(false);
			setParsedData(null);
			onImportComplete?.();
		} catch {
			toast.error("Failed to clear stakeholder data");
		}
	};

	const renderingColumns = headers.filter(
		(col) => !metaMapping[col],
	);

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<span>Batch: <strong>{batchYear}</strong></span>
				<span>Type: <strong>{stakeholderType}</strong></span>
			</div>

			<p className="text-xs text-muted-foreground">
				Upload a Google Forms CSV export. PO/PSO columns (e.g. "PO1", "PSO1")
				are auto-detected. "Name" and "Qualification" are also auto-detected.
				Likert text ("Strongly Agree"→5) or numeric values supported.
			</p>

			<div>
				<input
					type="file"
					accept=".csv"
					onChange={handleFileSelected}
					className="hidden"
					id="stk-csv-input"
				/>
				<Button
					variant="outline"
					size="sm"
					disabled={isParsing}
					onClick={() =>
						document.getElementById("stk-csv-input")?.click()
					}
				>
					<Download className="w-4 h-4 mr-1.5" />
					{isParsing ? "Parsing..." : "Upload CSV"}
				</Button>
				{parseError && (
					<p className="text-sm text-red-500 mt-1">{parseError}</p>
				)}
			</div>

			{headers.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-sm font-medium">Column Mapping</h4>
					<div className="grid grid-cols-[1fr_auto] gap-2 text-sm max-w-lg">
						{renderingColumns.map((col) => (
							<div key={col} className="contents">
								<span className="truncate py-1 text-xs">{col}</span>
								<select
									className="h-7 rounded border px-2 text-xs"
									value={columnMapping[col] ?? ""}
									onChange={(e) =>
										handleMappingChange(col, e.target.value)
									}
								>
									<option value="">Skip</option>
									{poOptions.map((po) => (
										<option key={po} value={po}>
											{po}
										</option>
									))}
									{psoOptions.map((pso) => (
										<option
											key={pso}
											value={pso}
										>
											{pso}
										</option>
									))}
								</select>
							</div>
						))}
					</div>

					{Object.entries(metaMapping).length > 0 && (
						<p className="text-xs text-muted-foreground">
							Auto-detected:{" "}
							{Object.entries(metaMapping)
								.map(([col, type]) => `${col} → ${type}`)
								.join(", ")}
						</p>
					)}

					<div className="flex gap-2 pt-1">
						<Button
							size="sm"
							onClick={handleImport}
							disabled={
								importing ||
								!batchYear ||
								!stakeholderType ||
								getPoColumns().length === 0
							}
						>
							{importing ? "Importing..." : "Import Responses"}
						</Button>
						{hasData && (
							<Button
								variant="destructive"
								size="sm"
								onClick={handleClear}
							>
								<Trash2 className="w-4 h-4 mr-1" />
								Clear
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}