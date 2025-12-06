import { Character, generateRandomStats } from "../CharacterUtils"

const data: Character = {
    name: "Testowa postać",
    stats: generateRandomStats()
};

export const getData = () => {
    return data;
}

export const setAttack = (value: number) => {
    data.stats.attack.value = value;
}

export const setDefense = (value: number) => {
    data.stats.defense.value = value;
}

export const setHitPoints = (value: number) => {
    data.stats.hitPoints.value = value;
}

setInterval(() => {
    const newStats = generateRandomStats()
    data.stats.attack.value = newStats.attack.value;
    data.stats.defense.value = newStats.defense.value;
    data.stats.hitPoints.value = newStats.hitPoints.value;
}, 1000);

export default {
    getData,
    setAttack,
    setDefense,
    setHitPoints
}