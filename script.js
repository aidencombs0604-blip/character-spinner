// Character Spinner
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
    }

    initializeEventListeners() {
        this.spinBtn.addEventListener('click', () => this.spin());
        document.getElementById('addSliceBtn').addEventListener('click', () => this.toggleAddForm());
        document.getElementById('createSliceBtn').addEventListener('click', () => this.createSlice());
        this.backBtn.addEventListener('click', () => this.goBack());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('createWheelBtn').addEventListener('click', () => this.createNewWheel());
        document.getElementById('sliceName').addEventListener('keypress', e => {
            if (e.key === 'Enter') this.createSlice();
        });
    }

    createPredefinedWheels() {
        if (Object.keys(this.wheels).length) return;
        const definitions = [
            ['human', '👨 Human Archetypes', ['Mage', 'Gladiator', 'Archer', 'Rogue', 'Paladin']],
            ['dragon', '🐉 Dragon Types', ['Fire Dragon', 'Ice Dragon', 'Lightning Dragon', 'Shadow Dragon', 'Gold Dragon']],
            ['angel', '😇 Angel Types', ['Holy Angel', 'Guardian Angel', 'Messenger Angel', 'Fallen Angel', 'Warrior Angel']],
            ['demon', '😈 Demon Types', ['Imp', 'Succubus', 'Overlord', 'Corrupted', 'Trickster']],
            ['golem', '🔨 Golem Materials', ['Steel Golem', 'Gold Golem', 'Silver Golem', 'Stone Golem', 'Clay Golem']],
            ['elf', '🧝 Elf Types', ['High Elf', 'Dark Elf', 'Wood Elf', 'Sea Elf', 'Twilight Elf']],
            ['dwarf', '⛏️ Dwarf Types', ['Blacksmith Dwarf', 'Miner Dwarf', 'Berserker Dwarf', 'Mountain Dwarf', 'Rune Dwarf']]
        ];
        definitions.forEach(([id, name, names]) => {
            this.wheels[`wheel_${id}`] = {
                id: `wheel_${id}`,
                name,
                slices: names.map((sliceName, i) => ({
                    id: `${id}_${i}`,
                    name: sliceName,
                    probability: 20,
                    color: ['#9B59B6', '#E74C3C', '#F39C12', '#2C3E50', '#F1C40F'][i],
                    linkedWheelId: null
                }))
            };
        });
    }

    addDefaultSlices() {
        if (this.slices.length) return;
        const races = [
            ['👨 Human', 17, '#E8B8A0', 'wheel_human'],
            ['🐉 Dragon', 17, '#E74C3C', 'wheel_dragon'],
            ['😇 Angel', 17, '#F1C40F', 'wheel_angel'],
            ['😈 Demon', 17, '#8E44AD', 'wheel_demon'],
            ['🔨 Golem', 17, '#95A5A6', 'wheel_golem'],
            ['🧝 Elf', 17, '#27AE60', 'wheel_elf'],
            ['⛏️ Dwarf', 2, '#D35400', 'wheel_dwarf']
        ];
        this.slices = races.map(([name, probability, color, linkedWheelId], i) => ({
            id: `slice_${Date.now()}_${i}`,
            name, probability, color, linkedWheelId
        }));
        this.saveToStorage();
    }

    updateUI() {
        this.slicesListDiv.innerHTML = this.slices.map(slice => {
            const linked = slice.linkedWheelId && this.wheels[slice.linkedWheelId];
            return `<div class="slice-item">
                <div class="slice-color" style="background-color:${slice.color}"></div>
                <div class="slice-info"><div class="slice-name">${slice.name}</div>
                <div class="slice-probability">${slice.probability}%</div>
                ${linked ? `<div class="slice-linked">→ ${linked.name}</div>` : ''}</div>
                <div class="slice-actions">
                    <button class="slice-link-btn" onclick="wheel.linkSliceToWheel('${slice.id}')">Link</button>
                    <button class="slice-delete" onclick="wheel.deleteSlice('${slice.id}')">Delete</button>
                </div></div>`;
        }).join('');
        this.backBtn.style.display = this.wheelHistory.length ? 'block' : 'none';
    }

    draw() {
        const cx = this.canvas.width / 2, cy = this.canvas.height / 2;
        const radius = Math.min(cx, cy) - 10;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const total = this.slices.reduce((sum, s) => sum + Number(s.probability), 0);
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
            this.ctx.translate(cx + Math.cos(textAngle) * radius * .65, cy + Math.sin(textAngle) * radius * .65);
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
        this.ctx.moveTo(cx, 20); this.ctx.lineTo(cx - 15, 50); this.ctx.lineTo(cx + 15, 50); this.ctx.closePath(); this.ctx.fill();
    }

    chooseWeightedSlice() {
        const total = this.slices.reduce((sum, s) => sum + Number(s.probability), 0);
        let value = Math.random() * total;
        return this.slices.find(slice => (value -= Number(slice.probability)) < 0) || this.slices[this.slices.length - 1];
    }

    rotationForSlice(slice) {
        const pointer = -Math.PI / 2;
        const total = this.slices.reduce((sum, s) => sum + Number(s.probability), 0);
        let start = 0;
        for (const candidate of this.slices) {
            const size = Number(candidate.probability) / total * Math.PI * 2;
            if (candidate === slice) {
                // Put the center of the chosen slice exactly under the pointer.
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
        const normalizedTarget = ((target % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const normalizedCurrent = ((current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const shortestPositiveDelta = (normalizedTarget - normalizedCurrent + Math.PI * 2) % (Math.PI * 2);
        const end = current + fullTurns * Math.PI * 2 + shortestPositiveDelta;
        const startTime = performance.now();
        const duration = 3000 + Math.random() * 2000;
        const animate = now => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            this.currentRotation = current + (end - current) * eased;
            this.draw();
            if (progress < 1) requestAnimationFrame(animate);
            else this.onSpinComplete();
        };
        requestAnimationFrame(animate);
    }

    onSpinComplete() {
        const winner = this.pendingWinner;
        this.playFlamesAnimation();
        setTimeout(() => {
            if (winner && winner.linkedWheelId) this.transitionToWheel(winner.linkedWheelId, winner.name);
            else if (winner) this.showResult(winner);
            this.isSpinning = false;
            this.spinBtn.disabled = false;
            this.pendingWinner = null;
        }, 2000);
    }

    showResult(slice) {
        this.resultDisplay.classList.add('winner');
        this.resultDisplay.innerHTML = `<div style="text-align:center"><div style="font-size:2rem;margin-bottom:10px">🎯</div><div>You got: <strong>${slice.name}</strong></div></div>`;
    }

    transitionToWheel(wheelId, raceName) {
        this.wheelHistory.push({ wheelId: this.currentWheelId, slices: JSON.parse(JSON.stringify(this.slices)) });
        this.currentWheelId = wheelId;
        const next = this.wheels[wheelId];
        this.slices = JSON.parse(JSON.stringify(next.slices));
        this.wheelTitle.textContent = next.name;
        this.showResult({ name: `You selected ${raceName}!` });
        this.currentRotation = 0;
        this.updateUI(); this.draw();
    }

    goBack() {
        if (!this.wheelHistory.length) return;
        const previous = this.wheelHistory.pop();
        this.currentWheelId = previous.wheelId;
        this.slices = previous.slices;
        this.wheelTitle.textContent = this.currentWheelId === 'main' ? 'Main Wheel' : this.wheels[this.currentWheelId].name;
        this.currentRotation = 0;
        this.updateUI(); this.draw(); this.saveToStorage();
    }

    addSlice(name, probability, color) {
        this.slices.push({ id: `slice_${Date.now()}`, name, probability, color, linkedWheelId: null });
        this.updateUI(); this.saveToStorage(); this.draw();
    }

    createSlice() {
        const name = document.getElementById('sliceName').value.trim();
        const probability = parseInt(document.getElementById('sliceProbability').value, 10);
        const color = document.getElementById('sliceColor').value;
        if (!name || !probability || probability < 1 || probability > 100) return alert('Please enter a valid name and probability (1-100)');
        this.addSlice(name, probability, color);
        document.getElementById('sliceName').value = '';
        document.getElementById('sliceProbability').value = '';
        this.toggleAddForm();
    }

    deleteSlice(id) { this.slices = this.slices.filter(slice => slice.id !== id); this.updateUI(); this.saveToStorage(); this.draw(); }
    toggleAddForm() { const form = document.querySelector('.panel-section:nth-child(2)'); form.style.display = form.style.display === 'none' ? 'block' : 'none'; }

    linkSliceToWheel(id) {
        this.selectedSliceForLink = id;
        document.getElementById('sliceNameModal').textContent = this.slices.find(s => s.id === id).name;
        const list = document.getElementById('wheelsList');
        list.innerHTML = Object.keys(this.wheels).filter(w => w !== this.currentWheelId).map(w => `<div class="wheel-option" onclick="wheel.selectWheelForLink('${w}')">${this.wheels[w].name}</div>`).join('');
        this.modal.classList.add('show');
    }

    selectWheelForLink(id) { const slice = this.slices.find(s => s.id === this.selectedSliceForLink); if (slice) slice.linkedWheelId = id; this.saveToStorage(); this.updateUI(); this.closeModal(); }
    createNewWheel() {
        const name = document.getElementById('newWheelName').value.trim();
        if (!name) return alert('Please enter a wheel name');
        const id = `wheel_${Date.now()}`;
        this.wheels[id] = { id, name, slices: [] };
        this.selectWheelForLink(id);
    }
    closeModal() { this.modal.classList.remove('show'); document.getElementById('newWheelName').value = ''; }

    playFlamesAnimation() {
        const container = document.getElementById('flamesContainer');
        container.innerHTML = '';
        for (let i = 0; i < 15; i++) {
            const flame = document.createElement('div');
            flame.className = 'flame';
            flame.style.left = Math.random() * window.innerWidth + 'px';
            flame.style.setProperty('--drift', (Math.random() - .5) * 100 + 'px');
            flame.style.animationDelay = Math.random() * .5 + 's';
            container.appendChild(flame);
        }
    }

    saveToStorage() { localStorage.setItem('wheelSpinnerData', JSON.stringify({ wheels: this.wheels, mainSlices: this.currentWheelId === 'main' ? this.slices : undefined })); }
    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('wheelSpinnerData') || 'null');
            if (data) { this.wheels = data.wheels || {}; this.slices = data.mainSlices || []; }
        } catch (_) { this.wheels = {}; this.slices = []; }
    }
}

let wheel;
document.addEventListener('DOMContentLoaded', () => {
    wheel = new Wheel();
    document.querySelector('.panel-section:nth-child(2)').style.display = 'none';
});
