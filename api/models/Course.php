<?php

/**
 * Course Model
 * Represents a course entity
 */
class Course
{
    private $course_id;
    private $courseCode;
    private $course_name;
    private $credit;
    private $syllabusPdf;
    private $facultyId;
    private $year;
    private $semester;
    private $coThreshold;
    private $passingThreshold;
    private $departmentId;
    private $courseType;
    private $course_level;
    private $is_active;
    private $createdAt;
    private $updatedAt;

    public function __construct(
        $course_id, 
        $courseCode, 
        $course_name, 
        $credit, 
        $facultyId, 
        $year, 
        $semester, 
        $syllabusPdf = null, 
        $coThreshold = 40.00, 
        $passingThreshold = 60.00, 
        $departmentId = null, 
        $courseType = 'Theory', 
        $course_level = 'Undergraduate',
        $is_active = 1,
        $createdAt = null, 
        $updatedAt = null
    ) {
        $this->course_id = $course_id;
        $this->setCourseCode($courseCode);
        $this->setCourseName($course_name);
        $this->setCredit($credit);
        $this->setFacultyId($facultyId);
        $this->setYear($year);
        $this->setSemester($semester);
        $this->syllabusPdf = $syllabusPdf;
        $this->setCoThreshold($coThreshold);
        $this->setPassingThreshold($passingThreshold);
        $this->departmentId = $departmentId;
        $this->courseType = $courseType;
        $this->course_level = $course_level;
        $this->is_active = $is_active;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    // Getters
    public function getCourseId()
    {
        return $this->course_id;
    }
    public function getCourseCode()
    {
        return $this->courseCode;
    }
    public function getCourseName()
    {
        return $this->course_name;
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
    public function getDepartmentId()
    {
        return $this->departmentId;
    }
    public function getCourseType()
    {
        return $this->courseType;
    }
    public function getCourseLevel()
    {
        return $this->course_level;
    }
    public function getIsActive()
    {
        return $this->is_active;
    }
    public function getCreatedAt()
    {
        return $this->createdAt;
    }
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    // Setters with validation
    public function setCourseId($course_id)
    {
        $this->course_id = $course_id;
    }

    public function setCourseCode($courseCode)
    {
        if (empty($courseCode) || strlen($courseCode) > 20) {
            throw new Exception("Course code must be between 1 and 20 characters");
        }
        $this->courseCode = $courseCode;
    }

    public function setCourseName($course_name)
    {
        if (empty($course_name) || strlen($course_name) > 255) {
            throw new Exception("Course name must be between 1 and 255 characters");
        }
        $this->course_name = $course_name;
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

    public function setDepartmentId($departmentId)
    {
        if ($departmentId !== null && (!is_numeric($departmentId) || $departmentId <= 0)) {
            throw new Exception("Department ID must be a positive number or null");
        }
        $this->departmentId = (int)$departmentId;
    }

    public function setCourseType($courseType)
    {
        $validTypes = ['Theory', 'Lab', 'Project', 'Seminar'];
        if (!in_array($courseType, $validTypes)) {
            throw new Exception("Course type must be one of: " . implode(', ', $validTypes));
        }
        $this->courseType = $courseType;
    }

    public function setCourseLevel($course_level)
    {
        $validLevels = ['Undergraduate', 'Postgraduate'];
        if (!in_array($course_level, $validLevels)) {
            throw new Exception("Course level must be one of: " . implode(', ', $validLevels));
        }
        $this->course_level = $course_level;
    }

    public function setIsActive($is_active)
    {
        $this->is_active = (bool)$is_active;
    }

    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;
    }

    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;
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
            'course_id' => $this->course_id,
            'course_code' => $this->courseCode,
            'course_name' => $this->course_name,
            'credit' => $this->credit,
            'syllabus_filename' => $generatedFilename,
            'has_syllabus_pdf' => !is_null($this->syllabusPdf),
            'faculty_id' => $this->facultyId,
            'year' => $this->year,
            'semester' => $this->semester,
            'co_threshold' => $this->coThreshold,
            'passing_threshold' => $this->passingThreshold,
            'department_id' => $this->departmentId,
            'course_type' => $this->courseType,
            'course_level' => $this->course_level,
            'is_active' => $this->is_active,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt
        ];
    }
}
