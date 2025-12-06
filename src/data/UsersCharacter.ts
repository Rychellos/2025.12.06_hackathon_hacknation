import { Character, generateRandomStats } from "../CharacterUtils"

const data: Character = {
    name: "Testowa postać",
    stats: generateRandomStats()
};

export const getData = () => {
    return data;
}

setInterval(() => {
    const newStats = generateRandomStats()
    data.stats.attack.value = newStats.attack.value;
    data.stats.defense.value = newStats.defense.value;
    data.stats.hitPoints.value = newStats.hitPoints.value;
}, 1000);

export default {
    getData
}