import { CardHeader, CardTitle } from "@/components/ui/card";

interface StudentMarksCardHeaderProps {
	facultyName: string;
	departmentName: string;
	courseName: string;
	courseCode: string;
	year: number;
	semester: string;
}

export function StudentMarksCardHeader({
	facultyName,
	departmentName,
	courseName,
	courseCode,
	year,
	semester,
}: StudentMarksCardHeaderProps) {
	const getAcademicYear = (year: number) => `${year}-${year + 1}`;
	const getSemesterDisplay = (sem: string) => sem;
	const getCurrentSession = () => {
		const currentYear = new Date().getFullYear();
		return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
	};

	return (
		<CardHeader className="bg-orange-100 dark:bg-orange-950 border-b-4 border-orange-500">
			<div className="space-y-2">
				<CardTitle className="text-xl text-center text-gray-900 dark:text-white font-bold">
					TEZPUR UNIVERSITY
				</CardTitle>
				<div className="grid grid-cols-2 gap-2 text-sm">
					<div className="flex gap-2">
						<span className="font-semibold">Faculty Name:</span>
						<span>{facultyName}</span>
					</div>
					<div className="flex gap-2">
						<span className="font-semibold">BRANCH:</span>
						<span>{departmentName}</span>
					</div>
					<div className="flex gap-2">
						<span className="font-semibold">Programme:</span>
						<span>B. Tech</span>
					</div>
					<div className="flex gap-2">
						<span className="font-semibold">YEAR:</span>
						<span>{getAcademicYear(year)}</span>
						<span className="font-semibold ml-4">SEM:</span>
						<span>{getSemesterDisplay(semester)}</span>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2 text-sm">
					<div className="flex gap-2">
						<span className="font-semibold">Course:</span>
						<span>{courseName}</span>
					</div>
					<div className="flex gap-2">
						<span className="font-semibold">Course Code:</span>
						<span>{courseCode}</span>
						<span className="font-semibold ml-4">SESSION:</span>
						<span>{getCurrentSession()}</span>
					</div>
				</div>
			</div>
		</CardHeader>
	);
}
