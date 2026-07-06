import os
import sys

# Reconfigure stdout to use UTF-8 to support Unicode box-drawing characters on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def print_tree(start_path, exclude_dirs=None):
    """
    Recursively prints the directory tree starting from start_path,
    excluding directories specified in exclude_dirs.
    """
    if exclude_dirs is None:
        exclude_dirs = {'node_modules', 'venv', 'dist', '.git', '__pycache__'}
    
    start_path = os.path.abspath(start_path)
    print(f"Project Tree for: {start_path}")
    print("=" * 60)
    
    def _walk_tree(dir_path, prefix=""):
        try:
            items = sorted(os.listdir(dir_path))
        except PermissionError:
            print(f"{prefix}├── [Permission Denied]")
            return

        # Filter out directories that we want to exclude
        filtered_items = []
        for item in items:
            full_path = os.path.join(dir_path, item)
            if os.path.isdir(full_path) and item in exclude_dirs:
                continue
            filtered_items.append(item)

        count = len(filtered_items)
        for i, item in enumerate(filtered_items):
            full_path = os.path.join(dir_path, item)
            is_last = (i == count - 1)
            connector = "└── " if is_last else "├── "
            
            print(f"{prefix}{connector}{item}")
            
            if os.path.isdir(full_path):
                new_prefix = prefix + ("    " if is_last else "│   ")
                _walk_tree(full_path, new_prefix)

    _walk_tree(start_path)

if __name__ == "__main__":
    # Allow target directory as an optional command line argument
    target_directory = sys.argv[1] if len(sys.argv) > 1 else "."
    
    # Exclude directories specified by the user + common ignore dirs
    exclusions = {'node_modules', 'venv', 'dist', '.git', '__pycache__'}
    
    print_tree(target_directory, exclusions)
