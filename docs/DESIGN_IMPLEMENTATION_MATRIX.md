# DeepTutor mobile design implementation matrix

Learning update (2026-11-09): [Learning implementation/status matrix](LEARNING_IMPLEMENTATION_STATUS.md) and [verified API mapping](LEARNING_API_MAPPING.md) supersede the older Learning rows and fixture-only claims below. Production Learning now uses live native screens and the shared chat transport. Core read/navigation/streaming flows were tested; advanced readers, assessments, resource types and native-device checks remain PARTIAL/BLOCKED as documented. The current Study Session source is 390×850.

Source: `file:///home/zillia/Documents/deep-tutor-app-2.pen`, inspected read-only through Pencil MCP on 2026-11-08.

This extends the existing `docs/mobile-ui/SCREEN_MAPPING.md` and `pen-audit/SCREEN_COVERAGE.md`; their earlier companion-only scope is superseded for this redesign. Existing routes/providers remain available.

461 document roots: 123 original/reference imports (excluded), 308 mobile screen variants (154 light + 154 dark), and 30 reference boards. The boards comprise two foundations, four handoff, thirteen coverage and eleven dark indexes; see `reference-boards.json`. Every relevant screen variant is mapped below.

**154 native presentations exist; no screen is certified complete end to end.** Local flow means specific offline interactions work, not all actions or backend integration. Draft/navigation means native controls and mapped links exist, with domain operations pending. No API endpoints were added. Unsupported operations explicitly report that no server action occurred.

The historical numbered presentations use Expo Router `/mobile/[screen]`, `MobileScreen`, `NativeLayer` and `NativeField`; production Learning now uses the live native routes documented above. Text, views, pressables, fields, switches and SVG icons are native. No WebView or full-screen bitmap is used. OS safe areas, keyboard and status bar replace the canvas illustrations. Content uses viewport scrolling rather than fixed canvas heights.

Light and dark trees have identical layout/content after excluding identifiers, names, positions and colors. Extracted semantic tokens supply both themes. Inter and its license are bundled; the 308 trees contain no image fills, and all icons use the existing Lucide dependency.

Dependencies: Expo 58.0.23; React Native 0.88.1; strict TypeScript 6; existing Expo Router/provider tree; AsyncStorage-backed Zustand local drafts. ChatProvider supplies simulated sending/history/rename/pin/archive/delete. This historical paragraph describes the fixture baseline. Current Learning integrations and their live evidence are documented in the linked status matrix. Passwords, credentials and HTTP headers are not persisted.

## Complete frame mapping

Dimensions are resolved canvas bounds. Compared means selected browser/Pencil visual inspection; other screens still need individual comparison. None has native-device visual verification. Static route relationships are recorded in `interaction-inventory.json`; runtime handlers additionally implement local flows.

| # | Light ID | Dark ID | Design / purpose | Dimensions | Route / component | Status | Navigation targets | Visual |
|---|---|---|---|---|---|---|---|---|
| 1 | `Ov0zp` | `e2o6q` | Learning / Learn | 390×1234 | `/learning` / `view=overview` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | Four primary tabs; 2, 3, 5, 9, 10, 33, 39 | Compared in browser |
| 2 | `rT3o8` | `hvR8U` | Learning / New activity | 390×844 | `/learning` / `view=new` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 3, 9, 10, 33 | Individual comparison pending |
| 3 | `QaJ68` | `DefJ1` | Learning / Backend engineering | 390×1486 | `/learning` / `view=topic` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 4, 5, 6, 7, 8, 131, 132, 133, 134, 135, 136 | Individual comparison pending |
| 4 | `KbCsA` | `IQnCc` | Learning / Node.js & TypeScript | 390×844 | `/learning` / `view=module` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 5, 12 | Compared in browser |
| 5 | `g3IkH` | `FqRwt` | Learning / Study session | 390×850 | `/learning` / `view=study` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 20, 126 | Individual comparison pending |
| 6 | `Okd9c` | `ubH7b` | Learning / Review plan | 390×844 | `/learning` / `view=review` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 127 | Individual comparison pending |
| 7 | `q5CRfW` | `NFIba` | Learning / Learning profile | 390×854 | `/learning` / `view=profile` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 12, 137 | Individual comparison pending |
| 8 | `mTwiq` | `N9RlAh` | Learning / Path sessions | 390×844 | `/learning` / `view=sessions` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 5, 126 | Individual comparison pending |
| 9 | `IPmHP` | `mIKUD` | Learning / Books | 390×844 | `/learning` / `view=books` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | Runtime local action / pending domain flow | Individual comparison pending |
| 10 | `CH5Jk` | `ZnZ4h` | Learning / Immersive reading | 390×844 | `/learning` / `view=reading` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 40 | Individual comparison pending |
| 11 | `BkhA4` | `NeYvW` | Learning / Read & understand | 390×1374 | `/learning` / `view=reader` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 12, 37 | Individual comparison pending |
| 12 | `I4bWau` | `Xmj8E` | Tutor / Tutor | 390×1241 | `/mobile/12` · MobileScreen | Native; local flow + pending domain actions | Four primary tabs; 16, 23, 27 | Compared in browser |
| 13 | `kEc9H` | `eAAWE` | Tutor / Isolation levels | 390×1091 | `/mobile/13` · MobileScreen | Native; local flow + pending domain actions | 15, 20 | Individual comparison pending |
| 14 | `KM9sk` | `thxA8` | Tutor / Connection interrupted | 390×844 | `/mobile/14` · MobileScreen | Native; drafts/navigation; domain pending | 18, 20 | Individual comparison pending |
| 15 | `wJsNH` | `wpadl` | Tutor / Turn setup | 390×1106 | `/mobile/15` · MobileScreen | Native; drafts/navigation; domain pending | 16, 17, 18, 19, 76, 125 | Individual comparison pending |
| 16 | `w7N1iG` | `f4wsFy` | Tutor / Choose a mode | 390×1062 | `/mobile/16` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 17 | `tyqLV` | `Jyv43` | Tutor / Add sources | 390×988 | `/mobile/17` · MobileScreen | Native; drafts/navigation; domain pending | 9, 27, 31, 40, 56 | Individual comparison pending |
| 18 | `qP3Uw` | `xfccS` | Tutor / Choose model | 390×1184 | `/mobile/18` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 19 | `L8LeMw` | `NfyQr` | Tutor / Response & skills | 390×1096 | `/mobile/19` · MobileScreen | Native; drafts/navigation; domain pending | 73 | Individual comparison pending |
| 20 | `q4P17P` | `nw4zC` | Tutor / Session activity | 390×844 | `/mobile/20` · MobileScreen | Native; drafts/navigation; domain pending | 13, 21, 88 | Individual comparison pending |
| 21 | `s1YFs` | `dIpzf` | Tutor / Conversation note | 390×844 | `/mobile/21` · MobileScreen | Native; local flow + pending domain actions | 13 | Individual comparison pending |
| 22 | `AZh1i` | `F9n6m` | Tutor / Conversation actions | 390×888 | `/mobile/22` · MobileScreen | Native; local flow + pending domain actions | 32, 62, 152 | Individual comparison pending |
| 23 | `ROhxF` | `dXqAU` | Tutor / Customize Tutor | 390×844 | `/mobile/23` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 24 | `fXca8` | `SOfLM` | Tutor / Preparing response | 390×844 | `/mobile/24` · MobileScreen | Native; drafts/navigation; domain pending | 13, 20 | Individual comparison pending |
| 25 | `aCgWj` | `gOUl1` | Tutor / Write a message | 390×844 | `/mobile/25` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 26 | `iMtXF` | `KLPVx` | Library / Library | 390×964 | `/mobile/26` · MobileScreen | Native; drafts/navigation; domain pending | Four primary tabs; 27, 28, 31, 33, 39, 40 | Compared in browser |
| 27 | `M14ot` | `qFXfU` | Library / Conversations | 390×844 | `/mobile/27` · MobileScreen | Native; local flow + pending domain actions | 12, 13, 108 | Individual comparison pending |
| 28 | `bJNMD` | `mb4sO` | Library / Notebook | 390×844 | `/mobile/28` · MobileScreen | Native; local flow + pending domain actions | 29 | Individual comparison pending |
| 29 | `uhhHq` | `lLYsP` | Library / Edit note | 390×899 | `/mobile/29` · MobileScreen | Native; local flow + pending domain actions | 12, 30 | Individual comparison pending |
| 30 | `S732D` | `YrhPn` | Library / Review note edit | 390×844 | `/mobile/30` · MobileScreen | Native; local flow + pending domain actions | 29 | Individual comparison pending |
| 31 | `Yo7kz` | `ahPir` | Library / Favorites | 390×844 | `/mobile/31` · MobileScreen | Native; drafts/navigation; domain pending | 32 | Individual comparison pending |
| 32 | `LPpAg` | `ayUkc` | Library / Save to collection | 390×844 | `/mobile/32` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 33 | `wOKkh` | `o9wdFG` | Library / Question bank | 390×942 | `/mobile/33` · MobileScreen | Native; drafts/navigation; domain pending | 34, 35, 37, 130 | Individual comparison pending |
| 34 | `DporA` | `N792w` | Library / Mistakes | 390×844 | `/mobile/34` · MobileScreen | Native; drafts/navigation; domain pending | 33 | Individual comparison pending |
| 35 | `dpWKW` | `OkfyR` | Library / Import questions | 390×844 | `/mobile/35` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 36 | `HjzFs` | `hYNVZ` | Library / Review import | 390×844 | `/mobile/36` · MobileScreen | Native; drafts/navigation; domain pending | 35 | Individual comparison pending |
| 37 | `lcoqb` | `KVD5F` | Library / Practice question | 390×844 | `/mobile/37` · MobileScreen | Native; local flow + pending domain actions | 37 | Compared in browser |
| 38 | `t7AH5S` | `xpkSq` | Library / Answer review | 390×844 | `/mobile/38` · MobileScreen | Native; local flow + pending domain actions | 12, 37, 130 | Individual comparison pending |
| 39 | `f6RMng` | `GEQ42` | Library / Learning journal | 390×844 | `/mobile/39` · MobileScreen | Native; drafts/navigation; domain pending | 12 | Individual comparison pending |
| 40 | `C9mQk` | `r2ialJ` | Library / Knowledge bases | 390×1110 | `/mobile/40` · MobileScreen | Native; drafts/navigation; domain pending | 41, 43, 59, 147, 148, 149, 150, 151 | Individual comparison pending |
| 41 | `nIcZ4` | `rmdU0` | Knowledge / Databases | 390×994 | `/mobile/41` · MobileScreen | Native; drafts/navigation; domain pending | 12, 42, 44, 45, 50, 51 | Individual comparison pending |
| 42 | `WgSa5` | `c8KLh` | Knowledge / Source preview | 390×844 | `/mobile/42` · MobileScreen | Native; drafts/navigation; domain pending | 11, 12 | Individual comparison pending |
| 43 | `io5xa` | `b9nXD` | Knowledge / New knowledge base | 390×994 | `/mobile/43` · MobileScreen | Native; drafts/navigation; domain pending | 44, 46, 59, 60, 91 | Individual comparison pending |
| 44 | `dLSSm` | `FEuUv` | Knowledge / Add documents | 390×844 | `/mobile/44` · MobileScreen | Native; drafts/navigation; domain pending | 44, 49 | Individual comparison pending |
| 45 | `bUvy1` | `DWjBY` | Knowledge / Connected sources | 390×844 | `/mobile/45` · MobileScreen | Native; drafts/navigation; domain pending | 46, 47, 49, 128 | Individual comparison pending |
| 46 | `EC5N9` | `ylwOC` | Knowledge / Add source | 390×844 | `/mobile/46` · MobileScreen | Native; drafts/navigation; domain pending | 47, 48, 49 | Individual comparison pending |
| 47 | `T4OvZ` | `pePRE` | Knowledge / GitHub source | 390×844 | `/mobile/47` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 48 | `P34fQv` | `Q5C2cY` | Knowledge / Web source | 390×844 | `/mobile/48` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 49 | `xFK5I` | `vxVyv` | Knowledge / Linked folder | 390×844 | `/mobile/49` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 50 | `GwGaU` | `MwqBz` | Knowledge / Index & recovery | 390×844 | `/mobile/50` · MobileScreen | Native; drafts/navigation; domain pending | 42 | Individual comparison pending |
| 51 | `Lj9EH` | `ShxOa` | Knowledge / Library settings | 390×844 | `/mobile/51` · MobileScreen | Native; drafts/navigation; domain pending | 112, 140 | Individual comparison pending |
| 52 | `KXGfW` | `o29Sk` | Plan / Plan | 390×906 | `/mobile/52` · MobileScreen | Native; local flow + pending domain actions | Four primary tabs; 53, 54, 56, 57, 58 | Compared in browser |
| 53 | `Mu9zR` | `t1RkPv` | Plan / November 2026 | 390×844 | `/mobile/53` · MobileScreen | Native; drafts/navigation; domain pending | 54 | Individual comparison pending |
| 54 | `T1KPho` | `MNAyU` | Plan / Friday, 6 Nov | 390×1934 | `/mobile/54` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 55 | `OH9dr` | `P4G8pC` | Plan / 1–7 November | 390×1114 | `/mobile/55` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 56 | `ni17R` | `uW0hU` | Plan / Task board | 390×844 | `/mobile/56` · MobileScreen | Native; drafts/navigation; domain pending | 53, 57, 129 | Individual comparison pending |
| 57 | `g1pSV` | `DvSsV` | Plan / Task details | 390×908 | `/mobile/57` · MobileScreen | Native; local flow + pending domain actions | Runtime local action / pending domain flow | Compared in browser |
| 58 | `PrI2K` | `ZutbM` | Plan / Learning progress | 390×844 | `/learning` / `view=progress` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 1 | Individual comparison pending |
| 59 | `K6gVi` | `A3jtP` | Knowledge / Knowledge engines | 390×1344 | `/mobile/59` · MobileScreen | Native; drafts/navigation; domain pending | 60 | Individual comparison pending |
| 60 | `UCi5v` | `seMLo` | Knowledge / Engine configuration | 390×1248 | `/mobile/60` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 61 | `iAdAa` | `vaQ3x` | Account / Account | 390×844 | `/mobile/61` · MobileScreen | Native; drafts/navigation; domain pending | 62, 63, 65, 81, 146 | Compared in browser |
| 62 | `fm6lZ` | `Gbb4W` | Account / Switch workspace | 390×844 | `/mobile/62` · MobileScreen | Native; local flow + pending domain actions | 84 | Individual comparison pending |
| 63 | `LJkBQ` | `QQzLN` | Account / My profile | 390×844 | `/mobile/63` · MobileScreen | Native; drafts/navigation; domain pending | 64, 138, 139 | Individual comparison pending |
| 64 | `q7s0F` | `rESEm` | Account / Change password | 390×844 | `/mobile/64` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 65 | `hp4M8` | `JUBdj` | Personalization / Personalization | 390×948 | `/mobile/65` · MobileScreen | Native; drafts/navigation; domain pending | 66, 73, 76, 77, 78, 99 | Individual comparison pending |
| 66 | `XdLlM` | `efAym` | Personalization / Partners | 390×844 | `/mobile/66` · MobileScreen | Native; drafts/navigation; domain pending | 67, 72 | Individual comparison pending |
| 67 | `i7Spfd` | `FZlSF` | Personalization / Partner identity | 390×844 | `/mobile/67` · MobileScreen | Native; drafts/navigation; domain pending | 68 | Individual comparison pending |
| 68 | `rJbSj` | `LTG4A` | Personalization / Partner personality | 390×931 | `/mobile/68` · MobileScreen | Native; drafts/navigation; domain pending | 67, 69 | Individual comparison pending |
| 69 | `PZQiZ` | `l5bNRp` | Personalization / Partner model & tools | 390×870 | `/mobile/69` · MobileScreen | Native; drafts/navigation; domain pending | 18, 68, 70, 119 | Individual comparison pending |
| 70 | `NxEP2` | `Fp9Ky` | Personalization / Partner library | 390×844 | `/mobile/70` · MobileScreen | Native; drafts/navigation; domain pending | 40, 69, 71 | Individual comparison pending |
| 71 | `hscGh` | `jot8D` | Personalization / Review partner | 390×870 | `/mobile/71` · MobileScreen | Native; drafts/navigation; domain pending | 67, 68, 69, 70 | Individual comparison pending |
| 72 | `E4mXhy` | `Iv1MS` | Personalization / Partner group | 390×1044 | `/mobile/72` · MobileScreen | Native; drafts/navigation; domain pending | 67 | Individual comparison pending |
| 73 | `Y3LeV` | `Fr6Wh` | Personalization / Personas & skills | 390×1008 | `/mobile/73` · MobileScreen | Native; drafts/navigation; domain pending | 74, 75, 130 | Individual comparison pending |
| 74 | `Ufiyj` | `bhuUy` | Personalization / Create a playbook | 390×1007 | `/mobile/74` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 75 | `X2GMMQ` | `L1V0V` | Personalization / Find extensions | 390×1018 | `/mobile/75` · MobileScreen | Native; drafts/navigation; domain pending | 117 | Individual comparison pending |
| 76 | `E47Jas` | `kgb6l` | Personalization / Connect MCP service | 390×1084 | `/mobile/76` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 77 | `t5ao8B` | `K3g15t` | Personalization / Subagents & imports | 390×844 | `/mobile/77` · MobileScreen | Native; drafts/navigation; domain pending | 99, 123 | Individual comparison pending |
| 78 | `HDQwP` | `hn6d5` | Personalization / Memory | 390×844 | `/mobile/78` · MobileScreen | Native; drafts/navigation; domain pending | 79, 80, 102 | Individual comparison pending |
| 79 | `u5xkwD` | `BmvRl` | Personalization / Memory workbench | 390×1098 | `/mobile/79` · MobileScreen | Native; drafts/navigation; domain pending | 18, 80 | Individual comparison pending |
| 80 | `a3aWP` | `y9w7AC` | Personalization / Memory evidence | 390×914 | `/mobile/80` · MobileScreen | Native; drafts/navigation; domain pending | 79 | Individual comparison pending |
| 81 | `wAVjN` | `cCr3w` | Settings / Settings | 390×1010 | `/mobile/81` · MobileScreen | Native; drafts/navigation; domain pending | 88, 141, 142, 143, 144, 145, 146 | Compared in browser |
| 82 | `hK3wN` | `atAjS` | Settings / General | 390×1089 | `/mobile/82` · MobileScreen | Native; drafts/navigation; domain pending | 89, 91, 106, 143 | Individual comparison pending |
| 83 | `J2A49F` | `NVFkQ` | Settings / Appearance | 390×1290 | `/mobile/83` · MobileScreen | Native; local flow + pending domain actions | Runtime local action / pending domain flow | Compared in browser |
| 84 | `x5KnFw` | `KGTX9` | Settings / Workspaces | 390×844 | `/mobile/84` · MobileScreen | Native; drafts/navigation; domain pending | 85 | Individual comparison pending |
| 85 | `Sye7t` | `c6XXMI` | Settings / Workspace details | 390×896 | `/mobile/85` · MobileScreen | Native; drafts/navigation; domain pending | 26, 40 | Individual comparison pending |
| 86 | `HcvYD` | `NJV9P` | Settings / Data migration | 390×1307 | `/mobile/86` · MobileScreen | Native; drafts/navigation; domain pending | 27, 40, 87, 122 | Individual comparison pending |
| 87 | `A2wyH5` | `wS7fj` | Settings / Review migration | 390×844 | `/mobile/87` · MobileScreen | Native; drafts/navigation; domain pending | 84, 122 | Individual comparison pending |
| 88 | `qBIgS` | `jV7TW` | Settings / Usage statistics | 390×1019 | `/mobile/88` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 89 | `HtqZ4` | `T8N3M` | Services / Providers | 390×844 | `/mobile/89` · MobileScreen | Native; drafts/navigation; domain pending | 90, 94 | Individual comparison pending |
| 90 | `psMFN` | `KDc3t` | Services / Provider connection | 390×844 | `/mobile/90` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 91 | `IreNY` | `f0rYQ` | Services / Models | 390×972 | `/mobile/91` · MobileScreen | Native; drafts/navigation; domain pending | 92, 95 | Individual comparison pending |
| 92 | `FslaO` | `aL3kX` | Services / Model configuration | 390×882 | `/mobile/92` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 93 | `vp5W2` | `fut21` | Services / Task models | 390×844 | `/mobile/93` · MobileScreen | Native; drafts/navigation; domain pending | 10, 101, 118 | Individual comparison pending |
| 94 | `wKNze` | `j3mxh` | Services / Search service | 390×844 | `/mobile/94` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 95 | `zmqvJ` | `yLJFK` | Services / Voice & playback | 390×844 | `/mobile/95` · MobileScreen | Native; drafts/navigation; domain pending | 92 | Individual comparison pending |
| 96 | `R8ZM3Y` | `qwS93` | Services / Media generation | 390×844 | `/mobile/96` · MobileScreen | Native; drafts/navigation; domain pending | 92 | Individual comparison pending |
| 97 | `EeBOY` | `xiSVC` | Settings / Attachments | 390×894 | `/mobile/97` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 98 | `bkoBY` | `U9WY1` | Settings / Video learning | 390×844 | `/mobile/98` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 99 | `oG2Pv` | `HXimi` | Settings / Agents | 390×1202 | `/mobile/99` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 100 | `YYgSq` | `CUy6A` | Settings / Document parsing | 390×1308 | `/mobile/100` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 101 | `H31Yh` | `DsfLB` | Settings / Conversation | 390×844 | `/mobile/101` · MobileScreen | Native; drafts/navigation; domain pending | 118 | Individual comparison pending |
| 102 | `wSMU3` | `Ocptb` | Settings / Memory processing | 390×1838 | `/mobile/102` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 103 | `OIisv` | `jLrXB` | Settings / Capabilities | 390×2697 | `/mobile/103` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 104 | `CysOq` | `qXfZg` | Settings / Tools | 390×950 | `/mobile/104` · MobileScreen | Native; drafts/navigation; domain pending | 119, 120 | Individual comparison pending |
| 105 | `n2L4z` | `Q9wz5g` | Administration / Network | 390×1511 | `/mobile/105` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 106 | `CcWYk` | `URMyY` | Administration / Runtime status | 390×1402 | `/mobile/106` · MobileScreen | Native; drafts/navigation; domain pending | 98, 100, 103, 104, 121, 143 | Individual comparison pending |
| 107 | `fIAKv` | `ASlSJ` | Administration / About DeepTutor | 390×902 | `/mobile/107` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 108 | `L4A56m` | `Szr1b` | Library / Archived chats | 390×844 | `/mobile/108` · MobileScreen | Native; local flow + pending domain actions | Runtime local action / pending domain flow | Individual comparison pending |
| 109 | `voMpt` | `LEBDm` | Administration / User management | 390×844 | `/mobile/109` · MobileScreen | Native; drafts/navigation; domain pending | 110, 111 | Individual comparison pending |
| 110 | `R2JbPQ` | `fS1wh` | Administration / Add user | 390×844 | `/mobile/110` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 111 | `akbFY` | `E85hW` | Administration / Import users | 390×844 | `/mobile/111` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 112 | `UMq2C` | `DHoGp` | States / Review deletion | 390×844 | `/mobile/112` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 113 | `Sf2Jt` | `X6Zdb` | States / Changes saved | 390×844 | `/mobile/113` · MobileScreen | Native; drafts/navigation; domain pending | 81 | Individual comparison pending |
| 114 | `qe4ki` | `SLCqe` | States / Connection unavailable | 390×844 | `/mobile/114` · MobileScreen | Native; drafts/navigation; domain pending | 13, 81 | Individual comparison pending |
| 115 | `siSHO` | `wohCh` | States / Questions imported | 390×844 | `/mobile/115` · MobileScreen | Native; drafts/navigation; domain pending | 33, 37 | Individual comparison pending |
| 116 | `CzLWi` | `suBj8` | States / No search results | 390×844 | `/mobile/116` · MobileScreen | Native; drafts/navigation; domain pending | 26 | Individual comparison pending |
| 117 | `C0oKTm` | `RSJ6o` | Personalization / Extension details | 390×844 | `/mobile/117` · MobileScreen | Native; drafts/navigation; domain pending | 75, 76 | Individual comparison pending |
| 118 | `rbT7B` | `x1iuNn` | Services / Task overrides | 390×1278 | `/mobile/118` · MobileScreen | Native; drafts/navigation; domain pending | 18 | Individual comparison pending |
| 119 | `fF39q` | `e8T4tT` | Settings / Tool directory | 390×10520 | `/mobile/119` · MobileScreen | Native; drafts/navigation; domain pending | 120 | Individual comparison pending |
| 120 | `FKI3i` | `ChyOt` | Settings / Tool details | 390×844 | `/mobile/120` · MobileScreen | Native; drafts/navigation; domain pending | 143 | Individual comparison pending |
| 121 | `TLMSm` | `gT111` | Administration / Modules | 390×2790 | `/mobile/121` · MobileScreen | Native; drafts/navigation; domain pending | 106 | Individual comparison pending |
| 122 | `Q14xC` | `YnCeZ` | Settings / Migration bundles | 390×2520 | `/mobile/122` · MobileScreen | Native; drafts/navigation; domain pending | 9, 10, 27, 39, 40 | Individual comparison pending |
| 123 | `v2qn7k` | `jM68L` | Personalization / Import conversations | 390×844 | `/mobile/123` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 124 | `Tog9e` | `WWQmb` | Tutor / Research options | 390×844 | `/mobile/124` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 125 | `FyVjG` | `maNQI` | Tutor / Who answers | 390×916 | `/mobile/125` · MobileScreen | Native; drafts/navigation; domain pending | 67, 72, 99 | Individual comparison pending |
| 126 | `YKHMT` | `C9U3t` | Learning / Learning actions | 390×1104 | `/learning` / `view=study overflow` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 3, 4, 5, 37, 153, 154 | Individual comparison pending |
| 127 | `Z8cfDB` | `jJi1S` | Learning / Review strategies | 390×844 | `/learning` / `view=strategies` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | Runtime local action / pending domain flow | Individual comparison pending |
| 128 | `AFntW` | `psR0y` | Knowledge / Web sources | 390×1268 | `/mobile/128` · MobileScreen | Native; drafts/navigation; domain pending | 48 | Individual comparison pending |
| 129 | `UDlc0` | `etwql` | Plan / Task appearance | 390×844 | `/mobile/129` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 130 | `bPDy2` | `j8poIG` | Library / Manage tags | 390×844 | `/mobile/130` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 131 | `qBCPO` | `xtS37` | Learning / Module 2 | 390×1080 | `/learning` / `view=module` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 5 | Individual comparison pending |
| 132 | `JEMVb` | `D8RyO` | Learning / Module 3 | 390×982 | `/learning` / `view=module` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 5 | Individual comparison pending |
| 133 | `H56XFV` | `NqVNL` | Learning / Module 4 | 390×1004 | `/learning` / `view=module` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 5 | Individual comparison pending |
| 134 | `kxbKB` | `RIo1P` | Learning / Module 5 | 390×982 | `/learning` / `view=module` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 5 | Individual comparison pending |
| 135 | `Yja0Q` | `y1ljt1` | Learning / Module 6 | 390×1102 | `/learning` / `view=module` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 5 | Individual comparison pending |
| 136 | `RrYsk` | `HMZgk` | Learning / Module 7 | 390×1032 | `/learning` / `view=module` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 5 | Individual comparison pending |
| 137 | `S3tx9g` | `OGDxL` | Learning / Learning goal | 390×1050 | `/learning` / `view=goal` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 12 | Individual comparison pending |
| 138 | `KVyuF` | `cTVpE` | Account / Avatar | 390×849 | `/mobile/138` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 139 | `ApkqK` | `xQnfU` | Account / Device sign-in | 390×844 | `/mobile/139` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 140 | `C9MxCS` | `c2Dnz` | Knowledge / Library move | 390×844 | `/mobile/140` · MobileScreen | Native; drafts/navigation; domain pending | Runtime local action / pending domain flow | Individual comparison pending |
| 141 | `uy7Ve` | `eHYBb` | Settings / Preferences | 390×844 | `/mobile/141` · MobileScreen | Native; drafts/navigation; domain pending | 82, 83, 101 | Individual comparison pending |
| 142 | `GbyMz` | `VuSaZ` | Settings / Workspaces & data | 390×844 | `/mobile/142` · MobileScreen | Native; drafts/navigation; domain pending | 84, 86, 108 | Individual comparison pending |
| 143 | `mhL8r` | `IlHDl` | Settings / Models & services | 390×844 | `/mobile/143` · MobileScreen | Native; drafts/navigation; domain pending | 89, 91, 93, 94, 95, 96 | Individual comparison pending |
| 144 | `t71FQj` | `iy1vW` | Settings / Learning tools | 390×844 | `/mobile/144` · MobileScreen | Native; drafts/navigation; domain pending | 58, 97, 98, 100, 102 | Individual comparison pending |
| 145 | `khoTC` | `OfH4X` | Settings / Advanced | 390×844 | `/mobile/145` · MobileScreen | Native; drafts/navigation; domain pending | 99, 103, 104 | Individual comparison pending |
| 146 | `MUDwO` | `GkRF4` | Settings / Administration | 390×844 | `/mobile/146` · MobileScreen | Native; drafts/navigation; domain pending | 105, 106, 107, 109 | Individual comparison pending |
| 147 | `PpChT` | `JoQ7E` | Knowledge / Node.js & TypeScript | 390×1169 | `/mobile/147` · MobileScreen | Native; drafts/navigation; domain pending | 12, 44, 45, 50, 51 | Individual comparison pending |
| 148 | `uaPKa` | `fN246` | Knowledge / Software Architecture | 390×891 | `/mobile/148` · MobileScreen | Native; drafts/navigation; domain pending | 12, 44, 45, 50, 51 | Individual comparison pending |
| 149 | `b8nD83` | `dGDo6` | Knowledge / System Design & Distributed Systems | 390×844 | `/mobile/149` · MobileScreen | Native; drafts/navigation; domain pending | 12, 44, 45, 50, 51 | Individual comparison pending |
| 150 | `EQb2N` | `K1zNA6` | Knowledge / Practical Challenges & Engineering Exercises | 390×844 | `/mobile/150` · MobileScreen | Native; drafts/navigation; domain pending | 12, 44, 45, 50, 51 | Individual comparison pending |
| 151 | `WtX78` | `Gjx3x` | Knowledge / Production Engineering, Reliability & Security | 390×872 | `/mobile/151` · MobileScreen | Native; drafts/navigation; domain pending | 12, 44, 45, 50, 51 | Individual comparison pending |
| 152 | `wn1Pu` | `EbIeH` | States / Delete conversation | 390×844 | `/mobile/152` · MobileScreen | Native; local flow + pending domain actions | 13 | Individual comparison pending |
| 153 | `KmqIP` | `EmQ3t` | States / Reset path progress | 390×844 | `/learning` / `view=reset confirmation` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 3 | Individual comparison pending |
| 154 | `u2rJcx` | `vtPMF` | States / Delete learning path | 390×844 | `/learning` / `view=delete confirmation` · live Learning screens | COMPLETE (core read/navigation) / PARTIAL (advanced operations); see current Learning matrix | 3 | Individual comparison pending |

## Assets, APIs and outstanding work

All rows depend on Inter, Lucide, native safe areas and the shared palette. Domain dependencies follow the screen family. Exact fields, typography, spacing, color references and hierarchy are retained in `editable-frames.json`; `frame-bounds.json` retains dimensions. The runtime snapshot is `src/features/mobile/screens.json`.

See [verification and remaining work](mobile-ui/pen-redesign/VERIFICATION.md) for the full audit, API/mock boundary, tests, visual discrepancies and resume checklist. The existing fixture APIs differ from the backend-engineering design data; they must not be relabeled as real server data. State routes 112–116 and 152–154 exist, but most operation-to-state transitions still need domain integration. Selection drafts are not necessarily applied to execution.
