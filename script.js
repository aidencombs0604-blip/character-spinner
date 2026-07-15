// Wheel Spinner Application with Branching Wheels

class Wheel {
    constructor() {
        this.slices = [];
        this.isSpinning = false;
        this.currentRotation = 0;
        this.wheelHistory = []; // Track wheel navigation
        this.currentWheelId = 'main';
        this.wheels = {}; // Store all wheels
        this.selectedSliceForLink = null;
        
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.spinBtn = document.getElementById('spinBtn');
        this.addSliceBtn = document.getElementById('addSliceBtn');
        this.createSliceBtn = document.getElementById('createSliceBtn');
        this.slicesListDiv = document.getElementById('slicesList');
        this.resultDisplay = document.getElementById('resultDisplay');
        this.backBtn = document.getElementById('backBtn');
        this.wheelTitle = document.getElementById('wheelTitle');
        
        // Modal elements
        this.modal = document.getElementById('wheelModal');
        this.closeModalBtn = document.querySelector('.close');
        this.createWheelBtn = document.getElementById('createWheelBtn');
        this.wheelsList = document.getElementById('wheelsList');
        
        this.initializeEventListeners();
        this.loadFromStorage();
        this.createPredefinedWheels();
        this.addDefaultSlices();
        this.draw();
    }

    initializeEventListeners() {
        this.spinBtn.addEventListener('click', () => this.spin());
        this.addSliceBtn.addEventListener('click', () => this.toggleAddForm());
        this.createSliceBtn.addEventListener('click', () => this.createSlice());
        this.backBtn.addEventListener('click', () => this.goBack());
        
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.createWheelBtn.addEventListener('click', () => this.createNewWheel());
        
        document.getElementById('sliceName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createSlice();
        });
    }

    createPredefinedWheels() {
        // Only create if storage is empty
        if (Object.keys(this.wheels).length > 0) return;

        // Human Archetypes
        const humanId = 'wheel_human';
        this.wheels[humanId] = {
            id: humanId,
            name: '👨 Human Archetypes',
            slices: [
                { id: 'h1', name: 'Mage', probability: 20, color: '#9B59B6', linkedWheelId: null },
                { id: 'h2', name: 'Gladiator', probability: 20, color: '#E74C3C', linkedWheelId: null },
                { id: 'h3', name: 'Archer', probability: 20, color: '#F39C12', linkedWheelId: null },
                { id: 'h4', name: 'Rogue', probability: 20, color: '#2C3E50', linkedWheelId: null },
                { id: 'h5', name: 'Paladin', probability: 20, color: '#F1C40F', linkedWheelId: null }
            ]
        };

        // Dragon Types
        const dragonId = 'wheel_dragon';
        this.wheels[dragonId] = {
            id: dragonId,
            name: '🐉 Dragon Types',
            slices: [
                { id: 'd1', name: 'Fire Dragon', probability: 20, color: '#E74C3C', linkedWheelId: null },
                { id: 'd2', name: 'Ice Dragon', probability: 20, color: '#3498DB', linkedWheelId: null },
                { id: 'd3', name: 'Lightning Dragon', probability: 20, color: '#F1C40F', linkedWheelId: null },
                { id: 'd4', name: 'Shadow Dragon', probability: 20, color: '#2C3E50', linkedWheelId: null },
                { id: 'd5', name: 'Gold Dragon', probability: 20, color: '#F39C12', linkedWheelId: null }
            ]
        };

        // Angel Types
        const angelId = 'wheel_angel';
        this.wheels[angelId] = {
            id: angelId,
            name: '😇 Angel Types',
            slices: [
                { id: 'a1', name: 'Holy Angel', probability: 20, color: '#F1C40F', linkedWheelId: null },
                { id: 'a2', name: 'Guardian Angel', probability: 20, color: '#3498DB', linkedWheelId: null },
                { id: 'a3', name: 'Messenger Angel', probability: 20, color: '#9B59B6', linkedWheelId: null },
                { id: 'a4', name: 'Fallen Angel', probability: 20, color: '#95A5A6', linkedWheelId: null },
                { id: 'a5', name: 'Warrior Angel', probability: 20, color: '#E74C3C', linkedWheelId: null }
            ]
        };

        // Demon Types
        const demonId = 'wheel_demon';
        this.wheels[demonId] = {
            id: demonId,
            name: '😈 Demon Types',
            slices: [
                { id: 'dm1', name: 'Imp', probability: 20, color: '#E67E22', linkedWheelId: null },
                { id: 'dm2', name: 'Succubus', probability: 20, color: '#E74C3C', linkedWheelId: null },
                { id: 'dm3', name: 'Overlord', probability: 20, color: '#2C3E50', linkedWheelId: null },
                { id: 'dm4', name: 'Corrupted', probability: 20, color: '#16A085', linkedWheelId: null },
                { id: 'dm5', name: 'Trickster', probability: 20, color: '#8E44AD', linkedWheelId: null }
            ]
        };

        // Golem Materials
        const golemId = 'wheel_golem';
        this.wheels[golemId] = {
            id: golemId,
            name: '🔨 Golem Materials',
            slices: [
                { id: 'g1', name: 'Steel Golem', probability: 20, color: '#95A5A6', linkedWheelId: null },
                { id: 'g2', name: 'Gold Golem', probability: 20, color: '#F1C40F', linkedWheelId: null },
                { id: 'g3', name: 'Silver Golem', probability: 20, color: '#BDC3C7', linkedWheelId: null },
                { id: 'g4', name: 'Stone Golem', probability: 20, color: '#7F8C8D', linkedWheelId: null },
                { id: 'g5', name: 'Clay Golem', probability: 20, color: '#D35400', linkedWheelId: null }
            ]
        };

        // Elf Types
        const elfId = 'wheel_elf';
        this.wheels[elfId] = {
            id: elfId,
            name: '🧝 Elf Types',
            slices: [
                { id: 'e1', name: 'High Elf', probability: 20, color: '#F39C12', linkedWheelId: null },
                { id: 'e2', name: 'Dark Elf', probability: 20, color: '#2C3E50', linkedWheelId: null },
                { id: 'e3', name: 'Wood Elf', probability: 20, color: '#27AE60', linkedWheelId: null },
                { id: 'e4', name: 'Sea Elf', probability: 20, color: '#3498DB', linkedWheelId: null },
                { id: 'e5', name: 'Twilight Elf', probability: 20, color: '#9B59B6', linkedWheelId: null }
            ]
        };

        // Dwarf Types
        const dwarfId = 'wheel_dwarf';
        this.wheels[dwarfId] = {
            id: dwarfId,
            name: '⛏️ Dwarf Types',
            slices: [
                { id: 'dw1', name: 'Blacksmith Dwarf', probability: 20, color: '#95A5A6', linkedWheelId: null },
                { id: 'dw2', name: 'Miner Dwarf', probability: 20, color: '#7F8C8D', linkedWheelId: null },
                { id: 'dw3', name: 'Berserker Dwarf', probability: 20, color: '#E74C3C', linkedWheelId: null },
                { id: 'dw4', name: 'Mountain Dwarf', probability: 20, color: '#95A5A6', linkedWheelId: null },
                { id: 'dw5', name: 'Rune Dwarf', probability: 20, color: '#F1C40F', linkedWheelId: null }
            ]
        };
    }

    addDefaultSlices() {
        if (this.slices.length === 0) {
            const races = [
                { name: '👨 Human', probability: 17, color: '#E8B8A0', linkedWheelId: 'wheel_human' },
                { name: '🐉 Dragon', probability: 17, color: '#E74C3C', linkedWheelId: 'wheel_dragon' },
                { name: '😇 Angel', probability: 17, color: '#F1C40F', linkedWheelId: 'wheel_angel' },
                { name: '😈 Demon', probability: 17, color: '#8E44AD', linkedWheelId: 'wheel_demon' },
                { name: '🔨 Golem', probability: 17, color: '#95A5A6', linkedWheelId: 'wheel_golem' },
                { name: '🧝 Elf', probability: 17, color: '#27AE60', linkedWheelId: 'wheel_elf' },
                { name: '⛏️ Dwarf', probability: 2, color: '#D35400', linkedWheelId: 'wheel_dwarf' }
            ];

            races.forEach(race => {
                const sliceId = 'slice_' + Date.now() + Math.random();
                this.slices.push({
                    name: race.name,
                    probability: race.probability,
                    color: race.color,
                    id: sliceId,
                    linkedWheelId: race.linkedWheelId
                });
            });

            this.updateUI();
            this.saveToStorage();
            this.draw();
        }
    }

    addSlice(name, probability, color) {
        const sliceId = 'slice_' + Date.now();
        this.slices.push({
            name,
            probability,
            color,
            id: sliceId,
            linkedWheelId: null
        });
        this.updateUI();
        this.saveToStorage();
        this.draw();
    }

    createSlice() {
        const name = document.getElementById('sliceName').value.trim();
        const probability = parseInt(document.getElementById('sliceProbability').value);
        const color = document.getElementById('sliceColor').value;

        if (!name || !probability || probability < 1 || probability > 100) {
            alert('Please enter a valid name and probability (1-100)');
            return;
        }

        this.addSlice(name, probability, color);
        
        // Clear inputs
        document.getElementById('sliceName').value = '';
        document.getElementById('sliceProbability').value = '';
        document.getElementById('sliceColor').value = '#FF6B6B';
        
        this.toggleAddForm();
    }

    deleteSlice(id) {
        this.slices = this.slices.filter(slice => slice.id !== id);
        this.updateUI();
        this.saveToStorage();
        this.draw();
    }

    toggleAddForm() {
        const form = document.querySelector('.panel-section:nth-child(2)');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }

    linkSliceToWheel(sliceId) {
        this.selectedSliceForLink = sliceId;
        const slice = this.slices.find(s => s.id === sliceId);
        document.getElementById('sliceNameModal').textContent = slice.name;
        
        this.populateWheelsList();
        this.openModal();
    }

    populateWheelsList() {
        this.wheelsList.innerHTML = '';
        Object.keys(this.wheels).forEach(wheelId => {
            if (wheelId !== this.currentWheelId) {
                const wheelOption = document.createElement('div');
                wheelOption.className = 'wheel-option';
                wheelOption.textContent = this.wheels[wheelId].name;
                wheelOption.addEventListener('click', () => {
                    this.selectWheelForLink(wheelId);
                });
                this.wheelsList.appendChild(wheelOption);
            }
        });
    }

    selectWheelForLink(wheelId) {
        const slice = this.slices.find(s => s.id === this.selectedSliceForLink);
        slice.linkedWheelId = wheelId;
        this.saveToStorage();
        this.updateUI();
        this.closeModal();
    }

    createNewWheel() {
        const wheelName = document.getElementById('newWheelName').value.trim();
        if (!wheelName) {
            alert('Please enter a wheel name');
            return;
        }

        const wheelId = 'wheel_' + Date.now();
        this.wheels[wheelId] = {
            id: wheelId,
            name: wheelName,
            slices: []
        };

        this.selectWheelForLink(wheelId);
    }

    openModal() {
        this.modal.classList.add('show');
    }

    closeModal() {
        this.modal.classList.remove('show');
        document.getElementById('newWheelName').value = '';
    }

    updateUI() {
        // Update slices list
        this.slicesListDiv.innerHTML = '';
        this.slices.forEach(slice => {
            const sliceItem = document.createElement('div');
            sliceItem.className = 'slice-item';
            
            let linkedInfo = '';
            if (slice.linkedWheelId) {
                const linkedWheel = this.wheels[slice.linkedWheelId];
                linkedInfo = `<div class="slice-linked">→ ${linkedWheel?.name || 'Unknown'}</div>`;
            }
            
            sliceItem.innerHTML = `
                <div class="slice-color" style="background-color: ${slice.color}"></div>
                <div class="slice-info">
                    <div class="slice-name">${slice.name}</div>
                    <div class="slice-probability">${slice.probability}%</div>
                    ${linkedInfo}
                </div>
                <div class="slice-actions">
                    <button class="slice-link-btn" onclick="wheel.linkSliceToWheel('${slice.id}')">Link</button>
                    <button class="slice-delete" onclick="wheel.deleteSlice('${slice.id}')">Delete</button>
                </div>
            `;
            this.slicesListDiv.appendChild(sliceItem);
        });

        // Update back button visibility
        this.backBtn.style.display = this.wheelHistory.length > 0 ? 'block' : 'none';
    }

    draw() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Clear canvas
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate total probability
        const totalProbability = this.slices.reduce((sum, s) => sum + s.probability, 0);

        // Draw slices
        let currentAngle = this.currentRotation;
        this.slices.forEach(slice => {
            const sliceAngle = (slice.probability / totalProbability) * 2 * Math.PI;

            // Draw slice
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            this.ctx.lineTo(centerX, centerY);
            this.ctx.fillStyle = slice.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw text
            const textAngle = currentAngle + sliceAngle / 2;
            const textX = centerX + Math.cos(textAngle) * (radius * 0.65);
            const textY = centerY + Math.sin(textAngle) * (radius * 0.65);

            this.ctx.save();
            this.ctx.translate(textX, textY);
            this.ctx.rotate(textAngle);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(slice.name, 0, 0);
            this.ctx.restore();

            currentAngle += sliceAngle;
        });

        // Draw outer circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw pointer at top (at -π/2 which is straight up)
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 20);
        this.ctx.lineTo(centerX - 15, 50);
        this.ctx.lineTo(centerX + 15, 50);
        this.ctx.fill();
    }

    spin() {
        if (this.isSpinning || this.slices.length === 0) return;

        this.isSpinning = true;
        this.spinBtn.disabled = true;

        // Random spin duration between 3-5 seconds
        const spinDuration = 3000 + Math.random() * 2000;
        const rotations = 10 + Math.random() * 10;
        const finalRotation = Math.random() * 2 * Math.PI;

        const startTime = Date.now();
        const startRotation = this.currentRotation;
        const endRotation = startRotation + rotations * 2 * Math.PI + finalRotation;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);

            // Easing function (ease-out cubic)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            this.currentRotation = startRotation + (endRotation - startRotation) * easeProgress;
            this.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.onSpinComplete(endRotation);
            }
        };

        animate();
    }

    onSpinComplete(endRotation) {
        // Determine which slice won
        const winner = this.getWinnerSlice(endRotation);

        // Show flames animation
        this.playFlamesAnimation();

        // After flames, show result or transition to linked wheel
        setTimeout(() => {
            if (winner.linkedWheelId) {
                this.transitionToWheel(winner.linkedWheelId, winner.name);
            } else {
                this.showResult(winner);
            }
            this.isSpinning = false;
            this.spinBtn.disabled = false;
        }, 2000);
    }

    getWinnerSlice(finalRotation) {
        // Normalize the rotation to 0-2π
        const normalizedRotation = ((finalRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        
        // The pointer is at the top (angle -π/2 or 3π/2 in standard coords)
        // In our drawing, angle 0 is at 3 o'clock, angle π/2 is at 6 o'clock
        // So angle -π/2 or 3π/2 is at 12 o'clock (top)
        const pointerAngle = -Math.PI / 2;
        
        // Calculate what angle on the wheel is currently under the pointer
        const angleAtPointer = (pointerAngle - normalizedRotation + 2 * Math.PI) % (2 * Math.PI);
        
        const totalProbability = this.slices.reduce((sum, s) => sum + s.probability, 0);

        let currentAngle = 0;
        for (let slice of this.slices) {
            const sliceAngle = (slice.probability / totalProbability) * 2 * Math.PI;
            // Check if the pointer angle falls within this slice
            if (angleAtPointer >= currentAngle && angleAtPointer < currentAngle + sliceAngle) {
                return slice;
            }
            currentAngle += sliceAngle;
        }

        // Fallback to first slice
        return this.slices[0];
    }

    transitionToWheel(wheelId, raceName) {
        // Save current state to history
        this.wheelHistory.push({
            wheelId: this.currentWheelId,
            slices: JSON.parse(JSON.stringify(this.slices))
        });

        // Load new wheel
        this.currentWheelId = wheelId;
        const newWheel = this.wheels[wheelId];
        
        if (newWheel.slices.length === 0) {
            // New empty wheel
            this.slices = [];
            this.wheelTitle.textContent = newWheel.name;
            this.showResult({ name: `Welcome to ${newWheel.name}!` });
        } else {
            // Load wheel slices
            this.slices = JSON.parse(JSON.stringify(newWheel.slices));
            this.wheelTitle.textContent = newWheel.name;
            this.showResult({ name: `You selected ${raceName}!` });
        }

        this.currentRotation = 0;
        this.updateUI();
        this.draw();
    }

    goBack() {
        if (this.wheelHistory.length === 0) return;

        // Save current state
        if (this.currentWheelId !== 'main') {
            this.wheels[this.currentWheelId].slices = JSON.parse(JSON.stringify(this.slices));
        }

        // Pop previous state
        const previousState = this.wheelHistory.pop();
        this.currentWheelId = previousState.wheelId;
        this.slices = previousState.slices;
        
        const wheelName = this.currentWheelId === 'main' ? 'Main Wheel' : this.wheels[this.currentWheelId]?.name;
        this.wheelTitle.textContent = wheelName;

        this.currentRotation = 0;
        this.saveToStorage();
        this.updateUI();
        this.draw();
    }

    playFlamesAnimation() {
        const flamesContainer = document.getElementById('flamesContainer');
        flamesContainer.innerHTML = '';

        // Create multiple flames
        for (let i = 0; i < 15; i++) {
            const flame = document.createElement('div');
            flame.className = 'flame';
            const leftPosition = Math.random() * window.innerWidth;
            flame.style.left = leftPosition + 'px';
            flame.style.setProperty('--drift', (Math.random() - 0.5) * 100 + 'px');
            flame.style.animationDelay = Math.random() * 0.5 + 's';
            flamesContainer.appendChild(flame);
        }
    }

    showResult(slice) {
        this.resultDisplay.classList.add('winner');
        this.resultDisplay.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 10px;">🎯</div>
                <div>You got: <strong>${slice.name}</strong></div>
            </div>
        `;
    }

    saveToStorage() {
        const data = {
            wheels: this.wheels,
            currentWheelId: this.currentWheelId,
            mainSlices: this.currentWheelId === 'main' ? this.slices : undefined
        };
        localStorage.setItem('wheelSpinnerData', JSON.stringify(data));
    }

    loadFromStorage() {
        const data = localStorage.getItem('wheelSpinnerData');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.wheels = parsed.wheels || {};
                if (parsed.mainSlices) {
                    this.slices = parsed.mainSlices;
                }
            } catch (e) {
                console.log('Could not load saved data');
            }
        }
    }
}

// Initialize wheel when page loads
let wheel;
document.addEventListener('DOMContentLoaded', () => {
    wheel = new Wheel();
    // Hide the add form initially
    document.querySelector('.panel-section:nth-child(2)').style.display = 'none';
});
