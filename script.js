// Wheel Spinner Application

class Wheel {
    constructor() {
        this.slices = [];
        this.isSpinning = false;
        this.currentRotation = 0;
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.spinBtn = document.getElementById('spinBtn');
        this.addSliceBtn = document.getElementById('addSliceBtn');
        this.createSliceBtn = document.getElementById('createSliceBtn');
        this.slicesListDiv = document.getElementById('slicesList');
        this.resultDisplay = document.getElementById('resultDisplay');
        
        this.initializeEventListeners();
        this.addDefaultSlices();
        this.draw();
    }

    initializeEventListeners() {
        this.spinBtn.addEventListener('click', () => this.spin());
        this.addSliceBtn.addEventListener('click', () => this.toggleAddForm());
        this.createSliceBtn.addEventListener('click', () => this.createSlice());
        
        document.getElementById('sliceName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createSlice();
        });
    }

    addDefaultSlices() {
        const defaultSlices = [
            { name: 'Knight', probability: 20, color: '#FF6B6B' },
            { name: 'Wizard', probability: 20, color: '#4ECDC4' },
            { name: 'Archer', probability: 20, color: '#45B7D1' },
            { name: 'Rogue', probability: 20, color: '#96CEB4' },
            { name: 'Paladin', probability: 20, color: '#FFEAA7' }
        ];

        defaultSlices.forEach(slice => {
            this.addSlice(slice.name, slice.probability, slice.color);
        });
    }

    addSlice(name, probability, color) {
        this.slices.push({
            name,
            probability,
            color,
            id: Date.now()
        });
        this.updateUI();
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
        this.draw();
    }

    toggleAddForm() {
        const form = document.querySelector('.panel-section:nth-child(2)');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }

    updateUI() {
        // Update slices list
        this.slicesListDiv.innerHTML = '';
        this.slices.forEach(slice => {
            const sliceItem = document.createElement('div');
            sliceItem.className = 'slice-item';
            sliceItem.innerHTML = `
                <div class="slice-color" style="background-color: ${slice.color}"></div>
                <div class="slice-info">
                    <div class="slice-name">${slice.name}</div>
                    <div class="slice-probability">${slice.probability}%</div>
                </div>
                <button class="slice-delete" onclick="wheel.deleteSlice(${slice.id})">Delete</button>
            `;
            this.slicesListDiv.appendChild(sliceItem);
        });
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

        // Draw pointer at top
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
                this.onSpinComplete(finalRotation);
            }
        };

        animate();
    }

    onSpinComplete(finalRotation) {
        // Determine which slice won
        const winner = this.getWinnerSlice(finalRotation);

        // Show flames animation
        this.playFlamesAnimation();

        // After flames, show result
        setTimeout(() => {
            this.showResult(winner);
            this.isSpinning = false;
            this.spinBtn.disabled = false;
        }, 2000);
    }

    getWinnerSlice(finalRotation) {
        const normalizedRotation = (finalRotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const totalProbability = this.slices.reduce((sum, s) => sum + s.probability, 0);

        let currentAngle = 0;
        for (let slice of this.slices) {
            const sliceAngle = (slice.probability / totalProbability) * 2 * Math.PI;
            if (normalizedRotation < currentAngle + sliceAngle) {
                return slice;
            }
            currentAngle += sliceAngle;
        }

        return this.slices[0];
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
}

// Initialize wheel when page loads
let wheel;
document.addEventListener('DOMContentLoaded', () => {
    wheel = new Wheel();
    // Hide the add form initially
    document.querySelector('.panel-section:nth-child(2)').style.display = 'none';
});
