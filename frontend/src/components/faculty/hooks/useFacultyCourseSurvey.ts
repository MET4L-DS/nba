import { useState, useEffect, useCallback, useMemo } from "react";
import { surveyApi } from "@/services/api/surveys";
import { attainmentApi } from "@/services/api/attainment";
import { coursesApi } from "@/services/api/courses";
import { debugLogger } from "@/lib/debugLogger";
import type {
	CourseExitSurveyResultsResponse,
	CourseExitSurveyConfig,
	OfferingAttainmentCO,
	AttainmentConfig,
	CourseExitSurveyQuestionAnalysis,
} from "@/services/api/types";

interface UseFacultyCourseSurveyProps {
	offeringId: number | undefined;
}

export function useFacultyCourseSurvey({ offeringId }: UseFacultyCourseSurveyProps) {
	const [loadError, setLoadError] = useState<string | null>(null);
	const [results, setResults] = useState<CourseExitSurveyResultsResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [config, setConfig] = useState<CourseExitSurveyConfig | null>(null);
	const [attainmentCoData, setAttainmentCoData] = useState<OfferingAttainmentCO[]>([]);
	const [attainmentConfig, setAttainmentConfig] = useState<AttainmentConfig | null>(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const refresh = useCallback(() => setRefreshTrigger((p) => p + 1), []);

	const [directWeight, setDirectWeight] = useState(80);
	const [metricsOpen, setMetricsOpen] = useState(true);
	const [configOpen, setConfigOpen] = useState(false);
	const [showManualEntry, setShowManualEntry] = useState(false);
	const [filterText, setFilterText] = useState("");

	useEffect(() => {
		if (!offeringId) {
			setLoadError("Course offering not available");
			return;
		}
		setLoadError(null);
		setLoading(true);
		Promise.all([
			surveyApi.getCourseExitResults(offeringId),
			surveyApi.getCourseExitSurvey(offeringId),
			attainmentApi.getOfferingAttainment(offeringId),
			coursesApi.getAttainmentConfig(offeringId),
		])
			.then(([res, cfg, attainResp, attainCfg]) => {
				setResults(res);
				setConfig(cfg);
				setAttainmentCoData(attainResp.co_attainment ?? []);
				setAttainmentConfig(attainCfg);
				setDirectWeight(attainCfg.direct_weightage ?? 80);
			})
			.catch((err) => {
				debugLogger.error(
					"useFacultyCourseSurvey",
					"Failed to load data",
					err,
				);
				setLoadError("Failed to load survey data. Please try again.");
			})
			.finally(() => setLoading(false));
	}, [offeringId, refreshTrigger]);

	const indirectWeight = useMemo(() => 100 - directWeight, [directWeight]);

	const coGroups = useMemo(() => {
		const groups: Record<
			number,
			{ questions: CourseExitSurveyQuestionAnalysis[]; avg: number | null }
		> = {};
		if (results?.question_analysis) {
			for (const q of results.question_analysis) {
				if (!groups[q.co_number]) {
					const coResult = results.co_results.find(
						(c) => c.co_number === q.co_number,
					);
					groups[q.co_number] = {
						questions: [],
						avg: coResult?.normalized_rating ?? null,
					};
				}
				groups[q.co_number].questions.push(q);
			}
		}
		return groups;
	}, [results?.question_analysis, results?.co_results]);

	return {
		loading,
		loadError,
		results,
		config,
		attainmentCoData,
		attainmentConfig,
		directWeight,
		setDirectWeight,
		indirectWeight,
		metricsOpen,
		setMetricsOpen,
		configOpen,
		setConfigOpen,
		showManualEntry,
		setShowManualEntry,
		filterText,
		setFilterText,
		coGroups,
		refresh,
	};
}
export type UseFacultyCourseSurveyReturn = ReturnType<typeof useFacultyCourseSurvey>;
