import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface PhoneListInputProps {
	phones: string[];
	onChange: (phones: string[]) => void;
	disabled?: boolean;
	errors?: Record<string, string>;
	errorPrefix?: string;
}

export function PhoneListInput({
	phones,
	onChange,
	disabled = false,
	errors = {},
	errorPrefix = "phone_",
}: PhoneListInputProps) {
	const addPhoneField = () => {
		onChange([...phones, ""]);
	};

	const removePhoneField = (index: number) => {
		const newPhones = [...phones];
		newPhones.splice(index, 1);
		if (newPhones.length === 0) newPhones.push("");
		onChange(newPhones);
	};

	const updatePhoneField = (index: number, value: string) => {
		const newPhones = [...phones];
		newPhones[index] = value.replace(/\D/g, "").slice(0, 10);
		onChange(newPhones);
	};

	return (
		<div className="space-y-1.5 col-span-2 border-t pt-4 mt-2">
			<div className="flex items-center justify-between mb-2">
				<Label className="text-sm font-semibold">Contact Numbers</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="h-7 text-xs gap-1"
					onClick={addPhoneField}
					disabled={disabled}
				>
					<Plus className="h-3 w-3" />
					Add Number
				</Button>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<AnimatePresence initial={false}>
					{phones.map((phone, idx) => {
						const errorKey = `${errorPrefix}${idx}`;
						return (
							<motion.div
								key={idx}
								initial={{ opacity: 0, scale: 0.95, y: 10 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: -10 }}
								transition={{ type: "spring", duration: 0.3 }}
								className="space-y-1"
							>
								<div className="flex gap-2">
									<div className="relative flex-1">
										<Input
											placeholder="10-digit number"
											value={phone}
											onChange={(e) =>
												updatePhoneField(
													idx,
													e.target.value,
													)
											}
											disabled={disabled}
											className={
												errors[errorKey]
													? "border-red-500 pr-8"
													: "pr-8"
											}
										/>
										<span className="absolute right-2 top-2.5 text-[10px] text-muted-foreground font-mono">
											#{idx + 1}
										</span>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-90 transition-transform duration-100 cursor-pointer"
										onClick={() => removePhoneField(idx)}
										disabled={disabled}
									>
										<Minus className="h-4 w-4" />
									</Button>
								</div>
								{errors[errorKey] && (
									<p className="text-[10px] text-red-500 ml-1 animate-shake">
										{errors[errorKey]}
									</p>
								)}
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>
		</div>
	);
}
