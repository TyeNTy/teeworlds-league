const modes = {
  oneVOne: "1v1",
  twoVTwo: "2v2",
  threeVThree: "3v3",
  fourVFour: "4v4",
  fiveVFive: "5v5",
  sixVSix: "6v6",
  sevenVSeven: "7v7",
  eightVEight: "8v8",
};

const modesWithLabel = [
  { value: modes.oneVOne, label: "1 vs 1" },
  { value: modes.twoVTwo, label: "2 vs 2" },
  { value: modes.threeVThree, label: "3 vs 3" },
  { value: modes.fourVFour, label: "4 vs 4" },
  { value: modes.fiveVFive, label: "5 vs 5" },
  { value: modes.sixVSix, label: "6 vs 6" },
  { value: modes.sevenVSeven, label: "7 vs 7" },
  { value: modes.eightVEight, label: "8 vs 8" },
];

const maps = [
  // 2 vs 2
  { value: "ctf_3", label: "ctf3" },
  { value: "ctf4_old", label: "ctf4_old" },
  { value: "ctf_5", label: "ctf5" },
  { value: "ctf_5", label: "ctf5_spikes" },
  { value: "ctf_5_limited", label: "ctf_5_limited" },
  { value: "ctf_duskwood", label: "ctf_duskwood" },
  { value: "ctf_tantum", label: "ctf_tantum" },
  { value: "ctf_mine", label: "ctf_mine" },
  { value: "ctf_planet", label: "ctf_planet" },
  { value: "ctf_ambiance", label: "ctf_ambiance" },
  { value: "ctf_ambiance", label: "ctf_ambiance_limited" },

  // 3 vs 3
  { value: "ctf_2", label: "ctf2" },
  // { value: "ctf5", label: "ctf5" },
  // { value: "ctf_duskwood", label: "ctf_duskwood" },
  // { value: "ctf_5_limited", label: "ctf_5_limited" },
  { value: "ctf_cryochasm", label: "ctf_cryochasm" },
  { value: "ctf_mars", label: "ctf_mars" },
  { value: "ctf_moon", label: "ctf_moon" },
];

export { modes, maps, modesWithLabel };
