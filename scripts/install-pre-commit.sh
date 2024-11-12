#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

echo "Running install script..."

# Indepenent variables
do_copy=
file_name="pre-commit-fix"
overwrite="n"
target_command="pre-commit"
target_path=

# Dependent variables
base_dir="$(pwd)"
hook_base_path="$base_dir/.git/hooks/"
source_location="$base_dir/.github/hooks/$file_name"
target_path="$hook_base_path$target_command"

# Main code
if [ -f "$target_path" ]; then
  echo "$target_command hook already exists..."
  read -rp "Overwrite? (yN) " overwrite

  if test "$overwrite" = "y"; then
    do_copy="1"
  fi;
else
  do_copy="1"
fi

if test -n "$do_copy"; then
  echo "Writing hook to $target_path..."
  cp "$source_location" "$target_path"
else
  echo "Skipping write"
fi

echo "Done!"
