import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import type { CSVParserOptions } from "./useCSVParser";
import { useCSVParser } from "./useCSVParser";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface CSVUploaderProps<T> {
	onDataParsed: (data: T[]) => void;
	options?: Omit<
		CSVParserOptions<T>,
		"onParseComplete" | "onParseError" | "onParseStart"
	>;
	buttonText?: string;
	accept?: string;
	isLoading?: boolean;
	onDownloadTemplate?: () => void;
	uploadTooltipText?: string;
	downloadTooltipText?: string;
}

export function CSVUploader<T = any>({
	onDataParsed,
	options,
	buttonText = "Upload CSV",
	accept = ".csv",
	isLoading = false,
	onDownloadTemplate,
	uploadTooltipText,
	downloadTooltipText,
}: CSVUploaderProps<T>) {
	const { parseCSV, isParsing, error, setError } = useCSVParser<T>();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		parseCSV(file, {
			...options,
			onParseStart: () => {},
			onParseError: () => {
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
			},
			onParseComplete: (data) => {
				onDataParsed(data);
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
			},
		});
	};

	const handleButtonClick = () => {
		setError(null);
		fileInputRef.current?.click();
	};

	const activeParsing = isParsing || isLoading;

	return (
		<div className="flex flex-col gap-2">
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept={accept}
				className="hidden"
			/>
			<div className="flex items-center gap-2">
				{onDownloadTemplate && (
					<Tooltip>
						<TooltipTrigger asChild>
							<motion.div
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
							>
								<Button
									variant="outline"
									onClick={onDownloadTemplate}
									className="relative overflow-hidden cursor-pointer active:scale-95 transition-transform duration-100 font-medium"
								>
									<FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
									Download Template
								</Button>
							</motion.div>
						</TooltipTrigger>
						<TooltipContent side="top">
							{downloadTooltipText || "Download sample CSV template"}
						</TooltipContent>
					</Tooltip>
				)}

				<Tooltip>
					<TooltipTrigger asChild>
						<motion.div
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
						>
							<Button
								variant="outline"
								onClick={handleButtonClick}
								disabled={activeParsing}
								className="relative overflow-hidden cursor-pointer active:scale-95 transition-transform duration-100 font-medium"
							>
								{activeParsing ? (
									<Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
								) : (
									<Download className="w-4 h-4 mr-2" />
								)}
								{activeParsing ? "Parsing..." : buttonText}
								
								{activeParsing && (
									<motion.span
										className="absolute inset-0 bg-primary/5 dark:bg-primary/10"
										animate={{ opacity: [0.3, 0.6, 0.3] }}
										transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
									/>
								)}
							</Button>
						</motion.div>
					</TooltipTrigger>
					<TooltipContent side="top">
						{uploadTooltipText || "Upload CSV file"}
					</TooltipContent>
				</Tooltip>
			</div>
			
			<AnimatePresence>
				{error && (
					<motion.p 
						initial={{ opacity: 0, y: -5 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -5 }}
						className="text-xs text-red-500 font-medium"
					>
						{error}
					</motion.p>
				)}
			</AnimatePresence>
		</div>
	);
}

