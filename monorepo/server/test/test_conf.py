import os
import conf

def test_replace_env_vars():
    os.environ["TEST"] = "test"
    os.environ["IT"] = "it"
    test_str = "This {TEST} is {IT}"
    expected_result = "This test is it"
    result = conf._replace_env_vars(test_str)
    assert result == expected_result