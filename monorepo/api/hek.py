# RawTextHelpFormatter allows PROGRAM_DESCRIPTION to be a multiline str.
# Without passing this to argparse, it will print PROGRAM_DESCRIPTION to stdout all on one line even if it has newline characters.
from argparse import RawTextHelpFormatter
from argparse import ArgumentParser
from sunpy.net import attrs as a, Fido

# This is passed to ArgumentParser's "description."
# It is the information printed before the accepted arguments when you run the script with "-h/--help"
PROGRAM_DESCRIPTION = "Query the HEK for event data"

# Set arguments to be passed to parser.add_argument here.
# Format is ([positional_args], {keyword_args: value})
# Each row is equivalent to argparse.add_argument(positional_args, key1=value1, key2=value2, etcetera)
PROGRAM_ARGS = [
    (["start_time"], {'type': str, 'help': "Beginning of time range to query"}),
    (["end_time"], {'type': str, 'help': "End of time range to query"}),
]

def query_hek(start_time, end_time):
    return Fido.search(a.Time(start_time, end_time), a.hek.EventType("**"))[0]

# All args passed in will be passed as keyword args to main.
def main(start_time, end_time):
    results = query_hek(start_time, end_time)
    for result in results:
        print(result["kb_archivid"])

# Reference: https://docs.python.org/3/library/argparse.html
# This is the part you've probably typed out a million times and had to check the reference for it every single time.
def parse_args():
    parser = ArgumentParser(description=PROGRAM_DESCRIPTION, formatter_class=RawTextHelpFormatter)
    for args in PROGRAM_ARGS:
        parser.add_argument(*args[0], **args[1])
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    main(**vars(args))
