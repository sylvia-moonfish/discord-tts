#!/bin/sh

if [ -d ".venv" ]; then
  echo "Activate venv..."
  . .venv/bin/activate
else
  echo "Create venv..."
  requirements_file="requirements.txt"

  python -m venv .venv
  . .venv/bin/activate

  # Check if required packages are installed and install them if not
  if [ -f "${requirements_file}" ]; then
    installed_packages=$(python -m pip freeze)
    while IFS= read -r package; do
      expr "${package}" : "^#.*" > /dev/null && continue
      package_name=$(echo "${package}" | sed 's/[<>=!].*//')
      if ! echo "${installed_packages}" | grep -q "${package_name}"; then
        echo "${package_name} not found. Attempting to install..."
        python -m pip install --upgrade "${package}"
      fi
    done < "${requirements_file}"
  else
    echo "${requirements_file} not found. Please ensure the requirements file with required packages exists."
    exit 1
  fi
fi

# Run the main script
python infer-web.py
