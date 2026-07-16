class Wheel {
    constructor() {
        this.slices = [];
        this.wheels = {};
        this.currentWheelId = 'main';
        this.wheelHistory = [];
        this.currentRotation = 0;
        this.isSpinning = false;
        this.pendingWinner = null;

        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.spinBtn = document.getElementById('spinBtn');
        this.slicesListDiv = document.getElementById('slicesList');
        this.resultDisplay = document.getElementById('resultDisplay');
        this.backBtn = document.getElementById('backBtn');
        this.wheelTitle = document.getElementById('wheelTitle');
        this.modal = document.getElementById('wheelModal');
        this.selectedSliceForLink = null;

        this.initializeEventListeners();
        this.loadFromStorage();
        this.createPredefinedWheels();
        this.addDefaultSlices();
        this.updateUI();
        this.draw();
        this.saveToStorage();
    }

    initializeEventListeners() {
        this.spinBtn.addEventListener('click', () => this.spin());

        document.getElementById('addSliceBtn')?.addEventListener('click', () => this.toggleAddForm());
        document.getElementById('createSliceBtn')?.addEventListener('click', () => this.createSlice());
        this.backBtn.addEventListener('click', () => this.goBack());

        // SAFE CLOSE BUTTON
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        document.getElementById('createWheelBtn')?.addEventListener('click', () => this.createNewWheel());

        const sliceNameInput = document.getElementById('sliceName');
        if (sliceNameInput) {
            sliceNameInput.addEventListener('keypress', e => {
                if (e.key === 'Enter') this.createSlice();
            });
        }
    }

    createPredefinedWheels() {
        const definitions = [
            ['human', '👨 Human Archetypes', ['Mage', 'Gladiator', 'Archer', 'Rogue', 'Paladin']],
            ['dragon', '🐉 Dragon Types', ['Fire Dragon', 'Ice Dragon', 'Lightning Dragon', 'Shadow Dragon', 'Gold Dragon']],
            ['angel', '😇 Angel Types', ['Holy Angel', 'Guardian Angel', 'Messenger Angel', 'Fallen Angel', 'Warrior Angel']],
            ['demon', '😈 Demon Types', ['Imp', 'Succubus', 'Overlord', 'Corrupted', 'Trickster']],
            ['golem', '🔨 Golem Materials', ['Steel Golem', 'Gold Golem', 'Silver Golem', 'Stone Golem', 'Clay Golem']],
            ['elf', '🧝 Elf Types', ['High Elf', 'Dark Elf', 'Wood Elf', 'Sea Elf', 'Twilight Elf']],
            ['dwarf', '⛏️ Dwarf Types', ['Blacksmith Dwarf', 'Miner Dwarf', 'Berserker Dwarf', 'Mountain Dwarf', 'Rune Dwarf']],
            ['orc', '👹 Orc Clans', ['War Chief', 'Berserker', 'Shaman', 'Raider', 'Beast Rider']],
            ['goblin', '👺 Goblin Types', ['Cave Goblin', 'Hobgoblin', 'Goblin Tinkerer', 'Goblin Rogue', 'Goblin King']],
            ['troll', '🧌 Troll Types', ['Mountain Troll', 'River Troll', 'Forest Troll', 'Ice Troll', 'Bridge Troll']],
            ['undead', '💀 Undead Types', ['Skeleton', 'Zombie', 'Wraith', 'Vampire', 'Lich']],
            ['halfling', '🧑‍🌾 Halfling Archetypes', ['Burglar', 'Innkeeper', 'Farmer', 'Storyteller', 'Lucky Wanderer']],
            ['gnome', '🧙 Gnome Types', ['Inventor', 'Illusionist', 'Alchemist', 'Clockmaker', 'Garden Gnome']],
            ['fae', '🧚 Fae Types', ['Pixie', 'Dryad', 'Sprite', 'Satyr', 'Fairy Queen']],
            ['merfolk', '🧜 Merfolk Types', ['Tide Caller', 'Pearl Diver', 'Siren', 'Reef Guardian', 'Sea King']],
            ['giant', '🗻 Giant Types', ['Storm Giant', 'Fire Giant', 'Frost Giant', 'Stone Giant', 'Cloud Giant']],
            ['beastfolk', '🐾 Beastfolk Archetypes', ['Wolf Warrior', 'Cat Scout', 'Bear Guardian', 'Fox Trickster', 'Raven Seer']],
            ['elemental', '🌪️ Elemental Types', ['Fire Elemental', 'Water Elemental', 'Earth Elemental', 'Air Elemental', 'Void Elemental']],
            ['construct', '🤖 Construct Types', ['Clockwork', 'Guardian', 'Automaton', 'War Machine', 'Sentinel']],
            ['witch', '🧿 Witch Archetypes', ['Hedge Witch', 'Storm Witch', 'Potion Witch', 'Hex Witch', 'Seer']],
            ['jinn', '🪔 Jinn Types', ['Wish Granter', 'Fire Jinn', 'Wind Jinn', 'Trickster Jinn', 'Ancient Jinn']],
            ['dragonborn', '🐲 Dragonborn Archetypes', ['Drake Knight', 'Breath Weapon Adept', 'Scale Guardian', 'Dragon Scholar', 'Wyrm Champion']]
        ];

        const colors = ['#9B59B6', '#E74C3C', '#F39C12', '#2C3E50', '#F1C40F'];

        definitions.forEach(([id, name, names]) => {
            const wheelId = `wheel_${id}`;
            if (this.wheels[wheelId]) return;

            this.wheels[wheelId] = {
                id: wheelId,
                name,
                slices: names.map((sliceName, i) => ({
                    id: `${id}_${i}`,
                    name: sliceName,
                    probability: 20,
                    color: colors[i],
                    linkedWheelId: null
                }))
            };
        });
    }

    addDefaultSlices() {
        const races = [
            ['👨 Human', 'human', '#E8B8A0'], ['🐉 Dragon', 'dragon', '#E74C3C'],
            ['😇 Angel', 'angel', '#F1C40F'], ['😈 Demon', 'demon', '#8E44AD'],
            ['🔨 Golem', 'golem', '#95A5A6'], ['🧝 Elf', 'elf', '#27AE60'],
            ['⛏️ Dwarf', 'dwarf', '#D35400'], ['👹 Orc', 'orc', '#5D8C3D'],
            ['👺 Goblin', 'goblin', '#7CB342'], ['🧌 Troll', 'troll', '#607D8B'],
            ['💀 Undead', 'undead', '#455A64'], ['🧑‍🌾 Halfling', 'halfling', '#A1887F'],
            ['🧙 Gnome', 'gnome', '#00ACC1'], ['🧚 Fae', 'fae', '#EC407A'],
            ['🧜 Merfolk', 'merfolk', '#2196F3'], ['🗻 Giant', 'giant', '#795548'],
            ['🐾 Beastfolk', 'beastfolk', '#8D6E63'], ['🌪️ Elemental', 'elemental', '#26A69A'],
            ['🤖 Construct', 'construct', '#78909C'], ['🧿 Witch', 'witch', '#6A1B9A'],
            ['🪔 Jinn', 'jinn', '#FF8F00'], ['🐲 Dragonborn', 'dragonborn', '#C62828']
        ];

        const oldIds = new Set(this.slices.map(slice => slice.raceId || slice.linkedWheelId));
        const now = Date.now();

        races.forEach(([name, id, color], index) => {
            const wheelId = `wheel_${id}`;
            if (oldIds.has(wheelId)) return;

            this.slices.push({
                id: `slice_${now}_${index}`,
                raceId: id,
                name,
                probability: id === 'dwarf' ? 2 : 5,
                color,
                linkedWheelId: wheelId
            });
        });
    }

    updateUI() {
        this.slicesListDiv.innerHTML = this.slices.map(slice => {
            const linked = slice.linkedWheelId && this.wheels[slice.linkedWheelId];

            return `
                <div class="slice-item">
                    <div class="slice-color" style="background-color:${slice.color}"></div>

                    <div class="slice-info">
                        <div class="slice-name">${slice.name}</div>
                        <div class="slice-probability">${slice.probability}%</div>
                        ${linked ? `<div class="slice-linked">→ ${linked.name}</div>` : ''}
                    </div>

                    <div class="slice-actions">
                        <select class="input slice-link-select"
                                onchange="wheel.setSliceLinkFromMain('${slice.id}', this.value)">
                            <option value="">No linked wheel</option>
                            ${Object.keys(this.wheels).map(id =>
                                `<option value="${id}" ${slice.linkedWheelId === id ? 'selected' : ''}>
                                    ${this.wheels[id].name}
                                </option>`
                            ).join('')}
                        </select>

                        <button class="slice-delete" onclick="wheel.deleteSlice('${slice.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');

        this.backBtn.style.display = this.wheelHistory.length ? 'block' : 'none';
    }

    draw() {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const radius = Math.min(cx, cy) - 10;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const total = this.slices.reduce((sum, s) => sum + Number(s.probability), 0);
        if (!total) return;

        let angle = this.currentRotation;

        this.slices.forEach(slice => {
            const size = Number(slice.probability) / total * Math.PI * 2;

            this.ctx.beginPath();
            this.ctx.moveTo(cx, cy);
            this.ctx.arc(cx, cy, radius, angle, angle + size);
            this.ctx.closePath();

            this.ctx.fillStyle = slice.color;
            this.ctx.fill();

            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            const textAngle = angle + size / 2;

            this.ctx.save();
            this.ctx.translate(
                cx + Math.cos(textAngle) * radius * 0.65,
                cy + Math.sin(textAngle) * radius * 0.65
            );
            this.ctx.rotate(textAngle);

            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(slice.name, 0, 0);

            this.ctx.restore();

            angle += size;
        });

        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.moveTo(cx, 20);
        this.ctx.lineTo(cx - 15, 50);
        this.ctx.lineTo(cx + 15, 50);
        this.ctx.closePath();
        this.ctx.fill();
    }

    chooseWeightedSlice() {
        const total = this.slices.reduce((sum, s) => sum + Number(s.probability), 0);
        let value = Math.random() * total;

        return this.slices.find(slice => (value -= Number(slice.probability)) < 0)
            || this.slices[this.slices.length - 1];
    }

    rotationForSlice(slice) {
        const pointer = -Math.PI / 2;
        const total = this.slices.reduce((sum, s) => sum + Number(s.probability), 0);

        let start = 0;

        for (const candidate of this.slices) {
            const size = Number(candidate.probability) / total * Math.PI * 2;

            if (candidate === slice) {
                return pointer - (start + size / 2);
            }

            start += size;
        }

        return this.currentRotation;
    }

    spin() {
        if (this.isSpinning || !this.slices.length) return;

        this.isSpinning = true;
        this.spinBtn.disabled = true;

        this.pendingWinner = this.chooseWeightedSlice();

        const target = this.rotationForSlice(this.pendingWinner);
        const current = this.currentRotation;

        const fullTurns = 10 + Math.floor(Math.random() * 10);
        const twoPi = Math.PI * 2;

        const normalizedTarget = ((target % twoPi) + twoPi) % twoPi;
        const normalizedCurrent = ((current % twoPi) + twoPi) % twoPi;

        const end = current + fullTurns * twoPi +
            (normalizedTarget - normalizedCurrent + twoPi) % twoPi;

        const startTime = performance.now();
        const duration = 3000 + Math.random() * 2000;

        const animate = now => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            this.currentRotation = current + (end - current) * eased;

            this.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.onSpinComplete();
            }
        };

        requestAnimationFrame(animate);
    }

    onSpinComplete() {
        const winner = this.pendingWinner;

        this.playFlamesAnimation();

        setTimeout(() => {
            if (winner && winner.linkedWheelId) {
                this.transitionToWheel(winner.linkedWheelId, winner.name);
            } else if (winner) {
                this.showResult(winner);
            }

            this.isSpinning = false;
            this.spinBtn.disabled = false;
            this.pendingWinner = null;
        }, 2000);
    }

    showResult(slice) {
        this.resultDisplay.classList.add('winner');

        this.resultDisplay.innerHTML = `
            <div style="text-align:center">
                <div style="font-size:2rem;margin-bottom:10px">🎯</div>
                <div>You got: <strong>${slice.name}</strong></div>
            </div>
        `;
    }

    transitionToWheel(wheelId, raceName) {
        this.wheelHistory.push({
            wheelId: this.currentWheelId,
            slices: JSON.parse(JSON.stringify(this.slices))
        });

        this.currentWheelId = wheelId;

        const next = this.wheels[wheelId];

        this.slices = JSON.parse(JSON.stringify(next.slices));

        this.wheelTitle.textContent = next.name;

        this.showResult({ name: `You selected ${raceName}!` });

        this.currentRotation = 0;

        this.updateUI();
        this.draw();
    }

    goBack() {
        if (!this.wheelHistory.length) return;

        const previous = this.wheelHistory.pop();

        this.currentWheelId = previous.wheelId;
        this.slices = previous.slices;

        this.wheelTitle.textContent =
            this.currentWheelId === 'main'
                ? 'Main Wheel'
                : this.wheels[this.currentWheelId].name;

        this.currentRotation = 0;

        this.updateUI();
        this.draw();
        this.saveToStorage();
    }

    addSlice(name, probability, color) {
        this.slices.push({
            id: `slice_${Date.now()}`,
            name,
            probability,
            color,
            linkedWheelId: null
        });

        this.updateUI();
        this.saveToStorage();
        this.draw();
    }

    createSlice() {
        const name = document.getElementById('sliceName').value.trim();
        const probability = parseInt(document.getElementById('sliceProbability').value, 10);
        const color = document.getElementById('sliceColor').value;

        if (!name || !probability || probability < 1 || probability > 100) {
            return alert('Please enter a valid name and probability (1-100)');
        }

        this.addSlice(name, probability, color);

        document.getElementById('sliceName').value = '';
        document.getElementById('sliceProbability').value = '';

        this.toggleAddForm();
    }

    deleteSlice(id) {
        this.slices = this.slices.filter(slice => slice.id !== id);

        this.updateUI();
        this.saveToStorage();
        this.draw();
    }

    setSliceLinkFromMain(sliceId, wheelId) {
        const slice = this.slices.find(s => s.id === sliceId);
        if (!slice) return;

        slice.linkedWheelId = wheelId || null;

        this.saveToStorage();
        this.updateUI();
        this.draw();
    }

    toggleAddForm() {
        const form = document.querySelector('.panel-section:nth-child(2)');
        if (form) {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        }
    }

    linkSliceToWheel(id) {
        this.selectedSliceForLink = id;

        const slice = this.slices.find(s
