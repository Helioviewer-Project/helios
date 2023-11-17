"""
Importing this package will modify the builtin json.dump/dumps to be able
to serialize data classes.
"""

import json

_dump = json.dump
_dumps = json.dumps

def encode(encode_fn, obj, *args, **kwargs):
    try:
        return encode_fn(obj, *args, **kwargs)
    except TypeError:
        import pdb; pdb.set_trace()
        return encode_fn(vars(obj), *args, **kwargs)

def dump(obj, *args, **kwargs):
    return encode(_dump, obj, *args, **kwargs)

def dumps(obj, *args, **kwargs):
    return encode(_dumps, obj, *args, **kwargs)

json.dump = dump
json.dumps = dumps