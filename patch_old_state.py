import os, glob, re

root_dir = r"c:\xampp\htdocs\nba-met4l\api\controllers"

for c_file in glob.glob(os.path.join(root_dir, '*Controller.php')):
    with open(c_file, 'r') as f:
        content = f.read()
        
    original = content

    funcs = re.finditer(r'public function (\w+)\(.*?\{(.*?)(?=\n    public function|\n\})', content, flags=re.DOTALL)
    for m in funcs:
        func_name = m.group(1)
        func_body = m.group(2)
        
        # 1. We ONLY care about updates if we want to trace old state. 
        # But wait, DELETE also uses old values. DELETE passes `$auditPayload` as old values right now. We can be better.
        # Actually, let's look for `$var = $this->xyzRepository->findById(...)` in ANY method.
        
        find = re.search(r'(\$(\w+)\s*=\s*\$this->\w+Repository->findBy\w+\([^)]+\);)', func_body)
        if find:
            full_line = find.group(1)
            var_name = find.group(2)
            
            # Create old state capture line
            capture_line = f"\\1\n            $GLOBALS['audit_old_state'] = (isset(${var_name}) && is_object(${var_name}) && method_exists(${var_name}, 'toArray')) ? ${var_name}->toArray() : (isset(${var_name}) ? clone ${var_name} : null);"
            
            # Replace ONLY the FIRST occurrence of this line in the function body
            new_func_body = func_body.replace(full_line, capture_line, 1)
            
            # 2. Modify the audit service log call in this method
            if 'UPDATE' in func_body or 'UPDATE' in new_func_body:
                new_func_body = re.sub(
                    r"(\$this->auditService->log\('UPDATE',\s*'[^']+',\s*null,\s*)null(\,\s*\$auditPayload\);)",
                    r"\1($GLOBALS['audit_old_state'] ?? null)\2",
                    new_func_body
                )
            
            if 'DELETE' in func_body or 'DELETE' in new_func_body:
                # for delete, the 4th param (old_val) currently is $auditPayload, let's keep $auditPayload or use $GLOBALS
                new_func_body = re.sub(
                    r"(\$this->auditService->log\('DELETE',\s*'[^']+',\s*null,\s*)\$auditPayload(\,\s*null\);)",
                    r"\1($GLOBALS['audit_old_state'] ?? \$auditPayload)\2",
                    new_func_body
                )

            # Replace the body in the whole file
            # Important: Since func_body might have overlapping parts, we just replace it exactly.
            content = content.replace(func_body, new_func_body)

    if content != original:
        with open(c_file, 'w') as f:
            f.write(content)
        print(f"Patched {os.path.basename(c_file)} for old_values")
        
