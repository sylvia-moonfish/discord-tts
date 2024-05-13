# Discord TTS Backend

This backend consists of a Flask-based API and modified versions of two github open source projects:

- [myshell-ai/MeloTTS](https://github.com/myshell-ai/meloTTS)
- [RVC-Project/Retrieval-based-Voice-Conversion-WebUI](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI)

## Changes made on projects

### MeloTTS

> `requirements.txt:line 31`
>
> ```
> botocore==1.34.88
> ```
>
> This line was added to resolve the dependency error that happens with `cached_path`.

> `melo/text/korean.py:line 20`
>
> ```
> text = normalize_with_dictionary(text, english_dictionary)
> ```
>
> This line was added to read out any english alphabet characters in the string instead of omitting them.

### RVC

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
2. `pip install -r "requirements.txt"`

Run the web UI `python infer-web.py` to test the installation.

### Flask API

1. `pip install -r "requirements.txt"`

## Running the server

1. `flask run`
