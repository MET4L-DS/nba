# Attainment Configuration Feature

## Overview

This feature allows faculty to configure and persist attainment criteria settings per course, including:

-   CO (Course Outcome) threshold
-   Passing threshold
-   Attainment level thresholds (Level 3, 2, 1)
-   Level 0 is calculated automatically (lowest threshold to 0%)

## Database Schema

### Course Table Updates

```sql
ALTER TABLE course ADD (
  co_threshold DECIMAL(5,2) DEFAULT 40.00,
  passing_threshold DECIMAL(5,2) DEFAULT 60.00
);
```

**Fields:**

-   `co_threshold`: Minimum percentage for CO attainment (default: 40%)
-   `passing_threshold`: Minimum percentage for passing (default: 60%)

### Attainment Scale Table

```sql
CREATE TABLE attainment_scale (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT NOT NULL,
  level SMALLINT CHECK (level BETWEEN 0 AND 10),
  min_percentage DECIMAL(5,2) CHECK (min_percentage BETWEEN 0 AND 100),
  UNIQUE KEY (course_id, level),
  FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE
);
```

**Design Decisions:**

-   Level 0 is NOT stored (calculated automatically)
-   Each course can have unique attainment scales
-   Cascade delete ensures cleanup when courses are removed
-   UNIQUE constraint prevents duplicate levels per course

## Backend Implementation

### 1. Models

**AttainmentScale.php** - Data transfer object

```php
class AttainmentScale {
    public $id;
    public $course_id;
    public $level;
    public $min_percentage;
}
```

**Course.php** - Updated with threshold fields

```php
private $coThreshold;
private $passingThreshold;

public function getCoThreshold();
public function getPassingThreshold();
```

### 2. Repositories

**AttainmentScaleRepository.php**

-   `getByCourseId($courseId)` - Fetch all scales ordered by level DESC
-   `saveBulk($courseId, $scales)` - Transactional bulk replace
-   `deleteByCourseId($courseId)` - Remove all scales for course
-   `existsForCourse($courseId)` - Check if configured

**CourseRepository.php** - Updated methods

-   `findById()` - Now includes threshold fields
-   `updateThresholds($courseId, $coThreshold, $passingThreshold)` - Update thresholds

### 3. Controller

**AttainmentController.php**

**GET /courses/{id}/attainment-config**

-   Requires JWT authentication
-   Returns course thresholds and attainment scales
-   Response format:

```json
{
	"success": true,
	"data": {
		"course_id": 1,
		"co_threshold": 40.0,
		"passing_threshold": 60.0,
		"attainment_thresholds": [
			{ "id": 1, "level": 3, "percentage": 70.0 },
			{ "id": 2, "level": 2, "percentage": 60.0 },
			{ "id": 3, "level": 1, "percentage": 50.0 }
		]
	}
}
```

**POST /courses/{id}/attainment-config**

-   Requires JWT authentication
-   Validates all inputs (0-100 range for percentages)
-   Saves course thresholds and attainment scales transactionally
-   Request format:

```json
{
	"course_id": 1,
	"co_threshold": 40,
	"passing_threshold": 60,
	"attainment_thresholds": [
		{ "id": 1, "percentage": 70 },
		{ "id": 2, "percentage": 60 },
		{ "id": 3, "percentage": 50 }
	]
}
```

### 4. Routes

Added to `api/routes/api.php`:

```php
elseif (preg_match('#^courses/(\d+)/attainment-config$#', $path, $matches)) {
    $courseId = $matches[1];
    if ($method === 'GET') {
        $user = $this->authMiddleware->requireAuth();
        $this->attainmentController->getConfig();
    } elseif ($method === 'POST') {
        $user = $this->authMiddleware->requireAuth();
        $this->attainmentController->saveConfig();
    }
}
```

## Frontend Implementation

### API Service

**Added to `frontend/src/services/api.ts`:**

```typescript
async getAttainmentConfig(courseId: number): Promise<{
  course_id: number;
  co_threshold: number;
  passing_threshold: number;
  attainment_thresholds: Array<{
    id: number;
    level: number;
    percentage: number;
  }>;
}>

async saveAttainmentConfig(config: {
  course_id: number;
  co_threshold: number;
  passing_threshold: number;
  attainment_thresholds: Array<{
    id: number;
    percentage: number;
  }>;
}): Promise<{ success: boolean; message: string }>
```

### Usage Example

```typescript
// Load configuration when course is selected
const config = await apiService.getAttainmentConfig(courseId);
setCoThreshold(config.co_threshold);
setPassingThreshold(config.passing_threshold);
setAttainmentThresholds(
	config.attainment_thresholds.map((t) => ({
		id: t.id,
		percentage: t.percentage,
	}))
);

// Save configuration
await apiService.saveAttainmentConfig({
	course_id: courseId,
	co_threshold: coThreshold,
	passing_threshold: passingThreshold,
	attainment_thresholds: attainmentThresholds,
});
```

## Migration Guide

### For Existing Deployments

1. **Run Migration Script**

```bash
mysql -u your_user -p nba_db < docs/migrations/001_add_attainment_config.sql
```

2. **Verify Changes**

```sql
-- Check course table structure
DESCRIBE course;

-- Check attainment_scale table
DESCRIBE attainment_scale;

-- View existing courses with default thresholds
SELECT id, course_code, name, co_threshold, passing_threshold FROM course;
```

3. **Optional: Set Default Scales**

```sql
-- Insert default 3-level scale for all courses
INSERT INTO attainment_scale (course_id, level, min_percentage)
SELECT id, 3, 70.00 FROM course UNION ALL
SELECT id, 2, 60.00 FROM course UNION ALL
SELECT id, 1, 50.00 FROM course;
```

### For New Deployments

Use the updated `docs/db.sql` which includes:

-   Course table with threshold columns
-   Attainment scale table

## Data Flow

### Load Configuration

1. User selects course in CO-PO mapping page
2. Frontend calls `GET /courses/{id}/attainment-config`
3. Backend fetches course thresholds and attainment scales
4. Frontend populates UI with saved configuration
5. If no configuration exists, defaults are used (40%, 60%, [70%, 60%, 50%])

### Save Configuration

1. User modifies thresholds in AttainmentSettingsPanel
2. User clicks "Save Settings" button
3. Frontend calls `POST /courses/{id}/attainment-config` with data
4. Backend validates inputs
5. Backend updates course thresholds in transaction
6. Backend replaces attainment scales in transaction
7. Success response confirms save
8. Frontend shows success toast notification

## Validation Rules

### Backend Validation

-   Course ID must be numeric and exist
-   CO threshold: 0 ≤ value ≤ 100
-   Passing threshold: 0 ≤ value ≤ 100
-   Attainment thresholds: At least one required
-   Each threshold: 0 ≤ percentage ≤ 100
-   Each threshold must have id and percentage

### Frontend Validation

-   Thresholds must be non-empty
-   Percentages must be numbers in range 0-100
-   Thresholds should be in descending order (not enforced but recommended)

## Security

-   All endpoints require JWT authentication
-   Faculty can only modify courses they own (enforced by auth middleware)
-   SQL injection prevented by prepared statements
-   Input validation on both frontend and backend

## Performance Considerations

-   Bulk replace strategy for attainment scales (simpler than differential updates)
-   Transactional saves ensure data consistency
-   Indexed foreign keys for efficient queries
-   Cascade deletes prevent orphaned records

## Testing

### Manual Testing Steps

1. **Test GET endpoint**

```bash
curl -X GET "http://localhost/nba/api/courses/1/attainment-config" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

2. **Test POST endpoint**

```bash
curl -X POST "http://localhost/nba/api/courses/1/attainment-config" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "course_id": 1,
    "co_threshold": 40,
    "passing_threshold": 60,
    "attainment_thresholds": [
      {"id": 1, "percentage": 70},
      {"id": 2, "percentage": 60},
      {"id": 3, "percentage": 50}
    ]
  }'
```

3. **Verify Database**

```sql
-- Check course thresholds
SELECT id, course_code, co_threshold, passing_threshold FROM course WHERE id = 1;

-- Check attainment scales
SELECT * FROM attainment_scale WHERE course_id = 1 ORDER BY level DESC;
```

## Known Limitations

1. Level 0 is not stored in database (calculated dynamically)
2. No versioning/history of configuration changes
3. No validation for logical consistency (e.g., Level 3 > Level 2 > Level 1)
4. Maximum 10 levels supported (enforced by CHECK constraint)

## Future Enhancements

1. Configuration history/audit trail
2. Template configurations (apply to multiple courses)
3. Department-level default configurations
4. Import/export configuration as JSON
5. Visual validation of threshold ordering
6. Bulk configuration for all courses in semester

## Files Modified/Created

### Backend

-   ✅ `docs/db.sql` - Updated schema
-   ✅ `docs/migrations/001_add_attainment_config.sql` - Migration script
-   ✅ `api/models/Course.php` - Added threshold fields
-   ✅ `api/models/CourseRepository.php` - Updated queries
-   ✅ `api/models/AttainmentScale.php` - New model
-   ✅ `api/models/AttainmentScaleRepository.php` - New repository
-   ✅ `api/controllers/AttainmentController.php` - New controller
-   ✅ `api/routes/api.php` - Added routes

### Frontend

-   ✅ `frontend/src/services/api.ts` - Added API methods

### Documentation

-   ✅ `docs/ATTAINMENT_CONFIG_FEATURE.md` - This file

## Support

For issues or questions:

1. Check database connectivity
2. Verify JWT token is valid
3. Check browser console for frontend errors
4. Check PHP error logs for backend errors
5. Verify database schema matches expectations
