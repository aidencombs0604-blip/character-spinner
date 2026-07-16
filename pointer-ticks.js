(function () {
    const TWO_PI = Math.PI * 2;

    function normalize(angle) {
        return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
    }

    function currentSliceIndex(app) {
        if (!app || !app.slices?.length) return -1;
        const total = app.slices.reduce((sum, slice) => sum + Number(slice.probability || 0), 0);
        if (!total) return -1;
        const pointerAngle = normalize(-app.currentRotation);
        let angle = 0;
        for (let index = 0; index < app.slices.length; index += 1) {
            const size = Number(app.slices[index].probability || 0) / total * TWO_PI;
            if (pointerAngle >= angle && pointerAngle < angle + size) return index;
            angle += size;
        }
        return app.slices.length - 1;
    }

    function installPointerAndTicks(app) {
        if (!app || app.__medievalPointerInstalled) return;
        app.__medievalPointerInstalled = true;

        const originalDraw = app.draw.bind(app);
        app.draw = function drawWithMedievalPointer() {
            const cx = this.canvas.width / 2;
            const cy = this.canvas.height / 2;
            const radius = Math.min(cx, cy) - 10;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const total = this.slices.reduce((sum, slice) => sum + Number(slice.probability || 0), 0);
            if (!total) return;

            let angle = this.currentRotation;
            this.slices.forEach(slice => {
                const size = Number(slice.probability || 0) / total * TWO_PI;
                this.ctx.beginPath();
                this.ctx.moveTo(cx, cy);
                this.ctx.arc(cx, cy, radius, angle, angle + size);
                this.ctx.closePath();
                this.ctx.fillStyle = slice.color || '#4c3a25';
                this.ctx.fill();
                this.ctx.strokeStyle = '#d1b477';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                const textAngle = angle + size / 2;
                this.ctx.save();
                this.ctx.translate(cx + Math.cos(textAngle) * radius * .65, cy + Math.sin(textAngle) * radius * .65);
                this.ctx.rotate(textAngle);
                this.ctx.fillStyle = '#fff8e7';
                this.ctx.font = 'bold 14px Georgia, serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(slice.name, 0, 0);
                this.ctx.restore();
                angle += size;
            });

            this.ctx.beginPath();
            this.ctx.arc(cx, cy, radius, 0, TWO_PI);
            this.ctx.strokeStyle = '#8d6d38';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();
        };

        app.rotationForSlice = function rotationForRightPointer(slice) {
            const pointer = 0;
            const total = this.slices.reduce((sum, item) => sum + Number(item.probability || 0), 0);
            let start = 0;
            for (const candidate of this.slices) {
                const size = Number(candidate.probability || 0) / total * TWO_PI;
                if (candidate === slice) return pointer - (start + size / 2);
                start += size;
            }
            return this.currentRotation;
        };

        app.playTick = function playTick() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                this.tickAudioContext ||= new AudioContext();
                if (this.tickAudioContext.state === 'suspended') this.tickAudioContext.resume();
                const oscillator = this.tickAudioContext.createOscillator();
                const gain = this.tickAudioContext.createGain();
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(820, this.tickAudioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(420, this.tickAudioContext.currentTime + 0.035);
                gain.gain.setValueAtTime(0.0001, this.tickAudioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.055, this.tickAudioContext.currentTime + 0.004);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.tickAudioContext.currentTime + 0.045);
                oscillator.connect(gain);
                gain.connect(this.tickAudioContext.destination);
                oscillator.start();
                oscillator.stop(this.tickAudioContext.currentTime + 0.05);
            } catch (error) {
                // Audio is optional; spinning must continue if the browser blocks it.
            }
        };

        const originalSpin = app.spin.bind(app);
        app.spin = function spinWithTicks() {
            if (this.isSpinning || !this.slices.length) return originalSpin();
            this.lastTickSliceIndex = currentSliceIndex(this);
            const result = originalSpin();
            const watchTicks = () => {
                if (!this.isSpinning) return;
                const nextIndex = currentSliceIndex(this);
                if (nextIndex !== -1 && nextIndex !== this.lastTickSliceIndex) {
                    this.lastTickSliceIndex = nextIndex;
                    this.playTick();
                }
                requestAnimationFrame(watchTicks);
            };
            requestAnimationFrame(watchTicks);
            return result;
        };

        app.draw();
        if (typeof originalDraw === 'function') void originalDraw;
    }

    function start() {
        if (window.wheel) installPointerAndTicks(window.wheel);
        else setTimeout(start, 50);
    }

    document.addEventListener('DOMContentLoaded', start);
})();
