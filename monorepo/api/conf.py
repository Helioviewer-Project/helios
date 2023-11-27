"""
Interface for getting application configuration variables.

This configuration first looks at CONFIG_FILE_PATH for the ini file.
If there's no CONFIG_FILE_PATH in the environment, then it looks for config.ini.
If there's no config.ini, then the default config.example.ini is used.
"""
import os
import re
from configparser import ConfigParser

# Select the config file to use.
# Order is environment CONFIG_FILE_PATH
# Then look for config.ini
# Then default to config.example.ini
_parser = ConfigParser()
if "CONFIG_FILE_PATH" in os.environ:
    print("Reading config from environment")
    print(f"Config path: {os.environ['CONFIG_FILE_PATH']}")
    _parser.read(os.environ["CONFIG_FILE_PATH"])
elif os.path.exists("config.ini"):
    print("Reading config from config.ini")
    _parser.read("config.ini")
else:
    print("Reading config from config.example.ini")
    _parser.read("config.example.ini")


def _replace_env_vars(text: str) -> str:
    """
    Replaces text wrapped in {} with values in the system environment.
    For example, if the environment has some value VAR=example, then the string
    "Environment Example: {VAR}" will become "Environment Example: example

    Parameters
    ----------
    text: `str`
        Text to insert environment variables into.
    """
    for match in re.finditer("({\\w+})", text):
        text_var = match.group(0)
        env_var = text_var.replace("{", "").replace("}", "")
        text = text.replace(text_var, os.environ[env_var])
    return text

def get(section: str, key: str) -> str:
    """
    Returns a value from the config.ini file

    Parameters
    ----------
    section: `str`
        Section of the ini file to read from.
    key: `str`
        Configuration key to get the value of.
    """
    return _replace_env_vars(_parser[section][key])