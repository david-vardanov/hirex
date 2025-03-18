#!/bin/bash

echo "Script started with arguments: $@"

# Define the output directory and files
OUTPUT_DIR="extracted"
MINIFIED_OUTPUT_FILE="$OUTPUT_DIR/output.minified.txt"
TREE_OUTPUT_FILE="$OUTPUT_DIR/output.tree.txt"

echo "Output directory: $OUTPUT_DIR"
echo "Minified output file: $MINIFIED_OUTPUT_FILE"
echo "Tree output file: $TREE_OUTPUT_FILE"

# Create the output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"
echo "Created output directory (if it didn't exist)"

# Function to check if a path is ignored by git or should be excluded
should_exclude() {
    local path="$1"
    local base_name=$(basename "$path")
    
    # List of directories to always exclude
    local exclude_list=(".git" "node_modules" ".vscode" ".idea")
    
    for exclude in "${exclude_list[@]}"; do
        if [[ "$base_name" == "$exclude" ]]; then
            return 0  # Should exclude
        fi
    done
    
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        git check-ignore -q "$path"
        return $?  # Return git check-ignore result
    else
        return 1  # Not in a git repository, don't exclude
    fi
}

# Function to extract and minify files
extract_minified() {
    echo "Starting minification process..."
    
    > "$MINIFIED_OUTPUT_FILE"
    echo "Cleared existing output file: $MINIFIED_OUTPUT_FILE"

    local file_count=0
    local total_bytes=0

    for path in "$@"; do
        echo "Processing path: $path"
        
        if [ -d "$path" ]; then
            echo "$path is a directory"
            while IFS= read -r file; do
                echo "Found file: $file"
                if ! should_exclude "$file"; then
                    echo "Processing file: $file"
                    echo "// $file" >> "$MINIFIED_OUTPUT_FILE"
                    local file_content=$(sed '/^\s*\/\//d;/^\s*$/d' "$file" | tr -d '\n' | sed 's/\s\+/ /g')
                    echo "$file_content" >> "$MINIFIED_OUTPUT_FILE"
                    echo -e "\n" >> "$MINIFIED_OUTPUT_FILE"
                    ((file_count++))
                    total_bytes=$((total_bytes + ${#file_content}))
                else
                    echo "Skipping excluded file: $file"
                fi
            done < <(find "$path" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.vue" \))
        elif [ -f "$path" ] && ! should_exclude "$path"; then
            echo "Processing file: $path"
            echo "// $path" >> "$MINIFIED_OUTPUT_FILE"
            local file_content=$(sed '/^\s*\/\//d;/^\s*$/d' "$path" | tr -d '\n' | sed 's/\s\+/ /g')
            echo "$file_content" >> "$MINIFIED_OUTPUT_FILE"
            echo -e "\n" >> "$MINIFIED_OUTPUT_FILE"
            ((file_count++))
            total_bytes=$((total_bytes + ${#file_content}))
        else
            echo "Skipping excluded or invalid path: $path"
        fi
    done

    echo "Minification complete. Output written to $MINIFIED_OUTPUT_FILE."
    echo "Number of files processed: $file_count"
    echo "Total bytes written: $total_bytes"
    echo "Contents of $MINIFIED_OUTPUT_FILE:"
    cat "$MINIFIED_OUTPUT_FILE"
}

# Function to create a pretty tree structure with file names
create_pretty_tree() {
    local directory="$1"
    local prefix=""
    local output=""

    create_tree_recursive() {
        local dir="$1"
        local prefix="$2"
        local dirs=()
        local files=()

        # Read directory contents
        while IFS= read -r -d $'\0' entry; do
            if ! should_exclude "$entry"; then
                if [ -d "$entry" ]; then
                    dirs+=("$entry")
                else
                    files+=("$(basename "$entry")")
                fi
            fi
        done < <(find "$dir" -maxdepth 1 -mindepth 1 -print0 | sort -z)

        # Process directories
        local i=0
        for subdir in "${dirs[@]}"; do
            local name=$(basename "$subdir")
            if [ $((i+1)) -eq ${#dirs[@]} ] && [ ${#files[@]} -eq 0 ]; then
                output+="${prefix}└── ${name}/\n"
                create_tree_recursive "$subdir" "${prefix}    "
            else
                output+="${prefix}├── ${name}/\n"
                create_tree_recursive "$subdir" "${prefix}│   "
            fi
            ((i++))
        done

        # Process files
        if [ ${#files[@]} -gt 0 ]; then
            local file_list=$(IFS=' '; echo "${files[*]}")
            output+="${prefix}${file_list}\n"
        fi
    }

    create_tree_recursive "$directory" ""

    echo -e "$output"
}

# Function to extract directory structure with file names
extract_tree() {
    # Clear the tree output file if it exists
    > "$TREE_OUTPUT_FILE"

    # Loop over each provided argument
    for path in "$@"; do
        # Check if the path is a directory and not excluded
        if [ -d "$path" ] && ! should_exclude "$path"; then
            echo "Processing directory: $path"
            
            # Create and save the pretty tree structure with file names
            create_pretty_tree "$path" > "$TREE_OUTPUT_FILE"

            # Show the contents of the output file
            echo "Contents of $TREE_OUTPUT_FILE:"
            cat "$TREE_OUTPUT_FILE"
        else
            echo "Skipping excluded or invalid path: $path"
        fi
    done

    echo "Directory structure extraction with file names complete. Output written to $TREE_OUTPUT_FILE."
}

# Determine the mode of operation based on the first argument
if [ "$1" == "extract-tree" ]; then
    MODE="extract-tree"
    shift
else
    MODE="extract"
fi

echo "Operating mode: $MODE"

if [ "$MODE" == "extract-tree" ]; then
    extract_tree "$@"
else
    extract_minified "$@"
fi