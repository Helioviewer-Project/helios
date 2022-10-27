sources = {
"EIT_171" : 0,
"EIT_195" : 1,
"EIT_284" : 2,
"EIT_304" : 3,
"LASCO_C2" : 4,
"LASCO_C3" : 5,
"MDI_MAG" : 6,
"MDI_INT" : 7,
"AIA_94" : 8,
"AIA_131" : 9,
"AIA_171" : 10,
"AIA_193" : 11,
"AIA_211" : 12,
"AIA_304" : 13,
"AIA_335" : 14,
"AIA_1600" : 15,
"AIA_1700" : 16,
"AIA_4500" : 17,
"HMI_INT" : 18,
"HMI_MAG" : 19,
"EUVI_A_171" : 20,
"EUVI_A_195" : 21,
"EUVI_A_284" : 22,
"EUVI_A_304" : 23,
"EUVI_B_171" : 24,
"EUVI_B_195" : 25,
"EUVI_B_284" : 26,
"EUVI_B_304" : 27,
"COR1_A" : 28,
"COR2_A" : 29,
"COR1_B" : 30,
"COR2_B" : 31,
"SWAP_174" : 32,
"SXT_ALMGMN" : 33,
"SXT_THIN_AL" : 34,
"SXT_WHITE_LIGHT" : 35,
"XRT_AL_MED_AL_MESH" : 38,
"XRT_AL_MED_AL_THICK" : 39,
"XRT_AL_MED_BE_THICK" : 40,
"XRT_AL_MED_GBAND" : 41,
"XRT_AL_MED_OPEN" : 42,
"XRT_AL_MED_TI_POLY" : 43,
"XRT_AL_POLY_AL_mesh" : 44,
"XRT_AL_POLY_AL_THICK" : 45,
"XRT_AL_POLY_BE_THICK" : 46,
"XRT_AL_POLY_GBAND" : 47,
"XRT_AL_POLY_OPEN" : 48,
"XRT_AL_POLY_TI_POLY" : 49,
"XRT_BE_MED_AL_MESH" : 50,
"XRT_BE_MED_AL_THICK" : 51,
"XRT_BE_MED_BE_THICK" : 52,
"XRT_BE_MED_GBAND" : 53,
"XRT_BE_MED_OPEN" : 54,
"XRT_BE_MED_TI_POLY" : 55,
"XRT_BE_THIN_AL_MESH" : 56,
"XRT_BE_THIN_AL_THICK" : 57,
"XRT_BE_THIN_BE_THICK" : 58,
"XRT_BE_THIN_GBAND" : 59,
"XRT_BE_THIN_OPEN" : 60,
"XRT_BE_THIN_TI_POLY" : 61,
"XRT_C_POLY_AL_MESH" : 62,
"XRT_C_POLY_AL_THICK" : 63,
"XRT_C_POLY_BE_THICK" : 64,
"XRT_C_POLY_GBAND" : 65,
"XRT_C_POLY_OPEN" : 66,
"XRT_C_POLY_TI_POLY" : 67,
"XRT_MISPOSITIONED_MISPOSITIONED" : 68,
"XRT_OPEN_AL_MESH" : 69,
"XRT_OPEN_AL_THICK" : 70,
"XRT_OPEN_BE_THICK" : 71,
"XRT_OPEN_GBAND" : 72,
"XRT_OPEN_OPEN" : 73,
"XRT_OPEN_TI_POLY" : 74,
"TRACE_171" : 75,
"TRACE_195" : 76,
"TRACE_284" : 77,
"TRACE_1216" : 78,
"TRACE_1550" : 79,
"TRACE_1600" : 80,
"TRACE_1700" : 81,
"TRACE_WHITE_LIGHT" : 82,
"COSMO_KCOR" : 83,
"EUI_FSI_174" : 84,
"EUI_FSI_304" : 85,
"EUI_HRI_174" : 86,
"EUI_HRI_1216" : 87,
"SUVI_94" : 88,
"SUVI_131" : 89,
"SUVI_171" : 90,
"SUVI_195" : 91,
"SUVI_284" : 92,
"SUVI_304" : 93,
"XRT_ANY_ANY" : 10001,
"XRT_ANY_AL_MESH" : 10002,
"XRT_ANY_AL_THICK" : 10003,
"XRT_ANY_BE_THICK" : 10004,
"XRT_ANY_GBAND" : 10005,
"XRT_ANY_OPEN" : 10006,
"XRT_ANY_TI_POLY" : 10007,
"XRT_AL_MED_ANY" : 10008,
"XRT_AL_POLY_ANY" : 10009,
"XRT_BE_MED_ANY" : 10010,
"XRT_BE_THIN_ANY" : 10011,
"XRT_C_POLY_ANY" : 10012,
"XRT_OPEN_ANY" : 10013
}

def find_sourceid(instrument):
    needle = instrument.upper()
    for source in sources:
        if instrument in source:
            return sources[source]
    return None
