# PFSS
This PFSS program is built on [pfsspy](https://pfsspy.readthedocs.io/en/stable/index.html).

pfsspy is used to generate PFSS lines for use with Helios.
The general flow for generating field lines is:
1. Download GONG data with [Fido](https://docs.sunpy.org/en/stable/generated/api/sunpy.net.Fido.html)
2. Trace field lines with pfsspy. See `LinePlotterGong.py:trace_lines` for parameters passed to pfsspy.
3. Extract field lines from pfsspy object into Helios coordinates (HGS with coordinate frame date 2018-08-11 00:00:00).
4. Write out extracted field lines into a binary format. Readable with `pfss.py:LoadPfss`
