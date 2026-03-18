import os, glob, re

root_dir = r"c:\xampp\htdocs\nba-met4l\api\controllers"

for c_file in glob.glob(os.path.join(root_dir, '*Controller.php')):
    with open(c_file, 'r') as f:
        content = f.read()

    funcs = re.finditer(r'public function (update\w+)\(.*?\{(.*?)(?=\n    public function|\n\})', content, flags=re.DOTALL)
    for m in funcs:
        func_name = m.group(1)
        func_body = m.group(2)
        
        find = re.search(r'\$(\w+)\s*=\s*\$this->\w+Repository->findBy\w+\([^)]+\);', func_body)
        if find:
            var_name = find.group(1)
            print(f'{func_name} in {os.path.basename(c_file)} uses ${var_name}')
        else:
            print(f'{func_name} in {os.path.basename(c_file)}: could not find repository fetch')

