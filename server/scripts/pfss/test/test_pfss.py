from datetime import datetime, timezone
from scripts.pfss.pfss import PFSS, PFSSLine, LoadPfss

def test_save_load_pfss():
    fake_line = PFSSLine(
        0, [1.0, 2.0, 3.0], [1.0, 2.0, 3.0], [1.0, 2.0, 3.0], [1.0, 2.0, 3.0]
    )
    fake_pfss = PFSS(datetime.now(tz=timezone.utc), [fake_line])
    fake_pfss.save("test_pfss.bin")
    loaded_pfss = LoadPfss("test_pfss.bin")
    date_fmt = "%Y-%m-%d %H:%M:%S"
    assert fake_pfss.date.strftime(date_fmt) == loaded_pfss.date.strftime(date_fmt)
    assert fake_pfss.lines == loaded_pfss.lines