// Force-rebuild the original race wheel and all predefined race links.
(function () {
    // Each entry: [id, raceLabel, wheelLabel, names[], newRaceColor, oldRaceColor]
    const definitions = [
        ['human',      'Human',      'Human Archetypes',      ['Mage', 'Gladiator', 'Archer', 'Rogue', 'Paladin'],                                              '#7A2D3C', '#e8b8a0'],
        ['dragon',     'Dragon',     'Dragon Types',          ['Fire Dragon', 'Ice Dragon', 'Lightning Dragon', 'Shadow Dragon', 'Gold Dragon'],                '#6B2020', '#e74c3c'],
        ['angel',      'Angel',      'Angel Types',           ['Holy Angel', 'Guardian Angel', 'Messenger Angel', 'Fallen Angel', 'Warrior Angel'],             '#8B7336', '#f1c40f'],
        ['demon',      'Demon',      'Demon Types',           ['Imp', 'Succubus', 'Overlord', 'Corrupted', 'Trickster'],                                        '#5A1A7B', '#8e44ad'],
        ['golem',      'Golem',      'Golem Materials',       ['Steel Golem', 'Gold Golem', 'Silver Golem', 'Stone Golem', 'Clay Golem'],                       '#6B6B60', '#95a5a6'],
        ['elf',        'Elf',        'Elf Types',             ['High Elf', 'Dark Elf', 'Wood Elf', 'Sea Elf', 'Twilight Elf'],                                  '#2D5016', '#27ae60'],
        ['dwarf',      'Dwarf',      'Dwarf Types',           ['Blacksmith Dwarf', 'Miner Dwarf', 'Berserker Dwarf', 'Mountain Dwarf', 'Rune Dwarf'],           '#6B3D1E', '#d35400'],
        ['orc',        'Orc',        'Orc Clans',             ['War Chief', 'Berserker', 'Shaman', 'Raider', 'Beast Rider'],                                    '#3A5C28', '#5d8c3d'],
        ['goblin',     'Goblin',     'Goblin Types',          ['Cave Goblin', 'Hobgoblin', 'Goblin Tinkerer', 'Goblin Rogue', 'Goblin King'],                   '#4A5C2A', '#7cb342'],
        ['troll',      'Troll',      'Troll Types',           ['Mountain Troll', 'River Troll', 'Forest Troll', 'Ice Troll', 'Bridge Troll'],                   '#4A5568', '#607d8b'],
        ['undead',     'Undead',     'Undead Types',          ['Skeleton', 'Zombie', 'Wraith', 'Vampire', 'Lich'],                                              '#3D4A50', '#455a64'],
        ['halfling',   'Halfling',   'Halfling Archetypes',   ['Burglar', 'Innkeeper', 'Farmer', 'Storyteller', 'Lucky Wanderer'],                              '#7B5C50', '#a1887f'],
        ['gnome',      'Gnome',      'Gnome Types',           ['Inventor', 'Illusionist', 'Alchemist', 'Clockmaker', 'Garden Gnome'],                           '#1A5C6B', '#00acc1'],
        ['fae',        'Fae',        'Fae Types',             ['Pixie', 'Dryad', 'Sprite', 'Satyr', 'Fairy Queen'],                                             '#6B2A4A', '#ec407a'],
        ['merfolk',    'Merfolk',    'Merfolk Types',         ['Tide Caller', 'Pearl Diver', 'Siren', 'Reef Guardian', 'Sea King'],                             '#1A4A7B', '#2196f3'],
        ['giant',      'Giant',      'Giant Types',           ['Storm Giant', 'Fire Giant', 'Frost Giant', 'Stone Giant', 'Cloud Giant'],                       '#5C4030', '#795548'],
        ['beastfolk',  'Beastfolk',  'Beastfolk Archetypes',  ['Wolf Warrior', 'Cat Scout', 'Bear Guardian', 'Fox Trickster', 'Raven Seer'],                   '#6B5040', '#8d6e63'],
        ['elemental',  'Elemental',  'Elemental Types',       ['Fire Elemental', 'Water Elemental', 'Earth Elemental', 'Air Elemental', 'Void Elemental'],      '#1E4D4D', '#26a69a'],
        ['construct',  'Construct',  'Construct Types',       ['Clockwork', 'Guardian', 'Automaton', 'War Machine', 'Sentinel'],                                '#5C5C6B', '#78909c'],
        ['witch',      'Witch',      'Witch Archetypes',      ['Hedge Witch', 'Storm Witch', 'Potion Witch', 'Hex Witch', 'Seer'],                              '#3D1A5C', '#6a1b9a'],
        ['jinn',       'Jinn',       'Jinn Types',            ['Wish Granter', 'Fire Jinn', 'Wind Jinn', 'Trickster Jinn', 'Ancient Jinn'],                    '#8B6020', '#ff8f00'],
        ['dragonborn', 'Dragonborn', 'Dragonborn Archetypes', ['Drake Knight', 'Breath Weapon Adept', 'Scale Guardian', 'Dragon Scholar', 'Wyrm Champion'],   '#6B1A1A', '#c62828']
    ];
    // New dark-medieval sub-wheel slice palette
    const sliceColors = ['#6B2737', '#4A5568', '#2D5016', '#7D6529', '#5A4030'];
    // Old default sub-wheel slice colors (used to detect un-customised slices for migration)
    const oldSliceColors = new Set(['#9b59b6', '#e74c3c', '#f39c12', '#2c3e50', '#f1c40f']);

    function rebuildRaces() {
        if (!window.wheel) return;
        const app = window.wheel;
        const oldWheels = app.wheels || {};
        // Snapshot main slices before overwriting so we can preserve user colour edits
        const oldMainSlices = app.slices ? app.slices.slice() : [];
        const rebuiltWheels = {};
        const rebuiltMainSlices = [];

        definitions.forEach(([id, raceLabel, wheelLabel, names, raceColor, oldRaceColor]) => {
            const wheelId = `wheel_${id}`;
            const old = oldWheels[wheelId];
            rebuiltWheels[wheelId] = {
                id: wheelId,
                name: old?.name || wheelLabel,
                slices: names.map((name, index) => {
                    const oldSlice = old?.slices?.[index];
                    const existingColor = (oldSlice?.color || '').toLowerCase();
                    // Keep user-modified color; replace old default with new medieval color
                    const color = (oldSlice?.color && !oldSliceColors.has(existingColor))
                        ? oldSlice.color
                        : sliceColors[index];
                    return {
                        id: oldSlice?.id || `${id}_${index}`,
                        name: oldSlice?.name || name,
                        probability: Number(oldSlice?.probability) > 0 ? Number(oldSlice.probability) : 20,
                        color,
                        linkedWheelId: oldSlice?.linkedWheelId || null
                    };
                })
            };

            // For main race slices: preserve user-modified colour; migrate old default to new
            const existingMainSlice = oldMainSlices.find(s => s.raceId === id);
            const existingColor = existingMainSlice?.color || '';
            const isOldDefault = !existingColor || existingColor.toLowerCase() === oldRaceColor;
            rebuiltMainSlices.push({
                id: `race_${id}`,
                raceId: id,
                name: raceLabel,
                probability: id === 'dwarf' ? 2 : 5,
                color: isOldDefault ? raceColor : existingColor,
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
