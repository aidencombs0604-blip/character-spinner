// Force-rebuild the original race wheel and all predefined race links.
(function () {
    const definitions = [
        ['human', '👨 Human', '👨 Human Archetypes', ['Mage', 'Gladiator', 'Archer', 'Rogue', 'Paladin'], '#6B3A2A'],
        ['dragon', '🐉 Dragon', '🐉 Dragon Types', ['Fire Dragon', 'Ice Dragon', 'Lightning Dragon', 'Shadow Dragon', 'Gold Dragon'], '#7B1818'],
        ['angel', '😇 Angel', '😇 Angel Types', ['Holy Angel', 'Guardian Angel', 'Messenger Angel', 'Fallen Angel', 'Warrior Angel'], '#8B6914'],
        ['demon', '😈 Demon', '😈 Demon Types', ['Imp', 'Succubus', 'Overlord', 'Corrupted', 'Trickster'], '#4A1040'],
        ['golem', '🔨 Golem', '🔨 Golem Materials', ['Steel Golem', 'Gold Golem', 'Silver Golem', 'Stone Golem', 'Clay Golem'], '#3D3D3D'],
        ['elf', '🧝 Elf', '🧝 Elf Types', ['High Elf', 'Dark Elf', 'Wood Elf', 'Sea Elf', 'Twilight Elf'], '#1A5C2A'],
        ['dwarf', '⛏️ Dwarf', '⛏️ Dwarf Types', ['Blacksmith Dwarf', 'Miner Dwarf', 'Berserker Dwarf', 'Mountain Dwarf', 'Rune Dwarf'], '#7A3800'],
        ['orc', '👹 Orc', '👹 Orc Clans', ['War Chief', 'Berserker', 'Shaman', 'Raider', 'Beast Rider'], '#2E5C1A'],
        ['goblin', '👺 Goblin', '👺 Goblin Types', ['Cave Goblin', 'Hobgoblin', 'Goblin Tinkerer', 'Goblin Rogue', 'Goblin King'], '#3A5C10'],
        ['troll', '🧌 Troll', '🧌 Troll Types', ['Mountain Troll', 'River Troll', 'Forest Troll', 'Ice Troll', 'Bridge Troll'], '#2C3E4A'],
        ['undead', '💀 Undead', '💀 Undead Types', ['Skeleton', 'Zombie', 'Wraith', 'Vampire', 'Lich'], '#1C2A2E'],
        ['halfling', '🧑‍🌾 Halfling', '🧑‍🌾 Halfling Archetypes', ['Burglar', 'Innkeeper', 'Farmer', 'Storyteller', 'Lucky Wanderer'], '#5C3A2A'],
        ['gnome', '🧙 Gnome', '🧙 Gnome Types', ['Inventor', 'Illusionist', 'Alchemist', 'Clockmaker', 'Garden Gnome'], '#0A4A5A'],
        ['fae', '🧚 Fae', '🧚 Fae Types', ['Pixie', 'Dryad', 'Sprite', 'Satyr', 'Fairy Queen'], '#7A1040'],
        ['merfolk', '🧜 Merfolk', '🧜 Merfolk Types', ['Tide Caller', 'Pearl Diver', 'Siren', 'Reef Guardian', 'Sea King'], '#0A2E6B'],
        ['giant', '🗻 Giant', '🗻 Giant Types', ['Storm Giant', 'Fire Giant', 'Frost Giant', 'Stone Giant', 'Cloud Giant'], '#4A2A1A'],
        ['beastfolk', '🐾 Beastfolk', '🐾 Beastfolk Archetypes', ['Wolf Warrior', 'Cat Scout', 'Bear Guardian', 'Fox Trickster', 'Raven Seer'], '#4A2E24'],
        ['elemental', '🌪️ Elemental', '🌪️ Elemental Types', ['Fire Elemental', 'Water Elemental', 'Earth Elemental', 'Air Elemental', 'Void Elemental'], '#0A4A44'],
        ['construct', '🤖 Construct', '🤖 Construct Types', ['Clockwork', 'Guardian', 'Automaton', 'War Machine', 'Sentinel'], '#2A3A42'],
        ['witch', '🧿 Witch', '🧿 Witch Archetypes', ['Hedge Witch', 'Storm Witch', 'Potion Witch', 'Hex Witch', 'Seer'], '#3A0A5A'],
        ['jinn', '🪔 Jinn', '🪔 Jinn Types', ['Wish Granter', 'Fire Jinn', 'Wind Jinn', 'Trickster Jinn', 'Ancient Jinn'], '#7A4A00'],
        ['dragonborn', '🐲 Dragonborn', '🐲 Dragonborn Archetypes', ['Drake Knight', 'Breath Weapon Adept', 'Scale Guardian', 'Dragon Scholar', 'Wyrm Champion'], '#6B0A0A']
    ];
    const sliceColors = ['#4A1065', '#6B0A0A', '#7A4A00', '#1A2030', '#8B6914'];

    // Map known legacy predefined colors to their dark-medieval replacements.
    // Colors that users have customized (not in this map) are never touched.
    const legacyColorMap = {
        '#e8b8a0': '#6B3A2A', '#e74c3c': '#7B1818', '#f1c40f': '#8B6914',
        '#8e44ad': '#4A1040', '#95a5a6': '#3D3D3D', '#27ae60': '#1A5C2A',
        '#d35400': '#7A3800', '#5d8c3d': '#2E5C1A', '#7cb342': '#3A5C10',
        '#607d8b': '#2C3E4A', '#455a64': '#1C2A2E', '#a1887f': '#5C3A2A',
        '#00acc1': '#0A4A5A', '#ec407a': '#7A1040', '#2196f3': '#0A2E6B',
        '#795548': '#4A2A1A', '#8d6e63': '#4A2E24', '#26a69a': '#0A4A44',
        '#78909c': '#2A3A42', '#6a1b9a': '#3A0A5A', '#ff8f00': '#7A4A00',
        '#c62828': '#6B0A0A',
        '#9b59b6': '#4A1065', '#f39c12': '#7A4A00', '#2c3e50': '#1A2030',
        '#2ecc71': '#1A5C2A', '#3498db': '#0A2E6B'
    };

    function normalizeLegacyColor(color) {
        if (!color) return null;
        return legacyColorMap[color.toLowerCase()] || color;
    }

    function rebuildRaces() {
        if (!window.wheel) return;
        const app = window.wheel;
        const oldWheels = app.wheels || {};
        const rebuiltWheels = {};
        const rebuiltMainSlices = [];

        definitions.forEach(([id, raceLabel, wheelLabel, names, raceColor]) => {
            const wheelId = `wheel_${id}`;
            const old = oldWheels[wheelId];
            rebuiltWheels[wheelId] = {
                id: wheelId,
                name: old?.name || wheelLabel,
                slices: names.map((name, index) => {
                    const oldSlice = old?.slices?.[index];
                    return {
                        id: oldSlice?.id || `${id}_${index}`,
                        name: oldSlice?.name || name,
                        probability: Number(oldSlice?.probability) > 0 ? Number(oldSlice.probability) : 20,
                        color: normalizeLegacyColor(oldSlice?.color) || sliceColors[index],
                        linkedWheelId: oldSlice?.linkedWheelId || null
                    };
                })
            };
            rebuiltMainSlices.push({
                id: `race_${id}`,
                raceId: id,
                name: raceLabel,
                probability: id === 'dwarf' ? 2 : 5,
                color: raceColor,
                linkedWheelId: wheelId
            });
        });

        // Preserve user-created non-predefined wheels, while rebuilding every standard race link.
        Object.keys(oldWheels).forEach(id => {
            if (!rebuiltWheels[id]) rebuiltWheels[id] = oldWheels[id];
        });
        app.wheels = rebuiltWheels;
        app.currentWheelId = 'main';
        app.wheelHistory = [];
        app.slices = rebuiltMainSlices;
        app.currentRotation = 0;
        app.wheelTitle.textContent = 'Main Wheel';
        app.updateUI();
        app.draw();
        app.saveToStorage();
        window.dispatchEvent(new CustomEvent('wheel-data-restored'));
    }

    document.addEventListener('DOMContentLoaded', () => window.setTimeout(rebuildRaces, 250));
})();
