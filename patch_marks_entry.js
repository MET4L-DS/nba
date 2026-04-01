const fs = require("fs");
const path = require("path");

const filePath = path.join(
	__dirname,
	"frontend/src/features/marks/MarksEntryByCO.tsx",
);
let content = fs.readFileSync(filePath, "utf8");

// 1. Convert state to derived state
content = content.replace(
	/const \[invalidCells, setInvalidCells\] = useState<Set<string>>\(new Set\(\)\);/,
	`const invalidCells = useMemo(() => {
        const next = new Set<string>();
        if (!validateMarks) return next;
        Object.entries(marks).forEach(([rollno, row]) => {
            CO_KEYS.forEach(co => {
                const value = row[co];
                if (!value || value.trim() === "") return;
                const num = parseFloat(value);
                if (isNaN(num) || num < 0 || (coMaxMarks[co] > 0 && num > coMaxMarks[co])) {
                    next.add(\`\${rollno}:\${co}\`);
                }
            });
        });
        return next;
    }, [marks, validateMarks, coMaxMarks]);`,
);

// 2. Remove `setInvalidCells(new Set());` in loadData
content = content.replace(/setInvalidCells\(new Set\(\)\);\n?/g, "");

// 3. Remove `setInvalidCells(...)` block in handleMarkChange
// We find the block from setInvalidCells((prev) => { ... }) up to the next blank newline.
const handleMarkChangeRegex =
	/const cellKey = `\$\{rollno\}:\$\{co\}`;[\s\S]*?setInvalidCells\(\(prev\) => \{[\s\S]*?return next;\n\s*\}\);\n/g;
content = content.replace(handleMarkChangeRegex, "");

// 4. Update handleSubmit's api payload
content = content.replace(
	/await apiService\.saveMarksByCO\(\{([\s\S]*?)CO6: row\.CO6\.trim\(\) !== "" \? parseFloat\(row\.CO6\) \|\| 0 : 0,\n\s*\}\);/g,
	`await apiService.saveMarksByCO({$1CO6: row.CO6.trim() !== "" ? parseFloat(row.CO6) || 0 : 0,\n                                        validate_marks: validateMarks,\n                                });`,
);

// 5. In handleFileUpload, it manually updates invalidCells, let's remove that.
const handleFileUploadRegex =
	/const newInvalid = new Set<string>\(\);[\s\S]*?setInvalidCells\(newInvalid\);\n/g;
content = content.replace(handleFileUploadRegex, "");

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched MarksEntryByCO.tsx successfully");
