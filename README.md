# Discord TTS Backend

This backend consists of a Flask-based API and modified versions of two github open source projects:

- [myshell-ai/MeloTTS](https://github.com/myshell-ai/meloTTS)
- [RVC-Project/Retrieval-based-Voice-Conversion-WebUI](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI)

## Changes made on projects

### MeloTTS

> `requirements.txt:line 31`
> ```
> botocore==1.34.88
> ```
> This line was added to resolve the dependency error that happens with `cached_path`.

> `melo/text/korean.py:line 20`
> ```
> text = normalize_with_dictionary(text, english_dictionary)
> ```
> This line was added to read out any english alphabet characters in the string instead of omitting them.

### RVC

> `run.sh:line 3-7`
> ```
> if [ "$(uname)" = "Darwin" ]; then
>   # macOS specific env:
>   export PYTORCH_ENABLE_MPS_FALLBACK=1
>   export PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0
> fi
> ```
> These lines have been removed.

> `run.sh:line 16-28`
> ```
> # Check if Python 3.8 is installed
> if ! command -v python3.8 >/dev/null 2>&1 || pyenv versions --bare | grep -q "3.8"; then
>   echo "Python 3 not found. Attempting to install 3.8..."
> ...
>       exit 1
>   fi
> fi
> ```
> These lines have been removed.

> `run.sh`
> 
> All lines with `python3.8` are replaced with `python` and `--pycmd python3` is removed.

## Initial Setup

This project has been developed mainly under the following environment:
- Ubuntu 24.04 LTS
- Python 3.9.19

Install and set up [Anaconda](https://www.anaconda.com).

1. `conda create -n tts python=3.9`
2. `conda activate tts` (This has to be done every time a new terminal is opened.)
3. Check the python version (i.e. `python --version`) to make sure the version is correct (3.9.19).

### MeloTTS

1. `cd melotts`
2. `pip install -e .`
3. `python -m unidic download`

Run the test script `test-melotts.py` under root to test the installation.

### RVC

1. `cd rvc`
2. `./run.sh`

Verify that the Web UI starts up with no errors.