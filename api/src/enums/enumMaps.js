const enumMaps = {
  ctf_3: "ctf_3",
  ctf4_old: "ctf4_old",
  ctf_5: "ctf_5",
  ctf_cryochasm: "ctf_cryochasm",
  ctf_5_limited: "ctf_5_limited",
  ctf_duskwood: "ctf_duskwood",
  ctf_tantum: "ctf_tantum",
  ctf_mine: "ctf_mine",
  ctf_planet: "ctf_planet",
  ctf_ambiance: "ctf_ambiance",
  ctf_2: "ctf_2",
  ctf_mars: "ctf_mars",
  ctf_moon: "ctf_moon",
};

const enumMapsWithLabel = [
  // 2 vs 2
  { value: enumMaps.ctf_3, label: "ctf3" },
  { value: enumMaps.ctf4_old, label: "ctf4_old" },
  { value: enumMaps.ctf_5, label: "ctf5" },
  { value: enumMaps.ctf_5, label: "ctf5_spikes" },
  { value: enumMaps.ctf_cryochasm, label: "ctf_cryochasm" },
  { value: enumMaps.ctf_5_limited, label: "ctf5_limited" },
  { value: enumMaps.ctf_duskwood, label: "ctf_duskwood" },
  { value: enumMaps.ctf_tantum, label: "ctf_tantum" },
  { value: enumMaps.ctf_mine, label: "ctf_mine" },
  { value: enumMaps.ctf_planet, label: "ctf_planet" },
  { value: enumMaps.ctf_ambiance, label: "ctf_ambiance" },
  { value: enumMaps.ctf_ambiance, label: "ctf_ambiance_limited" },

  // 3 vs 3
  { value: enumMaps.ctf_2, label: "ctf2" },
  // { value: "ctf5", label: "ctf5" },
  // { value: "ctf_duskwood", label: "ctf_duskwood" },
  // { value: "ctf_5_limited", label: "ctf_5_limited" },
  { value: enumMaps.ctf_mars, label: "ctf_mars" },
  { value: enumMaps.ctf_moon, label: "ctf_moon" },
];

module.exports = { enumMaps, enumMapsWithLabel };
