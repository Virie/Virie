// Copyright (c) 2014, The Monero Project
// 
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
// 
// 1. Redistributions of source code must retain the above copyright notice, this list of
//    conditions and the following disclaimer.
// 
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//    of conditions and the following disclaimer in the documentation and/or other
//    materials provided with the distribution.
// 
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//    used to endorse or promote products derived from this software without specific
//    prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/*
 * This file and its cpp file are for translating Electrum-style word lists
 * into their equivalent byte representations for cross-compatibility with
 * that method of "backing up" one's wallet keys.
 */
 // Copyright (c) 2014-2020 The Virie Project

#include <cassert>
#include <cstdint>
#include <boost/algorithm/string.hpp>
#include <cstdlib>
#include "mnemonic-encoding.h"


namespace tools
{
  namespace mnemonic_encoding
  {
    using namespace std;

    const int NUMWORDS = 1626;

    const uint32_t words_indexes[] = {
      381,  19,   251,  1087, 560,  1175, 570,  1557, 225,  310,  956,  663,  863,  1088, 932,  1111, 1247, 1323, 318,  93,
      1405, 42,   200,  373,  1558, 933,  864,  1450, 180,  1451, 376,  541,  256,  86,   252,  264,  436,  1452, 483,  29,
      617,  800,  957,  295,  447,  495,  681,  1033, 115,  296,  125,  258,  357,  161,  507,  1361, 265,  1324, 618,  1176,
      1248, 1112, 1284, 53,   1285, 1453, 651,  595,  1559, 1142, 74,   891,  1013, 958,  612,  1508, 1249, 959,  1014, 1015,
      1454, 21,   1560, 1143, 297,  16,   934,  1177, 484,  935,  1250, 783,  613,  638,  1286, 469,  1251, 1406, 1455, 170,
      267,  604,  212,  1362, 1144, 45,   66,   530,  272,  214,  1212, 126,  1456, 90,   1561, 682,  1509, 340,  716,  124,
      113,  202,  485,  1363, 350,  784,  960,  363,  614,  837,  142,  801,  508,  1145, 838,  418,  1562, 704,  332,  1089,
      1213, 865,  802,  172,  1364, 1064, 1325, 431,  196,  1034, 1563, 1146, 1035, 91,   1510, 876,  1113, 444,  374,  1178,
      619,  253,  732,  639,  733,  892,  1326, 936,  1252, 672,  1407, 571,  961,  1457, 1036, 1114, 137,  1090, 198,  244,
      534,  1327, 298,  207,  664,  173,  259,  475,  1091, 683,  1408, 476,  1016, 1065, 1287, 1365, 153,  1115, 866,  914,
      1409, 937,  1147, 851,  755,  548,  138,  1116, 1214, 1511, 1253, 1148, 1366, 1149, 867,  377,  1254, 820,  385,  419,
      154,  1288, 1458, 1066, 893,  1410, 1512, 756,  665,  311,  117,  1564, 1017, 705,  1328, 1565, 1067, 496,  1215, 1459,
      426,  283,  1179, 315,  673,  1411, 962,  578,  620,  510,  769,  821,  652,  587,  822,  448,  1216, 692,  420,  346,
      1037, 1513, 706,  1038, 852,  94,   803,  674,  347,  1460, 1217, 986,  1117, 122,  1255, 1180, 823,  254,  460,  1218,
      1566, 1514, 1567, 1367, 1150, 693,  621,  1368, 1412, 1461, 542,  1256, 1039, 1462, 894,  987,  1092, 684,  868,  453,
      454,  757,  1289, 328,  963,  393,  1068, 1290, 694,  511,  1093, 1291, 388,  1118, 323,  1568, 410,  1151, 717,  1018,
      734,  561,  1569, 640,  437,  1257, 1515, 497,  804,  1094, 1119, 1219, 440,  735,  770,  1329, 645,  44,   1220, 771,
      785,  512,  1369, 1095, 938,  299,  432,  1463, 379,  199,  1570, 129,  245,  1069, 1516, 758,  622,  685,  1571, 666,
      261,  169,  1370, 371,  1330, 139,  1152, 1371, 1572, 1573, 1517, 1221, 1181, 772,  805,  1574, 964,  1182, 869,  1331,
      1372, 1120, 628,  394,  1413, 1019, 1575, 1332, 870,  1576, 572,  1518, 853,  1577, 1414, 1096, 227,  1333, 1292, 988,
      824,  786,  825,  522,  1153, 1464, 1519, 596,  871,  839,  455,  1222, 1415, 140,  1334, 1373, 579,  1258, 12,   1154,
      1520, 1521, 695,  1416, 1155, 58,   1374, 441,  513,  402,  337,  1375, 303,  989,  806,  1522, 965,  414,  1578, 1523,
      1417, 877,  1097, 1070, 477,  1579, 1376, 98,   1465, 854,  247,  878,  333,  236,  514,  456,  1156, 990,  588,  1580,
      421,  344,  1098, 293,  50,   646,  759,  915,  1581, 543,  155,  707,  1157, 1466, 378,  966,  1467, 991,  807,  26,
      1377, 1183, 47,   1524, 562,  165,  79,   1468, 840,  442,  939,  1582, 544,  787,  563,  1223, 629,  773,  916,  940,
      1583, 1224, 1469, 11,   312,  263,  489,  1184, 1158, 696,  855,  941,  213,  1470, 856,  445,  218,  647,  667,  111,
      1525, 1259, 605,  220,  1418, 348,  535,  515,  150,  433,  223,  68,   279,  597,  230,  110,  589,  1040, 536,  736,
      1471, 590,  1378, 841,  895,  606,  1379, 992,  1335, 1472, 490,  993,  242,  308,  545,  1121, 201,  967,  1584, 1225,
      942,  304,  523,  1226, 1071, 329,  1526, 686,  132,  177,  737,  718,  498,  375,  1527, 1041, 524,  1020, 1473, 1072,
      994,  995,  188,  774,  1585, 1419, 623,  32,   624,  1528, 1336, 354,  1420, 738,  1122, 968,  1586, 1529, 607,  1474,
      943,  422,  808,  262,  1421, 1530, 996,  826,  1227, 464,  1587, 625,  747,  827,  1159, 668,  1475, 56,   1260, 62,
      461,  997,  580,  1185, 287,  1422, 1476, 1261, 1588, 581,  1186, 102,  116,  71,   389,  1228, 81,   1099, 1160, 1262,
      630,  739,  809,  1123, 1380, 1021, 879,  564,  147,  285,  1161, 516,  411,  1022, 549,  748,  215,  1187, 203,  842,
      1229, 248,  719,  1293, 1589, 1381, 550,  228,  121,  307,  1073, 35,   810,  341,  127,  366,  145,  1074, 1382, 1423,
      1263, 92,   1230, 720,  573,  1590, 268,  15,   1337, 499,  309,  551,  1124, 338,  1125, 100,  38,   896,  478,  486,
      166,  189,  552,  897,  184,  998,  917,  101,  969,  1188, 1100, 1531, 1264, 88,   1424, 1075, 1383, 1023, 880,  302,
      255,  760,  1294, 427,  1338, 1295, 408,  828,  918,  1384, 1425, 1532, 1591, 99,   1296, 382,  531,  1592, 1477, 470,
      1231, 1162, 598,  1042, 599,  600,  1593, 919,  1385, 1594, 898,  1265, 881,  687,  899,  107,  380,  1297, 761,  18,
      1076, 1533, 1043, 648,  1595, 1426, 1163, 509,  1044, 653,  721,  1077, 409,  1045, 1534, 403,  1,    76,   479,  811,
      654,  288,  197,  423,  1596, 167,  1189, 415,  525,  722,  3,    843,  395,  1386, 675,  1190, 224,  1126, 553,  130,
      517,  1478, 1339, 390,  364,  1164, 240,  313,  57,   1298, 59,   386,  416,  1046, 708,  1127, 1340, 1479, 532,  1427,
      0,    1191, 1024, 229,  812,  183,  1165, 206,  48,   438,  28,   10,   740,  788,  1266, 829,  326,  462,  2,    789,
      741,  1299, 830,  608,  1192, 83,   920,  9,    1428, 1535, 105,  1166, 676,  872,  655,  1232, 656,  970,  1233, 149,
      89,   112,  358,  1480, 367,  1387, 709,  186,  368,  1167, 1597, 1429, 1193, 526,  1025, 710,  631,  1078, 192,  1481,
      1047, 762,  54,   171,  383,  457,  1048, 1598, 565,  921,  1599, 1300, 1194, 342,  157,  615,  1388, 790,  458,  284,
      1267, 1536, 20,   281,  1301, 181,  999,  582,  1234, 238,  1128, 711,  43,   1079, 1600, 1195, 900,  1482, 339,  1601,
      61,   901,  1049, 1050, 133,  1389, 1302, 574,  316,  1303, 518,  40,   1304, 1268, 1269, 1305, 1196, 1168, 4,    104,
      176,  324,  46,   632,  1169, 601,  1080, 922,  882,  1483, 487,  669,  63,   269,  923,  844,  670,  1390, 1602, 1391,
      554,  1341, 1603, 65,   533,  537,  260,  72,   13,   123,  1342, 1484, 831,  791,  39,   1051, 7,    351,  37,   97,
      792,  763,  1197, 343,  775,  813,  971,  793,  352,  1485, 434,  677,  742,  175,  657,  151,  300,  1604, 1486, 1487,
      1605, 1081, 480,  330,  1306, 1270, 1430, 1000, 688,  1488, 55,   195,  1307, 972,  446,  211,  1489, 481,  1431, 353,
      1606, 273,  944,  1271, 1308, 973,  764,  974,  73,   1101, 465,  1102, 723,  1001, 1490, 114,  152,  1129, 902,  391,
      1052, 1198, 280,  975,  1491, 794,  678,  776,  1432, 1537, 1053, 1492, 857,  724,  305,  1130, 1493, 1272, 412,  924,
      858,  1607, 814,  925,  832,  697,  845,  405,  349,  1309, 689,  1199, 1054, 626,  396,  1343, 243,  616,  765,  725,
      1608, 210,  1433, 1434, 491,  873,  777,  246,  141,  1344, 583,  270,  658,  463,  345,  1345, 1435, 317,  1200, 846,
      1392, 659,  1131, 1436, 1609, 1610, 591,  1538, 232,  334,  216,  359,  190,  64,   231,  1539, 1103, 883,  164,  945,
      903,  859,  641,  642,  1082, 743,  428,  84,   397,  1310, 847,  1170, 884,  778,  1437, 221,  1346, 331,  726,  1611,
      885,  1132, 1235, 387,  500,  1026, 319,  633,  360,  1311, 976,  355,  335,  1002, 1171, 336,  1236, 1540, 1104, 1612,
      848,  649,  87,   466,  327,  679,  439,  49,   1055, 1393, 1438, 1312, 1439, 1027, 429,  1440, 249,  1441, 1541, 449,
      1542, 1028, 795,  946,  191,  1347, 1613, 1394, 160,  1003, 1273, 320,  417,  1004, 233,  276,  546,  78,   372,  947,
      361,  566,  1348, 1349, 1313, 1029, 1133, 796,  1543, 886,  275,  294,  797,  592,  948,  602,  1442, 860,  1201, 1274,
      977,  1275, 271,  1314, 1105, 609,  1083, 926,  555,  1315, 779,  1202, 108,  398,  575,  904,  135,  1203, 1395, 567,
      1396, 392,  556,  576,  289,  443,  905,  1134, 698,  356,  538,  290,  501,  949,  406,  1350, 627,  1056, 1351, 193,
      1237, 136,  1106, 1135, 187,  1443, 1494, 798,  1544, 978,  234,  217,  906,  237,  41,   369,  660,  1057, 927,  1276,
      450,  1352, 1107, 1316, 1444, 1058, 291,  780,  907,  51,   1108, 887,  492,  120,  67,   208,  527,  424,  250,  158,
      1204, 425,  257,  1136, 103,  163,  502,  209,  503,  749,  1495, 849,  928,  650,  593,  1172, 1614, 471,  1030, 1137,
      1445, 908,  594,  950,  1353, 1615, 1277, 1397, 577,  1205, 96,   162,  85,   781,  131,  1206, 727,  1138, 239,  643,
      22,   1005, 1238, 1496, 1173, 1317, 528,  467,  472,  75,   529,  286,  557,  1616, 782,  584,  1354, 690,  277,  547,
      909,  712,  1497, 1006, 1031, 1498, 1059, 204,  699,  1545, 539,  1239, 929,  728,  951,  1398, 473,  1240, 1278, 146,
      1084, 459,  519,  1499, 750,  1500, 558,  1207, 1617, 1241, 399,  219,  744,  700,  413,  568,  745,  1618, 815,  766,
      833,  671,  194,  1546, 816,  713,  834,  888,  1619, 569,  1355, 24,   488,  1547, 95,   1208, 1318, 1356, 321,  701,
      1548, 702,  746,  1007, 1209, 861,  33,   1501, 1549, 1174, 644,  365,  23,   767,  17,   8,    691,  1620, 25,   14,
      1399, 1242, 52,   36,   634,  1550, 1139, 241,  874,  585,  1621, 27,   1279, 384,  1280, 979,  930,  1400, 1357, 680,
      435,  1109, 6,    451,  314,  226,  889,  143,  586,  559,  452,  31,   1502, 1551, 1060, 1061, 1622, 156,  1243, 400,
      1281, 468,  1062, 1503, 931,  910,  751,  1210, 752,  178,  817,  1032, 1552, 729,  610,  980,  109,  370,  325,  168,
      34,   1446, 1140, 981,  60,   982,  835,  1282, 482,  106,  911,  799,  983,  1211, 205,  1358, 182,  952,  850,  661,
      1008, 1623, 144,  1141, 118,  1401, 1553, 1447, 1319, 1448, 1085, 1554, 1359, 753,  1504, 1505, 174,  1009, 912,  1555,
      714,  890,  159,  1320, 1010, 1506, 80,   69,   185,  662,  5,    306,  266,  603,  1011, 1321, 493,  362,  77,   128,
      401,  504,  1402, 1624, 1625, 1110, 1556, 407,  953,  635,  1012, 862,  703,  505,  818,  875,  913,  282,  1360, 148,
      274,  715,  836,  540,  322,  768,  984,  1063, 70,   1507, 278,  1449, 404,  954,  819,  119,  955,  730,  134,  30,
      301,  520,  1403, 636,  430,  1404, 637,  1283, 494,  1322, 731,  235,  754,  179,  985,  1244, 521,  1245, 506,  611,
      1246, 82,   222,  474,  292,  1086
    };

    const char* words_array[] = {
      "like",         "just",         "love",         "know",         "never",        "want",         "time",         "out",          "there",        "make",
      "look",         "eye",          "down",         "only",         "think",        "heart",        "back",         "then",         "into",         "about",
      "more",         "away",         "still",        "them",         "take",         "thing",        "even",         "through",      "long",         "always",
      "world",        "too",          "friend",       "tell",         "try",          "hand",         "thought",      "over",         "here",         "other",
      "need",         "smile",        "again",        "much",         "cry",          "been",         "night",        "ever",         "little",       "said",
      "end",          "some",         "those",        "around",       "mind",         "people",       "girl",         "leave",        "dream",        "left",
      "turn",         "myself",       "give",         "nothing",      "really",       "off",          "before",       "something",    "find",         "walk",
      "wish",         "good",         "once",         "place",        "ask",          "stop",         "keep",         "watch",        "seem",         "everything",
      "wait",         "got",          "yet",          "made",         "remember",     "start",        "alone",        "run",          "hope",         "maybe",
      "believe",      "body",         "hate",         "after",        "close",        "talk",         "stand",        "own",          "each",         "hurt",
      "help",         "home",         "god",          "soul",         "new",          "many",         "two",          "inside",       "should",       "true",
      "first",        "fear",         "mean",         "better",       "play",         "another",      "gone",         "change",       "use",          "wonder",
      "someone",      "hair",         "cold",         "open",         "best",         "any",          "behind",       "happen",       "water",        "dark",
      "laugh",        "stay",         "forever",      "name",         "work",         "show",         "sky",          "break",        "came",         "deep",
      "door",         "put",          "black",        "together",     "upon",         "happy",        "such",         "great",        "white",        "matter",
      "fill",         "past",         "please",       "burn",         "cause",        "enough",       "touch",        "moment",       "soon",         "voice",
      "scream",       "anything",     "stare",        "sound",        "red",          "everyone",     "hide",         "kiss",         "truth",        "death",
      "beautiful",    "mine",         "blood",        "broken",       "very",         "pass",         "next",         "forget",       "tree",         "wrong",
      "air",          "mother",       "understand",   "lip",          "hit",          "wall",         "memory",       "sleep",        "free",         "high",
      "realize",      "school",       "might",        "skin",         "sweet",        "perfect",      "blue",         "kill",         "breath",       "dance",
      "against",      "fly",          "between",      "grow",         "strong",       "under",        "listen",       "bring",        "sometimes",    "speak",
      "pull",         "person",       "become",       "family",       "begin",        "ground",       "real",         "small",        "father",       "sure",
      "feet",         "rest",         "young",        "finally",      "land",         "across",       "today",        "different",    "guy",          "line",
      "fire",         "reason",       "reach",        "second",       "slowly",       "write",        "eat",          "smell",        "mouth",        "step",
      "learn",        "three",        "floor",        "promise",      "breathe",      "darkness",     "push",         "earth",        "guess",        "save",
      "song",         "above",        "along",        "both",         "color",        "house",        "almost",       "sorry",        "anymore",      "brother",
      "okay",         "dear",         "game",         "fade",         "already",      "apart",        "warm",         "beauty",       "heard",        "notice",
      "question",     "shine",        "began",        "piece",        "whole",        "shadow",       "secret",       "street",       "within",       "finger",
      "point",        "morning",      "whisper",      "child",        "moon",         "green",        "story",        "glass",        "kid",          "silence",
      "since",        "soft",         "yourself",     "empty",        "shall",        "angel",        "answer",       "baby",         "bright",       "dad",
      "path",         "worry",        "hour",         "drop",         "follow",       "power",        "war",          "half",         "flow",         "heaven",
      "act",          "chance",       "fact",         "least",        "tired",        "children",     "near",         "quite",        "afraid",       "rise",
      "sea",          "taste",        "window",       "cover",        "nice",         "trust",        "lot",          "sad",          "cool",         "force",
      "peace",        "return",       "blind",        "easy",         "ready",        "roll",         "rose",         "drive",        "held",         "music",
      "beneath",      "hang",         "mom",          "paint",        "emotion",      "quiet",        "clear",        "cloud",        "few",          "pretty",
      "bird",         "outside",      "paper",        "picture",      "front",        "rock",         "simple",       "anyone",       "meant",        "reality",
      "road",         "sense",        "waste",        "bit",          "leaf",         "thank",        "happiness",    "meet",         "men",          "smoke",
      "truly",        "decide",       "self",         "age",          "book",         "form",         "alive",        "carry",        "escape",       "damn",
      "instead",      "able",         "ice",          "minute",       "throw",        "catch",        "leg",          "ring",         "course",       "goodbye",
      "lead",         "poem",         "sick",         "corner",       "desire",       "known",        "problem",      "remind",       "shoulder",     "suppose",
      "toward",       "wave",         "drink",        "jump",         "woman",        "pretend",      "sister",       "week",         "human",        "joy",
      "crack",        "grey",         "pray",         "surprise",     "dry",          "knee",         "less",         "search",       "bleed",        "caught",
      "clean",        "embrace",      "future",       "king",         "son",          "sorrow",       "chest",        "hug",          "remain",       "sat",
      "worth",        "blow",         "daddy",        "final",        "parent",       "tight",        "also",         "create",       "lonely",       "safe",
      "cross",        "dress",        "evil",         "silent",       "bone",         "fate",         "perhaps",      "anger",        "class",        "scar",
      "snow",         "tiny",         "tonight",      "continue",     "control",      "dog",          "edge",         "mirror",       "month",        "suddenly",
      "comfort",      "given",        "loud",         "quickly",      "gaze",         "plan",         "rush",         "stone",        "town",         "battle",
      "ignore",       "spirit",       "stood",        "stupid",       "yours",        "brown",        "build",        "dust",         "hey",          "kept",
      "pay",          "phone",        "twist",        "although",     "ball",         "beyond",       "hidden",       "nose",         "taken",        "fail",
      "float",        "pure",         "somehow",      "wash",         "wrap",         "angry",        "cheek",        "creature",     "forgotten",    "heat",
      "rip",          "single",       "space",        "special",      "weak",         "whatever",     "yell",         "anyway",       "blame",        "job",
      "choose",       "country",      "curse",        "drift",        "echo",         "figure",       "grew",         "laughter",     "neck",         "suffer",
      "worse",        "yeah",         "disappear",    "foot",         "forward",      "knife",        "mess",         "somewhere",    "stomach",      "storm",
      "beg",          "idea",         "lift",         "offer",        "breeze",       "field",        "five",         "often",        "simply",       "stuck",
      "win",          "allow",        "confuse",      "enjoy",        "except",       "flower",       "seek",         "strength",     "calm",         "grin",
      "gun",          "heavy",        "hill",         "large",        "ocean",        "shoe",         "sigh",         "straight",     "summer",       "tongue",
      "accept",       "crazy",        "everyday",     "exist",        "grass",        "mistake",      "sent",         "shut",         "surround",     "table",
      "ache",         "brain",        "destroy",      "heal",         "nature",       "shout",        "sign",         "stain",        "choice",       "doubt",
      "glance",       "glow",         "mountain",     "queen",        "stranger",     "throat",       "tomorrow",     "city",         "either",       "fish",
      "flame",        "rather",       "shape",        "spin",         "spread",       "ash",          "distance",     "finish",       "image",        "imagine",
      "important",    "nobody",       "shatter",      "warmth",       "became",       "feed",         "flesh",        "funny",        "lust",         "shirt",
      "trouble",      "yellow",       "attention",    "bare",         "bite",         "money",        "protect",      "amaze",        "appear",       "born",
      "choke",        "completely",   "daughter",     "fresh",        "friendship",   "gentle",       "probably",     "six",          "deserve",      "expect",
      "grab",         "middle",       "nightmare",    "river",        "thousand",     "weight",       "worst",        "wound",        "barely",       "bottle",
      "cream",        "regret",       "relationship", "stick",        "test",         "crush",        "endless",      "fault",        "itself",       "rule",
      "spill",        "art",          "circle",       "join",         "kick",         "mask",         "master",       "passion",      "quick",        "raise",
      "smooth",       "unless",       "wander",       "actually",     "broke",        "chair",        "deal",         "favorite",     "gift",         "note",
      "number",       "sweat",        "box",          "chill",        "clothes",      "lady",         "mark",         "park",         "poor",         "sadness",
      "tie",          "animal",       "belong",       "brush",        "consume",      "dawn",         "forest",       "innocent",     "pen",          "pride",
      "stream",       "thick",        "clay",         "complete",     "count",        "draw",         "faith",        "press",        "silver",       "struggle",
      "surface",      "taught",       "teach",        "wet",          "bless",        "chase",        "climb",        "enter",        "letter",       "melt",
      "metal",        "movie",        "stretch",      "swing",        "vision",       "wife",         "beside",       "crash",        "forgot",       "guide",
      "haunt",        "joke",         "knock",        "plant",        "pour",         "prove",        "reveal",       "steal",        "stuff",        "trip",
      "wood",         "wrist",        "bother",       "bottom",       "crawl",        "crowd",        "fix",          "forgive",      "frown",        "grace",
      "loose",        "lucky",        "party",        "release",      "surely",       "survive",      "teacher",      "gently",       "grip",         "speed",
      "suicide",      "travel",       "treat",        "vein",         "written",      "cage",         "chain",        "conversation", "date",         "enemy",
      "however",      "interest",     "million",      "page",         "pink",         "proud",        "sway",         "themselves",   "winter",       "church",
      "cruel",        "cup",          "demon",        "experience",   "freedom",      "pair",         "pop",          "purpose",      "respect",      "shoot",
      "softly",       "state",        "strange",      "bar",          "birth",        "curl",         "dirt",         "excuse",       "lord",         "lovely",
      "monster",      "order",        "pack",         "pants",        "pool",         "scene",        "seven",        "shame",        "slide",        "ugly",
      "among",        "blade",        "blonde",       "closet",       "creek",        "deny",         "drug",         "eternity",     "gain",         "grade",
      "handle",       "key",          "linger",       "pale",         "prepare",      "swallow",      "swim",         "tremble",      "wheel",        "won",
      "cast",         "cigarette",    "claim",        "college",      "direction",    "dirty",        "gather",       "ghost",        "hundred",      "loss",
      "lung",         "orange",       "present",      "swear",        "swirl",        "twice",        "wild",         "bitter",       "blanket",      "doctor",
      "everywhere",   "flash",        "grown",        "knowledge",    "numb",         "pressure",     "radio",        "repeat",       "ruin",         "spend",
      "unknown",      "buy",          "clock",        "devil",        "early",        "false",        "fantasy",      "pound",        "precious",     "refuse",
      "sheet",        "teeth",        "welcome",      "add",          "ahead",        "block",        "bury",         "caress",       "content",      "depth",
      "despite",      "distant",      "marry",        "purple",       "threw",        "whenever",     "bomb",         "dull",         "easily",       "grasp",
      "hospital",     "innocence",    "normal",       "receive",      "reply",        "rhyme",        "shade",        "someday",      "sword",        "toe",
      "visit",        "asleep",       "bought",       "center",       "consider",     "flat",         "hero",         "history",      "ink",          "insane",
      "muscle",       "mystery",      "pocket",       "reflection",   "shove",        "silently",     "smart",        "soldier",      "spot",         "stress",
      "train",        "type",         "view",         "whether",      "bus",          "energy",       "explain",      "holy",         "hunger",       "inch",
      "magic",        "mix",          "noise",        "nowhere",      "prayer",       "presence",     "shock",        "snap",         "spider",       "study",
      "thunder",      "trail",        "admit",        "agree",        "bag",          "bang",         "bound",        "butterfly",    "cute",         "exactly",
      "explode",      "familiar",     "fold",         "further",      "pierce",       "reflect",      "scent",        "selfish",      "sharp",        "sink",
      "spring",       "stumble",      "universe",     "weep",         "women",        "wonderful",    "action",       "ancient",      "attempt",      "avoid",
      "birthday",     "branch",       "chocolate",    "core",         "depress",      "drunk",        "especially",   "focus",        "fruit",        "honest",
      "match",        "palm",         "perfectly",    "pillow",       "pity",         "poison",       "roar",         "shift",        "slightly",     "thump",
      "truck",        "tune",         "twenty",       "unable",       "wipe",         "wrote",        "coat",         "constant",     "dinner",       "drove",
      "egg",          "eternal",      "flight",       "flood",        "frame",        "freak",        "gasp",         "glad",         "hollow",       "motion",
      "peer",         "plastic",      "root",         "screen",       "season",       "sting",        "strike",       "team",         "unlike",       "victim",
      "volume",       "warn",         "weird",        "attack",       "await",        "awake",        "built",        "charm",        "crave",        "despair",
      "fought",       "grant",        "grief",        "horse",        "limit",        "message",      "ripple",       "sanity",       "scatter",      "serve",
      "split",        "string",       "trick",        "annoy",        "blur",         "boat",         "brave",        "clearly",      "cling",        "connect",
      "fist",         "forth",        "imagination",  "iron",         "jock",         "judge",        "lesson",       "milk",         "misery",       "nail",
      "naked",        "ourselves",    "poet",         "possible",     "princess",     "sail",         "size",         "snake",        "society",      "stroke",
      "torture",      "toss",         "trace",        "wise",         "bloom",        "bullet",       "cell",         "check",        "cost",         "darling",
      "during",       "footstep",     "fragile",      "hallway",      "hardly",       "horizon",      "invisible",    "journey",      "midnight",     "mud",
      "nod",          "pause",        "relax",        "shiver",       "sudden",       "value",        "youth",        "abuse",        "admire",       "blink",
      "breast",       "bruise",       "constantly",   "couple",       "creep",        "curve",        "difference",   "dumb",         "emptiness",    "gotta",
      "honor",        "plain",        "planet",       "recall",       "rub",          "ship",         "slam",         "soar",         "somebody",     "tightly",
      "weather",      "adore",        "approach",     "bond",         "bread",        "burst",        "candle",       "coffee",       "cousin",       "crime",
      "desert",       "flutter",      "frozen",       "grand",        "heel",         "hello",        "language",     "level",        "movement",     "pleasure",
      "powerful",     "random",       "rhythm",       "settle",       "silly",        "slap",         "sort",         "spoken",       "steel",        "threaten",
      "tumble",       "upset",        "aside",        "awkward",      "bee",          "blank",        "board",        "button",       "card",         "carefully",
      "complain",     "crap",         "deeply",       "discover",     "drag",         "dread",        "effort",       "entire",       "fairy",        "giant",
      "gotten",       "greet",        "illusion",     "jeans",        "leap",         "liquid",       "march",        "mend",         "nervous",      "nine",
      "replace",      "rope",         "spine",        "stole",        "terror",       "accident",     "apple",        "balance",      "boom",         "childhood",
      "collect",      "demand",       "depression",   "eventually",   "faint",        "glare",        "goal",         "group",        "honey",        "kitchen",
      "laid",         "limb",         "machine",      "mere",         "mold",         "murder",       "nerve",        "painful",      "poetry",       "prince",
      "rabbit",       "shelter",      "shore",        "shower",       "soothe",       "stair",        "steady",       "sunlight",     "tangle",       "tease",
      "treasure",     "uncle",        "begun",        "bliss",        "canvas",       "cheer",        "claw",         "clutch",       "commit",       "crimson",
      "crystal",      "delight",      "doll",         "existence",    "express",      "fog",          "football",     "gay",          "goose",        "guard",
      "hatred",       "illuminate",   "mass",         "math",         "mourn",        "rich",         "rough",        "skip",         "stir",         "student",
      "style",        "support",      "thorn",        "tough",        "yard",         "yearn",        "yesterday",    "advice",       "appreciate",   "autumn",
      "bank",         "beam",         "bowl",         "capture",      "carve",        "collapse",     "confusion",    "creation",     "dove",         "feather",
      "girlfriend",   "glory",        "government",   "harsh",        "hop",          "inner",        "loser",        "moonlight",    "neighbor",     "neither",
      "peach",        "pig",          "praise",       "screw",        "shield",       "shimmer",      "sneak",        "stab",         "subject",      "throughout",
      "thrown",       "tower",        "twirl",        "wow",          "army",         "arrive",       "bathroom",     "bump",         "cease",        "cookie",
      "couch",        "courage",      "dim",          "guilt",        "howl",         "hum",          "husband",      "insult",       "led",          "lunch",
      "mock",         "mostly",       "natural",      "nearly",       "needle",       "nerd",         "peaceful",     "perfection",   "pile",         "price",
      "remove",       "roam",         "sanctuary",    "serious",      "shiny",        "shook",        "sob",          "stolen",       "tap",          "vain",
      "void",         "warrior",      "wrinkle",      "affection",    "apologize",    "blossom",      "bounce",       "bridge",       "cheap",        "crumble",
      "decision",     "descend",      "desperately",  "dig",          "dot",          "flip",         "frighten",     "heartbeat",    "huge",         "lazy",
      "lick",         "odd",          "opinion",      "process",      "puzzle",       "quietly",      "retreat",      "score",        "sentence",     "separate",
      "situation",    "skill",        "soak",         "square",       "stray",        "taint",        "task",         "tide",         "underneath",   "veil",
      "whistle",      "anywhere",     "bedroom",      "bid",          "bloody",       "burden",       "careful",      "compare",      "concern",      "curtain",
      "decay",        "defeat",       "describe",     "double",       "dreamer",      "driver",       "dwell",        "evening",      "flare",        "flicker",
      "grandma",      "guitar",       "harm",         "horrible",     "hungry",       "indeed",       "lace",         "melody",       "monkey",       "nation",
      "object",       "obviously",    "rainbow",      "salt",         "scratch",      "shown",        "shy",          "stage",        "stun",         "third",
      "tickle",       "useless",      "weakness",     "worship",      "worthless",    "afternoon",    "beard",        "boyfriend",    "bubble",       "busy",
      "certain",      "chin",         "concrete",     "desk",         "diamond",      "doom",         "drawn",        "due",          "felicity",     "freeze",
      "frost",        "garden",       "glide",        "harmony",      "hopefully",    "hunt",         "jealous",      "lightning",    "mama",         "mercy",
      "peel",         "physical",     "position",     "pulse",        "punch",        "quit",         "rant",         "respond",      "salty",        "sane",
      "satisfy",      "savior",       "sheep",        "slept",        "social",       "sport",        "tuck",         "utter",        "valley",       "wolf",
      "aim",          "alas",         "alter",        "arrow",        "awaken",       "beaten",       "belief",       "brand",        "ceiling",      "cheese",
      "clue",         "confidence",   "connection",   "daily",        "disguise",     "eager",        "erase",        "essence",      "everytime",    "expression",
      "fan",          "flag",         "flirt",        "foul",         "fur",          "giggle",       "glorious",     "ignorance",    "law",          "lifeless",
      "measure",      "mighty",       "muse",         "north",        "opposite",     "paradise",     "patience",     "patient",      "pencil",       "petal",
      "plate",        "ponder",       "possibly",     "practice",     "slice",        "spell",        "stock",        "strife",       "strip",        "suffocate",
      "suit",         "tender",       "tool",         "trade",        "velvet",       "verse",        "waist",        "witch",        "aunt",         "bench",
      "bold",         "cap",          "certainly",    "click",        "companion",    "creator",      "dart",         "delicate",     "determine",    "dish",
      "dragon",       "drama",        "drum",         "dude",         "everybody",    "feast",        "forehead",     "former",       "fright",       "fully",
      "gas",          "hook",         "hurl",         "invite",       "juice",        "manage",       "moral",        "possess",      "raw",          "rebel",
      "royal",        "scale",        "scary",        "several",      "slight",       "stubborn",     "swell",        "talent",       "tea",          "terrible",
      "thread",       "torment",      "trickle",      "usually",      "vast",         "violence",     "weave",        "acid",         "agony",        "ashamed",
      "awe",          "belly",        "blend",        "blush",        "character",    "cheat",        "common",       "company",      "coward",       "creak",
      "danger",       "deadly",       "defense",      "define",       "depend",       "desperate",    "destination",  "dew",          "duck",         "dusty",
      "embarrass",    "engine",       "example",      "explore",      "foe",          "freely",       "frustrate",    "generation",   "glove",        "guilty",
      "health",       "hurry",        "idiot",        "impossible",   "inhale",       "jaw",          "kingdom",      "mention",      "mist",         "moan",
      "mumble",       "mutter",       "observe",      "ode",          "pathetic",     "pattern",      "pie",          "prefer",       "puff",         "rape",
      "rare",         "revenge",      "rude",         "scrape",       "spiral",       "squeeze",      "strain",       "sunset",       "suspend",      "sympathy",
      "thigh",        "throne",       "total",        "unseen",       "weapon",       "weary"
    };

    uint32_t findBinary(const string& key)
    {
      uint32_t left = 0;
      uint32_t right = NUMWORDS;
      uint32_t midd = 0;
      while (true)
      {
        midd = (left + right) / 2;

        if (key < words_array[words_indexes[midd]])
          right = midd - 1;
        else if (key > words_array[words_indexes[midd]])
          left = midd + 1;
        else
          return words_indexes[midd];

        if (left > right)
          throw runtime_error("Invalid word count in mnemonic text");
      }
    }

    // convert text to binary data, 3 words -> 4 bytes
    std::string text2binary_throw(const string& text)
    {
      static_assert(std::is_pod<decltype(words_array)>::value, "words_array must be POD");
      static_assert(std::is_pod<decltype(words_indexes)>::value, "words_indexes must be POD");
      const int n = NUMWORDS;
      vector<string> tokens;
      string trimmed_copy(boost::trim_copy(text));
      boost::algorithm::to_lower(trimmed_copy);

      std::string::iterator founded_iterator =
        std::unique(trimmed_copy.begin(), trimmed_copy.end(),
          [=](char lhs, char rhs) { return (lhs == rhs) && (lhs == ' '); }
      );
      trimmed_copy.erase(founded_iterator, trimmed_copy.end());
      boost::split(tokens, trimmed_copy,
        boost::is_any_of(" "));
      if (tokens.size() % 3 != 0)
        throw runtime_error("Invalid word count in mnemonic text");

      std::string res(tokens.size() / 3 * 4, '\0');
      for (unsigned int i = 0; i < tokens.size() / 3; i++)
      {
        const uint32_t w1 = findBinary(tokens[i * 3]);
        const uint32_t w2 = findBinary(tokens[i * 3 + 1]);
        const uint32_t w3 = findBinary(tokens[i * 3 + 2]);

        uint32_t* val = reinterpret_cast<uint32_t*>(&res[i * 4]);
        *val = w1 + n * (((n - w1) + w2) % n) + n * n * (((n - w2) + w3) % n);
      }
      return res;
    }

    std::string text2binary(const string& text)
    {
      try
      {
        return text2binary_throw(text);
      }
      catch (...)
      {
        return std::string();
      }
    }
    // convert binary data to text, 4 bytes => 3 words
    string binary2text(const std::string& binary)
    {
      static_assert(std::is_pod<decltype(words_array)>::value, "wards_array must be POD");
      const int n = NUMWORDS; // hardcoded because this is what electrum uses

      if (binary.size() % 4 != 0)
        throw runtime_error("Invalid binary data size for mnemonic encoding");
      // 4 bytes -> 3 words.  8 digits base 16 -> 3 digits base 1626
      string res;
      for (unsigned int i = 0; i < binary.size() / 4; i++, res += ' ')
      {
        const uint32_t* val =
          reinterpret_cast<const uint32_t*>(&binary[i * 4]);

        const uint32_t w1 = *val % n;
        const uint32_t w2 = ((*val / n) + w1) % n;
        const uint32_t w3 = (((*val / n) / n) + w2) % n;

        res += std::string(words_array[w1]) + " ";
        res += std::string(words_array[w2]) + " ";
        res += std::string(words_array[w3]);
      }
      return res;
    }
    std::string word_by_num(uint32_t n)
    {
      if (n >= NUMWORDS)
        return "";
      return std::string(words_array[n]);
    }
    uint64_t num_by_word(const std::string& w)
    {
      try
      {
        return findBinary(w);
      }
      catch (...)
      {
        return 0;
      }
    }
  }
}
