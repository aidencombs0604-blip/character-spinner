// Force-rebuild the original race wheel and all predefined race links.
(function () {
    const definitions = [
        ['human', '👨 Human', '👨 Human Archetypes', ['Mage', 'Gladiator', 'Archer', 'Rogue', 'Paladin'], '#E8B8A0'],
        ['dragon', '🐉 Dragon', '🐉 Dragon Types', ['Fire Dragon', 'Ice Dragon', 'Lightning Dragon', 'Shadow Dragon', 'Gold Dragon'], '#E74C3C'],
        ['angel', '😇 Angel', '😇 Angel Types', ['Holy Angel', 'Guardian Angel', 'Messenger Angel', 'Fallen Angel', 'Warrior Angel'], '#F1C40F'],
        ['demon', '😈 Demon', '😈 Demon Types', ['Imp', 'Succubus', 'Overlord', 'Corrupted', 'Trickster'], '#8E44AD'],
        ['golem', '🔨 Golem', '🔨 Golem Materials', ['Steel Golem', 'Gold Golem', 'Silver Golem', 'Stone Golem', 'Clay Golem'], '#95A5A6'],
        ['elf', '🧝 Elf', '🧝 Elf Types', ['High Elf', 'Dark Elf', 'Wood Elf', 'Sea Elf', 'Twilight Elf'], '#27AE60'],
        ['dwarf', '⛏️ Dwarf', '⛏️ Dwarf Types', ['Blacksmith Dwarf', 'Miner Dwarf', 'Berserker Dwarf', 'Mountain Dwarf', 'Rune Dwarf'], '#D35400'],
        ['orc', '👹 Orc', '👹 Orc Clans', ['War Chief', 'Berserker', 'Shaman', 'Raider', 'Beast Rider'], '#5D8C3D'],
        ['goblin', '👺 Goblin', '👺 Goblin Types', ['Cave Goblin', 'Hobgoblin', 'Goblin Tinkerer', 'Goblin Rogue', 'Goblin King'], '#7CB342'],
        ['troll', '🧌 Troll', '🧌 Troll Types', ['Mountain Troll', 'River Troll', 'Forest Troll', 'Ice Troll', 'Bridge Troll'], '#607D8B'],
        ['undead', '💀 Undead', '💀 Undead Types', ['Skeleton', 'Zombie', 'Wraith', 'Vampire', 'Lich'], '#455A64'],
        ['halfling', '🧑‍🌾 Halfling', '🧑‍🌾 Halfling Archetypes', ['Burglar', 'Innkeeper', 'Farmer', 'Storyteller', 'Lucky Wanderer'], '#A1887F'],
        ['gnome', '🧙 Gnome', '🧙 Gnome Types', ['Inventor', 'Illusionist', 'Alchemist', 'Clockmaker', 'Garden Gnome'], '#00ACC1'],
        ['fae', '🧚 Fae', '🧚 Fae Types', ['Pixie', 'Dryad', 'Sprite', 'Satyr', 'Fairy Queen'], '#EC407A'],
        ['merfolk', '🧜 Merfolk', '🧜 Merfolk Types', ['Tide Caller', 'Pearl Diver', 'Siren', 'Reef Guardian', 'Sea King'], '#2196F3'],
        ['giant', '🗻 Giant', '🗻 Giant Types', ['Storm Giant', 'Fire Giant', 'Frost Giant', 'Stone Giant', 'Cloud Giant'], '#795548'],
        ['beastfolk', '🐾 Beastfolk', '🐾 Beastfolk Archetypes', ['Wolf Warrior', 'Cat Scout', 'Bear Guardian', 'Fox Trickster', 'Raven Seer'], '#8D6E63'],
        ['elemental', '🌪️ Elemental', '🌪️ Elemental Types', ['Fire Elemental', 'Water Elemental', 'Earth Elemental', 'Air Elemental', 'Void Elemental'], '#26A69A'],
        ['construct', '🤖 Construct', '🤖 Construct Types', ['Clockwork', 'Guardian', 'Automaton', 'War Machine', 'Sentinel'], '#78909C'],
        ['witch', '🧿 Witch', '🧿 Witch Archetypes', ['Hedge Witch', 'Storm Witch', 'Potion Witch', 'Hex Witch', 'Seer'], '#6A1B9A'],
        ['jinn', '🪔 Jinn', '🪔 Jinn Types', ['Wish Granter', 'Fire Jinn', 'Wind Jinn', 'Trickster Jinn', 'Ancient Jinn'], '#FF8F00'],
        ['dragonborn', '🐲 Dragonborn', '🐲 Dragonborn Archetypes', ['Drake Knight', 'Breath Weapon Adept', 'Scale Guardian', 'Dragon Scholar', 'Wyrm Champion'], '#C62828']
    ];
    const sliceColors = ['#9B59B6', '#E74C3C', '#F39C12', '#2C3E50', '#F1C40F'];

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
                        color: oldSlice?.color || sliceColors[index],
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
