<?php

/**
 * Course Model
 * Represents a course entity
 */
class Course
{
    private $id;
    private $courseCode;
    private $name;
    private $credit;
    private $syllabusPdf;
    private $facultyId;
    private $year;
    private $semester;
    private $coThreshold;
    private $passingThreshold;

    public function __construct($id, $courseCode, $name, $credit, $facultyId, $year, $semester, $syllabusPdf = null, $coThreshold = 40.00, $passingThreshold = 60.00)
    {
        $this->id = $id;
        $this->setCourseCode($courseCode);
        $this->setName($name);
        $this->setCredit($credit);
        $this->setFacultyId($facultyId);
        $this->setYear($year);
        $this->setSemester($semester);
        $this->syllabusPdf = $syllabusPdf;
        $this->setCoThreshold($coThreshold);
        $this->setPassingThreshold($passingThreshold);
    }

    // Getters
    public function getId()
    {
        return $this->id;
    }
    public function getCourseCode()
    {
        return $this->courseCode;
    }
    public function getName()
    {
        return $this->name;
    }
    public function getCredit()
    {
        return $this->credit;
    }
    public function getSyllabusPdf()
    {
        return $this->syllabusPdf;
    }
    public function getFacultyId()
    {
        return $this->facultyId;
    }
    public function getYear()
    {
        return $this->year;
    }
    public function getSemester()
    {
        return $this->semester;
    }
    public function getCoThreshold()
    {
        return $this->coThreshold;
    }
    public function getPassingThreshold()
    {
        return $this->passingThreshold;
    }

    // Setters with validation
    public function setId($id)
    {
        $this->id = $id;
    }

    public function setCourseCode($courseCode)
    {
        if (empty($courseCode) || strlen($courseCode) > 20) {
            throw new Exception("Course code must be between 1 and 20 characters");
        }
        $this->courseCode = $courseCode;
    }

    public function setName($name)
    {
        if (empty($name) || strlen($name) > 255) {
            throw new Exception("Course name must be between 1 and 255 characters");
        }
        $this->name = $name;
    }

    public function setCredit($credit)
    {
        if (!is_numeric($credit) || $credit < 0) {
            throw new Exception("Credit must be a non-negative number");
        }
        $this->credit = (int)$credit;
    }

    public function setSyllabusPdf($syllabusPdf)
    {
        $this->syllabusPdf = $syllabusPdf;
    }

    public function setFacultyId($facultyId)
    {
        if (!is_numeric($facultyId)) {
            throw new Exception("Faculty ID must be a number");
        }
        $this->facultyId = (int)$facultyId;
    }

    public function setYear($year)
    {
        if (!is_numeric($year) || $year < 1000 || $year > 9999) {
            throw new Exception("Year must be a 4-digit calendar year (1000-9999)");
        }
        $this->year = (int)$year;
    }

    public function setSemester($semester)
    {
        if (!is_numeric($semester) || $semester < 1) {
            throw new Exception("Semester must be a positive integer");
        }
        $this->semester = (int)$semester;
    }

    public function setCoThreshold($coThreshold)
    {
        if (!is_numeric($coThreshold) || $coThreshold < 0 || $coThreshold > 100) {
            throw new Exception("CO threshold must be between 0 and 100");
        }
        $this->coThreshold = (float)$coThreshold;
    }

    public function setPassingThreshold($passingThreshold)
    {
        if (!is_numeric($passingThreshold) || $passingThreshold < 0 || $passingThreshold > 100) {
            throw new Exception("Passing threshold must be between 0 and 100");
        }
        $this->passingThreshold = (float)$passingThreshold;
    }

    /**
     * Convert to array
     */
    public function toArray()
    {
        // Generate filename dynamically: courseCode_year_semester.pdf
        $generatedFilename = null;
        if (!is_null($this->syllabusPdf)) {
            $generatedFilename = $this->courseCode . '_' . $this->year . '_' . $this->semester . '.pdf';
        }

        return [
            'id' => $this->id,
            'course_code' => $this->courseCode,
            'name' => $this->name,
            'credit' => $this->credit,
            'syllabus_filename' => $generatedFilename,
            'has_syllabus_pdf' => !is_null($this->syllabusPdf),
            'faculty_id' => $this->facultyId,
            'year' => $this->year,
            'semester' => $this->semester,
            'co_threshold' => $this->coThreshold,
            'passing_threshold' => $this->passingThreshold
        ];
    }
}
