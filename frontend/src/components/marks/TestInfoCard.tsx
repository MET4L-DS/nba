import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import type { Test } from "@/services/api";
import type { ReactNode } from "react";

interface TestInfoCardProps {
	test: Test;
	onSave: () => void;
	isSaving: boolean;
	isDisabled: boolean;
	children: ReactNode;
}

export function TestInfoCard({
	test,
	onSave,
	isSaving,
	isDisabled,
	children,
}: TestInfoCardProps) {
	return (
		<Card className="w-full gap-2 overflow-hidden">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>{test.name}</CardTitle>
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
							Full Marks: {test.full_marks} | Pass Marks:{" "}
							{test.pass_marks}
						</p>
					</div>
					<Button
						onClick={onSave}
						disabled={isSaving || isDisabled}
						className="gap-2"
					>
						<Save className="w-4 h-4" />
						{isSaving ? "Saving..." : "Save All Marks"}
					</Button>
				</div>
			</CardHeader>
			{children}
		</Card>
	);
}
