import re

filepath = r'c:\xampp\htdocs\nba-met4l\api\models\CourseOfferingRepository.php'
with open(filepath, 'r') as f:
    content = f.read()

broken_start = content.find("                    'primary_faculty_id' => $data['primary_faculty_id'],")
broken_end = content.find('    /**\n     * Get offering with full details (course info + primary faculty)\n     */')

if broken_start != -1 and broken_end != -1:
    fixed_part = """                    'primary_faculty_id' => $data['primary_faculty_id'],
                    'primary_faculty_name' => $data['primary_faculty_name'],
                    'is_active' => $data['is_active'] ?? 1
                ];
            }

            return $offerings;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Get distinct year/semester pairs for a faculty
     */
    public function getYearSemestersByFaculty($facultyId)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT DISTINCT co.year, co.semester 
                FROM course_offerings co
                INNER JOIN course_faculty_assignments cfa ON co.offering_id = cfa.offering_id
                WHERE cfa.employee_id = ? AND cfa.is_active = 1
                ORDER BY co.year DESC, co.semester DESC
            ");
            $stmt->execute([$facultyId]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Save offering (create or update)
     */
    public function save(CourseOffering $offering)
    {
        try {
            if ($offering->getOfferingId()) {
                // Update existing offering
                $stmt = $this->db->prepare("
                    UPDATE course_offerings 
                    SET course_id = ?, year = ?, semester = ?, 
                        co_threshold = ?, passing_threshold = ?, 
                        syllabus_pdf = ?
                    WHERE offering_id = ?
                ");
                return $stmt->execute([
                    $offering->getCourseId(),
                    $offering->getYear(),
                    $offering->getSemester(),
                    $offering->getCoThreshold(),
                    $offering->getPassingThreshold(),
                    $offering->getSyllabusPdf(),
                    $offering->getOfferingId()
                ]);
            } else {
                // Insert new offering
                $stmt = $this->db->prepare("
                    INSERT INTO course_offerings 
                    (course_id, year, semester, co_threshold, passing_threshold, syllabus_pdf)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $result = $stmt->execute([
                    $offering->getCourseId(),
                    $offering->getYear(),
                    $offering->getSemester(),
                    $offering->getCoThreshold(),
                    $offering->getPassingThreshold(),
                    $offering->getSyllabusPdf()
                ]);

                if ($result) {
                    $offeringId = $this->db->lastInsertId();
                    $offering->setOfferingId($offeringId);
                    
                    // Add default attainment scales
                    $stmtScale = $this->db->prepare("
                        INSERT INTO attainment_scale (offering_id, level, min_percentage) 
                        VALUES (?, 3, 60.00), (?, 2, 50.00), (?, 1, 40.00)
                    ");
                    $stmtScale->execute([$offeringId, $offeringId, $offeringId]);
                }

                return $result;
            }
        } catch (Exception $e) {
            throw new Exception("Database error in save: " . $e->getMessage());
        }
    }

    /**
     * Delete offering
     */
    public function delete($id)
    {
        try {
            $stmt = $this->db->prepare("DELETE FROM course_offerings WHERE offering_id = ?");
            return $stmt->execute([$id]);
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

"""
    
    new_content = content[:broken_start] + fixed_part + content[broken_end:]
    with open(filepath, 'w') as f:
        f.write(new_content)
    print("File fixed!")
else:
    print("Could not find indices", broken_start, broken_end)
