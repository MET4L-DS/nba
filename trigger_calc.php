<?php
require 'api/config/DatabaseConfig.php';
require 'api/models/Course.php';
require 'api/models/CourseRepository.php';
require 'api/models/AttainmentScale.php';
require 'api/models/AttainmentScaleRepository.php';
require 'api/models/AttainmentSnapshotRepository.php';
require 'api/models/CoPoRepository.php';
require 'api/models/ProgrammeRepository.php';
require 'api/models/CourseOffering.php';
require 'api/models/CourseOfferingRepository.php';
require 'api/models/CourseSurveyRepository.php';
require 'api/utils/AttainmentSnapshotService.php';

$dbConfig = new DatabaseConfig();
$db = $dbConfig->getConnection();

$repo = new AttainmentSnapshotRepository($db);
$scale = new AttainmentScaleRepository($db);
$copo = new CoPoRepository($db);
$off = new CourseOfferingRepository($db);
$survey = new CourseSurveyRepository($db);

$service = new AttainmentSnapshotService($db, $repo, $scale, $copo, $off, $survey);
$service->calculateAndPersist(99901);
echo 'Done!';
