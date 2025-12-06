import { Character, generateRandomStats } from "../CharacterUtils";

const data: Character = {
  name: "Testowa postać",
  stats: generateRandomStats(),
};

export const getData = () => {
  return data;
};

export const setAttack = (value: number) => {
  data.stats.attack.value = value;
};

export const setDefense = (value: number) => {
  data.stats.defense.value = value;
};

export const setHitPoints = (value: number) => {
  data.stats.hitPoints.value = value;
};

export default {
  getData,
  setAttack,
  setDefense,
  setHitPoints,
};
