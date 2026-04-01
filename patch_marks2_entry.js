const fs = require("fs");
const path = require("path");

const filePath = path.join(
	__dirname,
	"frontend/src/features/marks/MarksEntryByCO.tsx",
);
let content = fs.readFileSync(filePath, "utf8");

// 1. Add useMemo to imports if not there
if (content.includes("import { useState, useEffect, useRef, Fragment }")) {
	content = content.replace(
		"import { useState, useEffect, useRef, Fragment }",
		"import { useState, useEffect, useRef, Fragment, useMemo }",
	);
}

// 2. Replace useState declaration with useMemo
const useStateDeclaration = `\tconst [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());`;
const useMemoReplacement = `\tconst invalidCells = useMemo(() => {
\t\tconst next = new Set<string>();
\t\tif (!validateMarks) return next;
\t\tObject.entries(marks).forEach(([rollno, row]) => {
\t\t\tCO_KEYS.forEach(co => {
\t\t\t\tconst value = row[co];
\t\t\t\tif (!value || value.trim() === "") return;
\t\t\t\tconst num = parseFloat(value);
\t\t\t\tif (isNaN(num) || num < 0 || (coMaxMarks[co] > 0 && num > coMaxMarks[co])) {
\t\t\t\t\tnext.add(\`\${rollno}:\${co}\`);
\t\t\t\t}
\t\t\t});
\t\t});
\t\treturn next;
\t}, [marks, validateMarks, coMaxMarks]);`;
content = content.replace(useStateDeclaration, useMemoReplacement);

// 3. Remove setInvalidCells(new Set());
content = content.replace(/\t\t\tsetInvalidCells\(new Set\(\)\);\n/g, "");

// 4. Remove setInvalidCells block in handleMarkChange
const handleMarkChangeBlock = `\t\tconst cellKey = \`\${rollno}:\${co}\`;
\t\tsetInvalidCells((prev) => {
\t\t\tconst next = new Set(prev);
\t\t\tif (isCellInvalid(co, value)) {
\t\t\t\tnext.add(cellKey);
\t\t\t} else {
\t\t\t\tnext.delete(cellKey);
\t\t\t}
\t\t\treturn next;
\t\t});`;
content = content.replace(handleMarkChangeBlock, ""); // optionally we can leave cellKey but it's unneeded. Actually let's just make it broader:
content = content.replace(
	/\t\tconst cellKey = `\$\{rollno\}:\$\{co\}`;[\s\S]*?return next;\n\t\t\}\);\n/g,
	"",
);

// 5. Remove setInvalidCells block in handleFileUpload
const handleFileUploadBlock = `\t\t\tconst newInvalid = new Set<string>();
\t\t\tObject.entries(newMarks).forEach(([rollno, row]) => {
\t\t\t\tCO_KEYS.forEach((co) => {
\t\t\t\t\tif (isCellInvalid(co, row[co]))
\t\t\t\t\t\tnewInvalid.add(\`\${rollno}:\${co}\`);
\t\t\t\t});
\t\t\t});
\t\t\tsetInvalidCells(newInvalid);`;
content = content.replace(handleFileUploadBlock, "");

// 6. Update API payload to include validate_marks
const apiPayload = `await apiService.saveMarksByCO({
\t\t\t\t\ttest_id: test.id,
\t\t\t\t\tstudent_id: rollno,
\t\t\t\t\tCO1: row.CO1.trim() !== "" ? parseFloat(row.CO1) || 0 : 0,
\t\t\t\t\tCO2: row.CO2.trim() !== "" ? parseFloat(row.CO2) || 0 : 0,
\t\t\t\t\tCO3: row.CO3.trim() !== "" ? parseFloat(row.CO3) || 0 : 0,
\t\t\t\t\tCO4: row.CO4.trim() !== "" ? parseFloat(row.CO4) || 0 : 0,
\t\t\t\t\tCO5: row.CO5.trim() !== "" ? parseFloat(row.CO5) || 0 : 0,
\t\t\t\t\tCO6: row.CO6.trim() !== "" ? parseFloat(row.CO6) || 0 : 0,
\t\t\t\t});`;
const apiPayloadReplacement = `await apiService.saveMarksByCO({
\t\t\t\t\ttest_id: test.id,
\t\t\t\t\tstudent_id: rollno,
\t\t\t\t\tCO1: row.CO1.trim() !== "" ? parseFloat(row.CO1) || 0 : 0,
\t\t\t\t\tCO2: row.CO2.trim() !== "" ? parseFloat(row.CO2) || 0 : 0,
\t\t\t\t\tCO3: row.CO3.trim() !== "" ? parseFloat(row.CO3) || 0 : 0,
\t\t\t\t\tCO4: row.CO4.trim() !== "" ? parseFloat(row.CO4) || 0 : 0,
\t\t\t\t\tCO5: row.CO5.trim() !== "" ? parseFloat(row.CO5) || 0 : 0,
\t\t\t\t\tCO6: row.CO6.trim() !== "" ? parseFloat(row.CO6) || 0 : 0,
\t\t\t\t\tvalidate_marks: validateMarks,
\t\t\t\t});`;
content = content.replace(apiPayload, apiPayloadReplacement);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched MarksEntryByCO.tsx successfully");
