// Force-rebuild the original race wheel and all predefined race links.
(function () {
    const definitions = [
        ['human', '👨 Human', '👨 Human Archetypes', ['Mage', 'Gladiator', 'Archer', 'Rogue', 'Paladin'], '#5C2E1E'],
        ['dragon', '🐉 Dragon', '🐉 Dragon Types', ['Fire Dragon', 'Ice Dragon', 'Lightning Dragon', 'Shadow Dragon', 'Gold Dragon'], '#7D1A1A'],
        ['angel', '😇 Angel', '😇 Angel Types', ['Holy Angel', 'Guardian Angel', 'Messenger Angel', 'Fallen Angel', 'Warrior Angel'], '#7A5A14'],
        ['demon', '😈 Demon', '😈 Demon Types', ['Imp', 'Succubus', 'Overlord', 'Corrupted', 'Trickster'], '#4A0E6B'],
        ['golem', '🔨 Golem', '🔨 Golem Materials', ['Steel Golem', 'Gold Golem', 'Silver Golem', 'Stone Golem', 'Clay Golem'], '#2A3A4A'],
        ['elf', '🧝 Elf', '🧝 Elf Types', ['High Elf', 'Dark Elf', 'Wood Elf', 'Sea Elf', 'Twilight Elf'], '#1A4A2A'],
        ['dwarf', '⛏️ Dwarf', '⛏️ Dwarf Types', ['Blacksmith Dwarf', 'Miner Dwarf', 'Berserker Dwarf', 'Mountain Dwarf', 'Rune Dwarf'], '#7A4214'],
        ['orc', '👹 Orc', '👹 Orc Clans', ['War Chief', 'Berserker', 'Shaman', 'Raider', 'Beast Rider'], '#2A4818'],
        ['goblin', '👺 Goblin', '👺 Goblin Types', ['Cave Goblin', 'Hobgoblin', 'Goblin Tinkerer', 'Goblin Rogue', 'Goblin King'], '#2E4A12'],
        ['troll', '🧌 Troll', '🧌 Troll Types', ['Mountain Troll', 'River Troll', 'Forest Troll', 'Ice Troll', 'Bridge Troll'], '#2A2A3A'],
        ['undead', '💀 Undead', '💀 Undead Types', ['Skeleton', 'Zombie', 'Wraith', 'Vampire', 'Lich'], '#1A1A2E'],
        ['halfling', '🧑‍🌾 Halfling', '🧑‍🌾 Halfling Archetypes', ['Burglar', 'Innkeeper', 'Farmer', 'Storyteller', 'Lucky Wanderer'], '#4A2E18'],
        ['gnome', '🧙 Gnome', '🧙 Gnome Types', ['Inventor', 'Illusionist', 'Alchemist', 'Clockmaker', 'Garden Gnome'], '#15344A'],
        ['fae', '🧚 Fae', '🧚 Fae Types', ['Pixie', 'Dryad', 'Sprite', 'Satyr', 'Fairy Queen'], '#6A1A3A'],
        ['merfolk', '🧜 Merfolk', '🧜 Merfolk Types', ['Tide Caller', 'Pearl Diver', 'Siren', 'Reef Guardian', 'Sea King'], '#0A2A4E'],
        ['giant', '🗻 Giant', '🗻 Giant Types', ['Storm Giant', 'Fire Giant', 'Frost Giant', 'Stone Giant', 'Cloud Giant'], '#3A2818'],
        ['beastfolk', '🐾 Beastfolk', '🐾 Beastfolk Archetypes', ['Wolf Warrior', 'Cat Scout', 'Bear Guardian', 'Fox Trickster', 'Raven Seer'], '#3A2010'],
        ['elemental', '🌪️ Elemental', '🌪️ Elemental Types', ['Fire Elemental', 'Water Elemental', 'Earth Elemental', 'Air Elemental', 'Void Elemental'], '#0A3A3A'],
        ['construct', '🤖 Construct', '🤖 Construct Types', ['Clockwork', 'Guardian', 'Automaton', 'War Machine', 'Sentinel'], '#1E2E3E'],
        ['witch', '🧿 Witch', '🧿 Witch Archetypes', ['Hedge Witch', 'Storm Witch', 'Potion Witch', 'Hex Witch', 'Seer'], '#3A0A4E'],
        ['jinn', '🪔 Jinn', '🪔 Jinn Types', ['Wish Granter', 'Fire Jinn', 'Wind Jinn', 'Trickster Jinn', 'Ancient Jinn'], '#7A3A0A'],
        ['dragonborn', '🐲 Dragonborn', '🐲 Dragonborn Archetypes', ['Drake Knight', 'Breath Weapon Adept', 'Scale Guardian', 'Dragon Scholar', 'Wyrm Champion'], '#5A1010']
    ];
    const sliceColors = ['#4A1060', '#7D1A1A', '#7A4A14', '#1C2C3E', '#6B4A0A'];

    // Known legacy/default colors from prior versions — safe to replace with the new palette.
    const LEGACY_COLORS = new Set([
        '#E8B8A0','#E74C3C','#F1C40F','#8E44AD','#95A5A6','#27AE60',
        '#D35400','#5D8C3D','#7CB342','#607D8B','#455A64','#A1887F',
        '#00ACC1','#EC407A','#2196F3','#795548','#8D6E63','#26A69A',
        '#78909C','#6A1B9A','#FF8F00','#C62828',
        '#9B59B6','#F39C12','#2C3E50','#2ECC71','#3498DB','#667EEA'
    ]);

    function isLegacyColor(color) {
        return !color || LEGACY_COLORS.has(String(color).toUpperCase());
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

            // Preserve user-customized main-wheel slice color; only replace legacy defaults.
            const oldMainSlice = (app.slices || []).find(s => s.raceId === id || s.linkedWheelId === wheelId);
            const resolvedRaceColor = (oldMainSlice?.color && !isLegacyColor(oldMainSlice.color))
                ? oldMainSlice.color
                : raceColor;

            rebuiltWheels[wheelId] = {
                id: wheelId,
                name: old?.name || wheelLabel,
                slices: names.map((name, index) => {
                    const oldSlice = old?.slices?.[index];
                    // Preserve user-customized linked-wheel slice color; only replace legacy defaults.
                    const resolvedSliceColor = (oldSlice?.color && !isLegacyColor(oldSlice.color))
                        ? oldSlice.color
                        : sliceColors[index];
                    return {
                        id: oldSlice?.id || `${id}_${index}`,
                        name: oldSlice?.name || name,
                        probability: Number(oldSlice?.probability) > 0 ? Number(oldSlice.probability) : 20,
                        color: resolvedSliceColor,
                        linkedWheelId: oldSlice?.linkedWheelId || null
                    };
                })
            };
            rebuiltMainSlices.push({
                id: `race_${id}`,
                raceId: id,
                name: raceLabel,
                probability: id === 'dwarf' ? 2 : 5,
                color: resolvedRaceColor,
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
