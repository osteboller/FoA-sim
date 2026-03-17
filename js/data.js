const alienData = [
    // Bluespews (Aliens) - Gen 1
    { id: 1, name: "Messamolo", type: "blue", group: "Bluspews", img: "assets/aliens/Bluespews/messamolo.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 2, name: "Narco Morfist", type: "blue", group: "Bluspews", img: "assets/aliens/Bluespews/narco_morfist.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 3, name: "Sir Trance-A-Lot", type: "blue", group: "Bluspews", img: "assets/aliens/Bluespews/sir_trance-a-lot.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 4, name: "Sizzlehyde", type: "blue", group: "Bluspews", img: "assets/aliens/Bluespews/sizzlehyde.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 5, name: "Sulfuric Sultan", type: "blue", group: "Bluspews", img: "assets/aliens/Bluespews/sulfuric_sultan.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 6, name: "The Disaster", type: "blue", group: "Bluspews", img: "assets/aliens/Bluespews/the_disaster.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    // Bluespews (Aliens) - Gen 2
    { id: 7, name: "Fritz Frier", type: "blue", group: "Bluspews", img: "assets/aliens/Bluespews/fritz_frier.gif", release: 'gen_2', rarity: 'uncommon', powerRange: [5, 17] },
    { id: 8, name: "The Liquidator", type: "blue", group: "Bluspews", img: "assets/aliens/Bluespews/the_liquidator.gif", release: 'gen_2', rarity: 'uncommon', powerRange: [5, 17] },
    // Bluespews (Aliens) - Exclusives
    { id: 9, name: "Double Trouble", type: "blue", group: "Bluspews", img: "assets/aliens/Bluespews/double_trouble.gif", release: 'italian', rarity: 'rare', powerRange: [7, 18] },
    { id: 10, name: "Psycho Licious", type: "blue", group: "Bluspews", img: "assets/aliens/Bluespews/psycho_licious.gif", release: 'japanese', rarity: 'legendary', powerRange: [8, 20] },

    // Dredrocks (Aliens) - Gen 1
    { id: 11, name: "Crassinova", type: "red", group: "Dredrocks", img: "assets/aliens/Dredrocks/crassinova.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 12, name: "Xtravator", type: "red", group: "Dredrocks", img: "assets/aliens/Dredrocks/xtravator.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 13, name: "Heartless Wonder", type: "red", group: "Dredrocks", img: "assets/aliens/Dredrocks/heartless_wonder.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 14, name: "Quad-Eye Moto", type: "red", group: "Dredrocks", img: "assets/aliens/Dredrocks/quad-eye_moto.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 15, name: "Slam Rock", type: "red", group: "Dredrocks", img: "assets/aliens/Dredrocks/slam_rock.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 16, name: "Sumo Stumpo", type: "red", group: "Dredrocks", img: "assets/aliens/Dredrocks/sumo_stumpo.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    // Dredrocks (Aliens) - Gen 2
    { id: 17, name: "Bendzonian", type: "red", group: "Dredrocks", img: "assets/aliens/Dredrocks/bendzonian.gif", release: 'gen_2', rarity: 'uncommon', powerRange: [5, 17] },
    { id: 18, name: "Jawbreaker", type: "red", group: "Dredrocks", img: "assets/aliens/Dredrocks/jawbreaker.gif", release: 'gen_2', rarity: 'uncommon', powerRange: [5, 17] },
    // Dredrocks (Aliens) - Exclusives
    { id: 19, name: "Fang Face", type: "red", group: "Dredrocks", img: "assets/aliens/Dredrocks/fang_face.gif", release: 'italian', rarity: 'rare', powerRange: [7, 18] },
    { id: 20, name: "Alexoid Flexoid", type: "red", group: "Dredrocks", img: "assets/aliens/Dredrocks/alexoid_flexoid.gif", release: 'japanese', rarity: 'legendary', powerRange: [8, 20] },

    // Gangreens (Aliens) - Gen 1
    { id: 21, name: "Burp N Bake", type: "green", group: "Gangreens", img: "assets/aliens/Gangreens/burp_n_bake.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 22, name: "Clawz Battsky", type: "green", group: "Gangreens", img: "assets/aliens/Gangreens/clawz_battsky.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 23, name: "Killapede", type: "green", group: "Gangreens", img: "assets/aliens/Gangreens/killapede.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 24, name: "Nitz Clawsom", type: "green", group: "Gangreens", img: "assets/aliens/Gangreens/nitz_clawsom.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 25, name: "Schlott Schott", type: "green", group: "Gangreens", img: "assets/aliens/Gangreens/schlott_schott.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    { id: 26, name: "Sucktoria", type: "green", group: "Gangreens", img: "assets/aliens/Gangreens/sucktoria.gif", release: 'gen_1', rarity: 'common', powerRange: [1, 15] },
    // Gangreens (Aliens) - Gen 2
    { id: 27, name: "Bugsy Tallone", type: "green", group: "Gangreens", img: "assets/aliens/Gangreens/bugsy_tallone.gif", release: 'gen_2', rarity: 'uncommon', powerRange: [5, 17] },
    { id: 28, name: "Slimy Slurper", type: "green", group: "Gangreens", img: "assets/aliens/Gangreens/slimy_slurper.gif", release: 'gen_2', rarity: 'uncommon', powerRange: [5, 17] },
    // Gangreens (Aliens) - Exclusives
    { id: 29, name: "Chlorosis", type: "green", group: "Gangreens", img: "assets/aliens/Gangreens/chlorosis.gif", release: 'italian', rarity: 'rare', powerRange: [7, 18] },
    { id: 30, name: "Mucosis", type: "green", group: "Gangreens", img: "assets/aliens/Gangreens/mucosis.gif", release: 'japanese', rarity: 'legendary', powerRange: [8, 20] },

    // Mutants - Gen 1
    { id: 31, name: "Biospewer", type: "hybrid", group: "Mutants", c1: "green", c2: "blue", img: "assets/mutants/biospewer.gif", powerRange: [9, 18], release: "gen_1" },
    { id: 32, name: "Doc Acidonian", type: "hybrid", group: "Mutants", c1: "red", c2: "blue", img: "assets/mutants/doc_acidonian.gif", powerRange: [19, 28], release: "gen_1" },
    { id: 33, name: "Maggatosis", type: "hybrid", group: "Mutants", c1: "green", c2: "red", img: "assets/mutants/maggatosis.gif", powerRange: [19, 28], release: "gen_1" },
    { id: 34, name: "Psychonator", type: "hybrid", group: "Mutants", c1: "red", c2: "blue", img: "assets/mutants/psychonator.gif", powerRange: [9, 18], release: "gen_1" },
    { id: 35, name: "Sgt. Spewspittle", type: "hybrid", group: "Mutants", c1: "green", c2: "blue", img: "assets/mutants/sgt._spewspittle.gif", powerRange: [19, 28], release: "gen_1" },
    { id: 36, name: "Slurpmaniac", type: "hybrid", group: "Mutants", c1: "blue", c2: "green", img: "assets/mutants/slurpmaniac.gif", powerRange: [9, 18], release: "gen_1" },
    { id: 37, name: "Spinal Mutosis", type: "hybrid", group: "Mutants", c1: "green", c2: "red", img: "assets/mutants/spinal_mutosis.gif", powerRange: [9, 18], release: "gen_1" },
    { id: 38, name: "The Psycho Rocker", type: "hybrid", group: "Mutants", c1: "blue", c2: "red", img: "assets/mutants/the_psycho_rocker.gif", powerRange: [9, 18], release: "gen_1" },
    { id: 39, name: "The Shredder", type: "hybrid", group: "Mutants", c1: "green", c2: "red", img: "assets/mutants/the_shredder.gif", powerRange: [9, 18], release: "gen_1" },
    // Mutants - Gen 2
    { id: 40, name: "Regenerator", type: "hybrid", group: "Mutants", c1: "blue", c2: "red", img: "assets/mutants/regenerator.gif", powerRange: [19, 28], release: "gen_2" },
    { id: 41, name: "Rocazilla", type: "hybrid", group: "Mutants", c1: "red", c2: "green", img: "assets/mutants/rocazilla.gif", powerRange: [19, 28], release: "gen_2" },
    { id: 42, name: "Scizzorian", type: "hybrid", group: "Mutants", c1: "green", c2: "blue", img: "assets/mutants/scizzorian.gif", powerRange: [19, 28], release: "gen_2" },
    
    // Secret Variants (Error Prints)
    { id: 43, name: "Mono Biospewer", type: "green", group: "Mutants", img: "assets/mutants/biospewer.gif", release: 'secret', rarity: 'ultra_rare', powerRange: [9, 18], cssFilter: "sepia(1) saturate(5) hue-rotate(60deg)" },
    { id: 44, name: "Mono Psychonator", type: "blue", group: "Mutants", img: "assets/mutants/psychonator.gif", release: 'secret', rarity: 'ultra_rare', powerRange: [9, 18], cssFilter: "sepia(1) saturate(5) hue-rotate(180deg)" },
    { id: 45, name: "Mono Slurpmaniac", type: "green", group: "Mutants", img: "assets/mutants/slurpmaniac.gif", release: 'secret', rarity: 'ultra_rare', powerRange: [9, 18], cssFilter: "sepia(1) saturate(5) hue-rotate(60deg)" },
    { id: 46, name: "Mono The Shredder", type: "red", group: "Mutants", img: "assets/mutants/the_shredder.gif", release: 'secret', rarity: 'ultra_rare', powerRange: [9, 18], cssFilter: "sepia(1) saturate(5) hue-rotate(-50deg)" },
    { id: 47, name: "Mono Spinal Mutosis", type: "red", group: "Mutants", img: "assets/mutants/spinal_mutosis.gif", release: 'secret', rarity: 'ultra_rare', powerRange: [9, 18], cssFilter: "sepia(1) saturate(5) hue-rotate(-50deg)" },
    { id: 48, name: "Mono The Psycho Rocker", type: "blue", group: "Mutants", img: "assets/mutants/the_psycho_rocker.gif", release: 'secret', rarity: 'ultra_rare', powerRange: [9, 18], cssFilter: "sepia(1) saturate(5) hue-rotate(180deg)" },

    // RAMMs (Metallic Mutants) - Wave 1
    { id: 51, name: "Rammmazoid", type: "metallic", group: "RAMMs", img: "assets/ramms/rammmazoid.gif", release: 'gen_1', rarity: 'super_rare', powerRange: [31, 35] },
    { id: 52, name: "Rammmbo", type: "metallic", group: "RAMMs", img: "assets/ramms/rammmbo.gif", release: 'gen_1', rarity: 'super_rare', powerRange: [31, 35] },
    { id: 53, name: "Rammmbini", type: "metallic", group: "RAMMs", img: "assets/ramms/rammmbini.gif", release: 'gen_1', rarity: 'super_rare', powerRange: [31, 35] },
    // RAMMs (Metallic Mutants) - Wave 2
    { id: 54, name: "Rammmajamma", type: "metallic", group: "RAMMs", img: "assets/ramms/rammmajamma.gif", release: 'gen_2', rarity: 'super_rare', powerRange: [31, 35] },
    { id: 55, name: "Rammmbler", type: "metallic", group: "RAMMs", img: "assets/ramms/rammmbler.gif", release: 'gen_2', rarity: 'super_rare', powerRange: [31, 35] },
    { id: 56, name: "Ramminide", type: "metallic", group: "RAMMs", img: "assets/ramms/ramminide.gif", release: 'gen_2', rarity: 'super_rare', powerRange: [31, 35] },
    // RAMMs (Metallic Mutants) - Wave 3 (Exclusives)
    { id: 57, name: "Rammopolis", type: "metallic", group: "RAMMs", img: "assets/ramms/rammopolis.gif", release: 'italian', rarity: 'super_rare', powerRange: [36, 40] },
    { id: 58, name: "Rammmutron", type: "metallic", group: "RAMMs", img: "assets/ramms/rammmutron.gif", release: 'japanese', rarity: 'super_rare', powerRange: [36, 40] },
    { id: 59, name: "Rammmaroid", type: "metallic", group: "RAMMs", img: "assets/ramms/rammmaroid.gif", release: 'us', rarity: 'super_rare', powerRange: [36, 40] },
    // Special Edition RAMMs - Elite Collector Club
    { id: 60, name: "Rammerface", type: "metallic", group: "RAMMs", img: "assets/special_edition_ramm_set/rammerface.gif", release: 'special_edition', rarity: 'ultra_rare', powerRange: [39, 44] },
    { id: 61, name: "Rammstash", type: "metallic", group: "RAMMs", img: "assets/special_edition_ramm_set/rammstash.gif", release: 'special_edition', rarity: 'ultra_rare', powerRange: [39, 44] },
    { id: 62, name: "Rammworm", type: "metallic", group: "RAMMs", img: "assets/special_edition_ramm_set/rammworm.gif", release: 'special_edition', rarity: 'ultra_rare', powerRange: [39, 44] },

    // Sciroids (Future Content - Pladsholdere)
    { id: 63, name: "Sciroid Alpha", type: "none", group: "Sciroids", img: "assets/sciroid_battleship/sm1.gif", release: 'battle_ship_exclusive', rarity: 'legendary', powerRange: [40, 45] },
    { id: 64, name: "Sciroid Beta", type: "none", group: "Sciroids", img: "assets/sciroid_battleship/sm2.gif", release: 'battle_ship_exclusive', rarity: 'legendary', powerRange: [40, 45] },

    // E-ramm (Jangutz Khan)
    { id: 65, name: "Jangutz Khan", type: "none", group: "E-ramm", img: "assets/jangutz_khan/jangutz_khan.gif", release: 'jangutz_exclusive', rarity: 'mythic', powerRange: [45, 50] },
];

const crystaliteData = [
    { id: 201, name: "Monsoon", type: "none", group: "Crystalites", img: "assets/pps/monsoon.gif", release: 'gen_1' },
    { id: 202, name: "Twister", type: "none", group: "Crystalites", img: "assets/pps/twister.gif", release: 'gen_1' },
    { id: 203, name: "Blaze", type: "none", group: "Crystalites", img: "assets/pps/blaze.gif", release: 'gen_1' }
];

const shadowData = [
    { id: 301, name: "Blackout", type: "none", group: "Shadows", img: "assets/pps/blackout.gif", release: 'gen_2' },
    { id: 302, name: "Dr. Dark", type: "none", group: "Shadows", img: "assets/pps/dr._dark.gif", release: 'gen_2' },
    { id: 303, name: "Eternal Abyss", type: "none", group: "Shadows", img: "assets/pps/eternal_abyss.gif", release: 'gen_2' }
];

const weaponData = [
    { id: 401, name: "Acid Icer", type: "blue", group: "Weapons", img: "assets/weapons/acid_icer.gif", release: 'gen_1' },
    { id: 402, name: "Ooze Wad", type: "green", group: "Weapons", img: "assets/weapons/ooze_wad.gif", release: 'gen_1' },
    { id: 403, name: "Rock Drocket", type: "red", group: "Weapons", img: "assets/weapons/rock_drocket.gif", release: 'gen_1' },
    { id: 404, name: "Discstroyer", type: "blue", group: "Weapons", img: "assets/weapons/discstroyer.gif", release: 'gen_2' },
    { id: 405, name: "Web Blaster", type: "green", group: "Weapons", img: "assets/weapons/web_blaster.gif", release: 'gen_2' },
    { id: 406, name: "Spykosphere", type: "red", group: "Weapons", img: "assets/weapons/spykosphere.gif", release: 'gen_2' },
    { id: 407, name: "Neutralizer", type: "weapon", group: "Weapons", img: "assets/weapons/neutralizer.gif", release: 'bs_ex' }
];

const cardData = [
    // Mutants - Gen 1
    { id: 101, name: "Biospewer Card", group: "Mutants", img: "assets/cards/mutants/biospewer.gif", relatedAlienId: 31, release: 'gen_1' },
    { id: 102, name: "Sgt. Spewspittle Card", group: "Mutants", img: "assets/cards/mutants/sgt._spewspittle.gif", relatedAlienId: 35, release: 'gen_1' },
    { id: 104, name: "Doc Acidonian Card", group: "Mutants", img: "assets/cards/mutants/doc_acidonian.gif", relatedAlienId: 32, release: 'gen_1' },
    { id: 105, name: "Maggotosis Card", group: "Mutants", img: "assets/cards/mutants/maggotosis.gif", relatedAlienId: 33, release: 'gen_1' },
    { id: 106, name: "Psyconator Card", group: "Mutants", img: "assets/cards/mutants/psyconator.gif", relatedAlienId: 34, release: 'gen_1' },
    { id: 109, name: "Slurpmaniac Card", group: "Mutants", img: "assets/cards/mutants/slurpmaniac.gif", relatedAlienId: 36, release: 'gen_1' },
    { id: 110, name: "Spinal Mutosis Card", group: "Mutants", img: "assets/cards/mutants/spinal_mutosis.gif", relatedAlienId: 37, release: 'gen_1' },
    { id: 111, name: "The Psycho Rocker Card", group: "Mutants", img: "assets/cards/mutants/the_psycho_rocker.gif", relatedAlienId: 38, release: 'gen_1' },
    { id: 112, name: "The Shredder Card", group: "Mutants", img: "assets/cards/mutants/the_shredder.gif", relatedAlienId: 39, release: 'gen_1' },
    
    // Mutants - Gen 2 (Reborn)
    { id: 103, name: "Scizzorian Card", group: "Mutants", img: "assets/cards/mutants/scizzorian.gif", relatedAlienId: 42, release: 'gen_2' },
    { id: 107, name: "Regenerator Card", group: "Mutants", img: "assets/cards/mutants/regenerator.gif", relatedAlienId: 40, release: 'gen_2' },
    { id: 108, name: "Rocazilla Card", group: "Mutants", img: "assets/cards/mutants/rocazilla.gif", relatedAlienId: 41, release: 'gen_2' },

    // Crystalites (Power Players - Gen 1)
    { id: 251, name: "Monsoon Card", group: "Crystalites", img: "assets/cards/pps/monsoon.gif", relatedAlienId: 201, release: 'gen_1' },
    { id: 252, name: "Twister Card", group: "Crystalites", img: "assets/cards/pps/twister.gif", relatedAlienId: 202, release: 'gen_1' },
    { id: 253, name: "Blaze Card", group: "Crystalites", img: "assets/cards/pps/blaze.gif", relatedAlienId: 203, release: 'gen_1' },

    // Shadows (Power Players - Gen 2)
    { id: 351, name: "Blackout Card", group: "Shadows", img: "assets/cards/pps/blackout.gif", relatedAlienId: 301, release: 'gen_2' },
    { id: 352, name: "Dr. Dark Card", group: "Shadows", img: "assets/cards/pps/dr._dark.gif", relatedAlienId: 302, release: 'gen_2' },
    { id: 353, name: "Eternal Abyss Card", group: "Shadows", img: "assets/cards/pps/eternal_abyss.gif", relatedAlienId: 303, release: 'gen_2' },

    // RAMMs Kort
    { id: 151, name: "Gen 1 RAMMs Card", group: "RAMMs", img: "assets/cards/ramms/gen1_ramms.gif", relatedAlienId: [51, 52, 53], release: 'gen_1' },
    { id: 152, name: "Gen 2 RAMMs Card", group: "RAMMs", img: "assets/cards/ramms/gen2_ramms.gif", relatedAlienId: [54, 55, 56], release: 'gen_2' },
    { id: 153, name: "Exclusive RAMMs Card", group: "RAMMs", img: "assets/cards/ramms/exclusive_ramms.gif", relatedAlienId: [57, 58, 59], release: 'exclusive' },
    { id: 154, name: "Special Edition RAMMs Card", group: "RAMMs", img: "assets/cards/ramms/special_ramms.gif", relatedAlienId: [60, 61, 62], release: 'special_edition' }, // Tilføjet

    // Weapons
    { id: 451, name: "Acid Icer Card", group: "Weapons", img: "assets/cards/weapons/acid_icer.gif", relatedAlienId: 401, release: 'gen_1' },
    { id: 452, name: "Ooze Wad Card", group: "Weapons", img: "assets/cards/weapons/ooze_wad.gif", relatedAlienId: 402, release: 'gen_1' },
    { id: 453, name: "Rock Drocket Card", group: "Weapons", img: "assets/cards/weapons/rock_drocket.gif", relatedAlienId: 403, release: 'gen_1' },
    { id: 457, name: "Neutralizer Card", group: "Weapons", img: "assets/cards/weapons/neutralizer.gif", relatedAlienId: 407, release: 'gen_1' },
    { id: 454, name: "Discstroyer Card", group: "Weapons", img: "assets/cards/weapons/discstroyer.gif", relatedAlienId: 404, release: 'gen_2' },
    { id: 455, name: "Web Blaster Card", group: "Weapons", img: "assets/cards/weapons/web_blaster.gif", relatedAlienId: 405, release: 'gen_2' },
    { id: 456, name: "Spykosphere Card", group: "Weapons", img: "assets/cards/weapons/spykosphere.gif", relatedAlienId: 406, release: 'gen_2' },

    // E-ramm (Special)
    { id: 165, name: "Jangutz Khan Card", group: "E-ramm", img: "assets/cards/jangutz_khan/jangutz_khan.gif", relatedAlienId: 65, release: 'jangutz_exclusive' },
    { id: 166, name: "SciRoid Battleship Card", group: "Sciroids", img: "assets/cards/sciroid battleship/SciRoid Battleship.gif", release: 'battle_ship_exclusive' },
    { id: 167, name: "SciRoid Masters Card", group: "Sciroids", img: "assets/cards/sciroid battleship/SciRoid Masters.gif", release: 'battle_ship_exclusive' },
    { id: 168, name: "Space Pod Card", group: "Pods", img: "assets/cards/space_pod.gif", release: 'gen_1' }
];

const achievementsData = [
    // --- KLIK-BEDRIFTER (The Clicker) ---
    { id: 'click100', name: 'Fingertræning', desc: 'Klik 100 gange', target: 100, type: 'clicks', reward: 100 },
    { id: 'click1000', name: 'Klik-amok', desc: 'Klik 1.000 gange', target: 1000, type: 'clicks', reward: 500 },
    { id: 'click5000', name: 'Klik-mester', desc: 'Klik 5.000 gange', target: 5000, type: 'clicks', reward: 2000 },
    { id: 'click25000', name: 'Senebetændelse?', desc: 'Klik 25.000 gange', target: 25000, type: 'clicks', reward: 5000 },
    { id: 'click100000', name: 'Musens Overmand', desc: 'Klik 100.000 gange', target: 100000, type: 'clicks', reward: 15000 },

    // --- ØKONOMI (The Tycoon) ---
    { id: 'dust1000', name: 'Sparegris', desc: 'Tjen 1.000 Kr. totalt', target: 1000, type: 'dust', reward: 250 },
    { id: 'dust10000', name: 'Rigmand', desc: 'Tjen 10.000 Kr. totalt', target: 10000, type: 'dust', reward: 1000 },
    { id: 'dust50000', name: 'Lommepenge-konge', desc: 'Tjen 50.000 Kr. totalt', target: 50000, type: 'dust', reward: 5000 },
    { id: 'dust250000', name: 'Direktøren', desc: 'Tjen 250.000 Kr. totalt', target: 250000, type: 'dust', reward: 12500 },
    { id: 'dust1000000', name: 'Millionær-klubben', desc: 'Tjen 1.000.000 Kr. totalt', target: 1000000, type: 'dust', reward: 50000 },

    // --- SAMLING (The Collector) ---
    { id: 'collect10', name: 'Samler', desc: 'Ejer 10 unikke Aliens', target: 10, type: 'collection', reward: 200 },
    { id: 'collect20', name: 'Samler-Pro', desc: 'Ejer 20 unikke Aliens', target: 20, type: 'collection', reward: 1000 },
    { id: 'collect40', name: 'Gotta Catch \'Em All', desc: 'Ejer 40 unikke Aliens', target: 40, type: 'collection', reward: 5000 },
    { id: 'collect_all', name: 'Galaktisk Museum', desc: 'Ejer 60 unikke figurer', target: 60, type: 'collection', reward: 25000 },
    { id: 'collect_rare', name: 'Sjælden Jæger', desc: 'Ejer 5 Rare figurer', target: 5, type: 'rarity_rare', reward: 2000 },
    { id: 'collect_legendary', name: 'Legende-tæmmer', desc: 'Find din første Legendary Alien', target: 1, type: 'rarity_legendary', reward: 5000 },
    { id: 'collect_mythic', name: 'Guddommelig Samler', desc: 'Find Jangutz Khan', target: 1, type: 'rarity_mythic', reward: 10000 },

    // --- ARENA & KAMP (The Gladiator) ---
    { id: 'win10', name: 'Gladiator', desc: 'Vind 10 Arena kampe', target: 10, type: 'wins', reward: 500 },
    { id: 'win50', name: 'Arena Legende', desc: 'Vind 50 Arena kampe', target: 50, type: 'wins', reward: 2500 },
    { id: 'win200', name: 'Uovervindelig', desc: 'Vind 200 Arena kampe', target: 200, type: 'wins', reward: 10000 },
    { id: 'win500', name: 'Arenaens Hersker', desc: 'Vind 500 Arena kampe', target: 500, type: 'wins', reward: 30000 },

    // --- LEVEL PROGRESSION (The Student) ---
    { id: 'level6', name: 'Skolegården', desc: 'Nå til Skolegården (Niveau 6)', target: 6, type: 'level', reward: 500 },
    { id: 'level10', name: 'Storebæltsbroen', desc: 'Nå Niveau 10', target: 10, type: 'level', reward: 2000 },
    { id: 'level20', name: 'Udkanten af Byen', desc: 'Nå Niveau 20', target: 20, type: 'level', reward: 5000 },
    { id: 'level50', name: 'Intergalaktisk Rejsende', desc: 'Nå Niveau 50', target: 50, type: 'level', reward: 20000 },

    // --- SPECIFIKKE GRUPPER (The Specialist) ---
    { id: 'group_bluespews', name: 'Blå Feber', desc: 'Saml alle 10 Bluespews', target: 10, type: 'group_Bluespews', reward: 3000 },
    { id: 'group_dredrocks', name: 'Stenhård', desc: 'Saml alle 10 Dredrocks', target: 10, type: 'group_Dredrocks', reward: 3000 },
    { id: 'group_gangreens', name: 'Slimet Succes', desc: 'Saml alle 10 Gangreens', target: 10, type: 'group_Gangreens', reward: 3000 },
    { id: 'group_ramms', name: 'Metal-hoved', desc: 'Saml alle 12 RAMMs', target: 12, type: 'group_RAMMs', reward: 7500 },
    { id: 'group_mutants', name: 'Hybrid-forsker', desc: 'Ejer 10 forskellige Mutanter', target: 10, type: 'group_Mutants', reward: 5000 },

    // --- HEMMELIGHEDER & VARIANTER (The Ghost) ---
    { id: 'secret_mono', name: 'Fejlprint-jæger', desc: 'Find din første Mono Variant', target: 1, type: 'rarity_secret', reward: 7500 },
    { id: 'all_monos', name: 'Fejlfri Fejl-samling', desc: 'Saml alle 6 Mono Mutanter', target: 6, type: 'group_Monos', reward: 25000 },

    // --- NEDERLAG (Lær af dine fejl) ---
    { id: 'lose10', name: 'Lærepenge', desc: 'Tab 10 Arena kampe', target: 10, type: 'losses', reward: 250 },
    { id: 'lose50', name: 'Hård Hud', desc: 'Tab 50 Arena kampe', target: 50, type: 'losses', reward: 1000 },
    { id: 'lose100', name: 'Uheldig Kartoffel', desc: 'Tab 100 Arena kampe', target: 100, type: 'losses', reward: 5000 },

    // --- SHOP & OPGRADERINGER (Baseret på taskData) ---
    // Der er 5 manuelle og 5 passive opgaver med hver 5 niveauer = 50 opgraderinger totalt
    { id: 'upgrades_10', name: 'Ildsjæl', desc: 'Køb 10 opgraderinger i shoppen', target: 10, type: 'upgrades_total', reward: 1000 },
    { id: 'upgrades_manual_max', name: 'Arbejdsmand', desc: 'Køb alle 25 opgraderinger til manuelle pligter', target: 25, type: 'upgrades_manual', reward: 5000 },
    { id: 'upgrades_passive_max', name: 'Automations-ekspert', desc: 'Køb alle 25 opgraderinger til faste indtægter', target: 25, type: 'upgrades_passive', reward: 5000 },
    { id: 'upgrades_all', name: 'Fuldt Ekviperet', desc: 'Køb samtlige 50 opgraderinger i spillet', target: 50, type: 'upgrades_total', reward: 25000 },

    // --- POWER ROLLS (Perfektion) ---
    { id: 'max_power_1', name: 'Perfekt Rul', desc: 'Få en Alien med dens absolut maksimale Power', target: 1, type: 'max_power', reward: 2000 },
    { id: 'max_power_10', name: 'Perfektionist', desc: 'Ejer 10 Aliens med maksimal Power', target: 10, type: 'max_power', reward: 15000 }
];

const taskData = {
    // --- MANUELLE PLIGTER (Kr. pr. klik) ---
    pant: {
        name: "Samle Pant", type: 'manual', icon: '🍾',
        upgrades: [
            { name: "Lille Pose", cost: 10, power: 0.25 },
            { name: "Stor Sæk", cost: 100, power: 1.0 },
            { name: "Indkøbsvogn", cost: 500, power: 5.0 },
            { name: "Pant-bil", cost: 2500, power: 25.0 },
            { name: "Pant-imperium", cost: 10000, power: 100.0 }
        ]
    },
    hunde: {
        name: "Lufte Hunde", type: 'manual', icon: '🦮',
        upgrades: [
            { name: "Naboens Puddel", cost: 50, power: 0.5 },
            { name: "Hundelufter-rute", cost: 250, power: 2.5 },
            { name: "Hunde-pension", cost: 1500, power: 15.0 },
            { name: "Træningscenter", cost: 7500, power: 75.0 },
            { name: "Hunde-konge", cost: 30000, power: 300.0 }
        ]
    },
    stakit: {
        name: "Male Stakit", type: 'manual', icon: '🖌️',
        upgrades: [
            { name: "Gammel Pensel", cost: 150, power: 2.0 },
            { name: "Rulle-sæt", cost: 1000, power: 10.0 },
            { name: "Sprøjtepistol", cost: 5000, power: 50.0 },
            { name: "Maler-team", cost: 20000, power: 200.0 },
            { name: "Ejendomsservice", cost: 100000, power: 1000.0 }
        ]
    },
    bil: {
        name: "Vaske Bil", type: 'manual', icon: '🧽',
        upgrades: [
            { name: "Spand & Svamp", cost: 500, power: 8.0 },
            { name: "Højtryksrenser", cost: 3000, power: 40.0 },
            { name: "Egen Indkørsel", cost: 15000, power: 200.0 },
            { name: "Mobil Vaskehall", cost: 75000, power: 1000.0 },
            { name: "Car-Wash Kæde", cost: 400000, power: 5000.0 }
        ]
    },
    skrald: {
        name: "Gå med Skrald", type: 'manual', icon: '🗑️',
        upgrades: [
            { name: "Køkkenposen", cost: 2000, power: 50.0 },
            { name: "Container-vagt", cost: 12000, power: 250.0 },
            { name: "Skraldemand-vikar", cost: 60000, power: 1200.0 },
            { name: "Genvinding-station", cost: 300000, power: 6000.0 },
            { name: "Miljø-gigant", cost: 1500000, power: 30000.0 }
        ]
    },

    // --- FASTE INDTÆGTER (Kr. pr. sekund) ---
    ugepenge: {
        name: "Ugepenge", type: 'passive', icon: '💰',
        upgrades: [
            { name: "Småmønter", cost: 100, power: 0.1 },
            { name: "Fast Aftale", cost: 500, power: 0.5 },
            { name: "Bonus-ordning", cost: 2000, power: 2.0 },
            { name: "Arv fra Onkel", cost: 10000, power: 10.0 },
            { name: "Trust-fund", cost: 50000, power: 50.0 }
        ]
    },
    lektier: {
        name: "Lektiehjælp", type: 'passive', icon: '📚',
        upgrades: [
            { name: "Lillebror", cost: 400, power: 0.4 },
            { name: "Klassekammerater", cost: 2000, power: 2.0 },
            { name: "Privatunderviser", cost: 8000, power: 8.0 },
            { name: "Online Kursus", cost: 40000, power: 40.0 },
            { name: "Akademi-ejer", cost: 200000, power: 200.0 }
        ]
    },
    avis: {
        name: "Avisrute", type: 'passive', icon: '🗞️',
        upgrades: [
            { name: "Lokalavisen", cost: 1500, power: 1.5 },
            { name: "Søndags-tillæg", cost: 7500, power: 7.5 },
            { name: "Distriktsleder", cost: 30000, power: 30.0 },
            { name: "Trykkeri-ejer", cost: 150000, power: 150.0 },
            { name: "Medie-mogul", cost: 750000, power: 750.0 }
        ]
    },
    robot_plæne: {
        name: "Robotplæne", type: 'passive', icon: '🤖',
        upgrades: [
            { name: "Brugt Robot", cost: 5000, power: 6.0 },
            { name: "Moderne Model", cost: 25000, power: 30.0 },
            { name: "Robot-flåde", cost: 100000, power: 120.0 },
            { name: "Satellit-styring", cost: 500000, power: 600.0 },
            { name: "AI Havepleje", cost: 2500000, power: 3000.0 }
        ]
    },
    robot_støv: {
        name: "Robotstøv", type: 'passive', icon: '🌀',
        upgrades: [
            { name: "Basis Støvsuger", cost: 12000, power: 15.0 },
            { name: "Mopper-kombi", cost: 60000, power: 75.0 },
            { name: "Selvtømmende Station", cost: 250000, power: 300.0 },
            { name: "Industriel Robot", cost: 1200000, power: 1500.0 },
            { name: "Holografisk Rengøring", cost: 6000000, power: 7500.0 }
        ]
    }
};