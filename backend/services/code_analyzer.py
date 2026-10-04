import os
from pathlib import Path


ALLOWED_EXTENSIONS = {
    ".py",
    ".cpp",
    ".c",
    ".h",
    ".hpp",
    ".java",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".sql",
    ".go",
    ".rs",
    ".php",
    ".rb"
}


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def is_supported_file(filename: str) -> bool:
    extension = get_file_extension(filename)
    return extension in ALLOWED_EXTENSIONS


def read_code_file(file_path: str) -> str:
    if not os.path.exists(file_path):
        raise FileNotFoundError("Code file was not found.")

    extension = get_file_extension(file_path)

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {extension}")

    try:
        with open(
            file_path,
            "r",
            encoding="utf-8",
            errors="replace"
        ) as file:
            return file.read()

    except Exception as e:
        raise RuntimeError(
            f"Unable to read code file: {str(e)}"
        )


def build_code_analysis_prompt(
    action: str,
    filename: str,
    code: str
) -> str:
    prompt = (
        "Analyze the following source code.\n\n"
        f"File name:\n{filename}\n\n"
        f"Requested action:\n{action}\n\n"
        "Source code:\n\n"
        "```text\n"
        f"{code}\n"
        "```\n\n"
        "Perform the requested action carefully.\n\n"
        "If the action is generate, generate or improve the requested code.\n"
        "If the action is explain, explain the code clearly.\n"
        "If the action is debug, identify bugs and explain their causes.\n"
        "If the action is fix, provide corrected working code.\n"
        "If the action is review, perform a detailed code review.\n"
        "If the action is optimize, improve performance and code quality.\n\n"
        "Do not expose API keys, passwords, tokens or other secrets."
    )

    return prompt