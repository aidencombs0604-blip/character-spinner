// Hierarchical wheel editor for the main race wheel and every linked wheel.
(function () {
    const palette = ['#9B59B6', '#E74C3C', '#F39C12', '#2C3E50', '#F1C40F', '#2ECC71', '#3498DB'];

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>'"]/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[character]));
    }

    function getApp() {
        return window.wheel;
    }

    function getWheel(id) {
        const app = getApp();
        if (!app) return null;
        return id === 'main'
            ? { id: 'main', name: '🎡 Main Race Wheel', slices: app.slices }
            : app.wheels?.[id] || null;
    }

    function wheelLabel(id) {
        const wheel = getWheel(id);
        return id === 'main' ? '🎡 Main Race Wheel' : (wheel?.name || id);
    }

    function getAllWheelIds() {
        const app = getApp();
        return app ? ['main', ...Object.keys(app.wheels || {})] : [];
    }

    function saveChanges() {
        const app = getApp();
        if (!app) return;
        app.saveToStorage();
        app.updateUI();
        app.draw();
    }

    function renderWheelOptions(selectedId) {
        const select = document.getElementById('linkedWheelSelect');
        if (!select || !getApp()) return;
        const ids = getAllWheelIds();
        select.innerHTML = ids.length
            ? ids.map(id => `<option value="${escapeHtml(id)}">${escapeHtml(wheelLabel(id))}</option>`).join('')
            : '<option value="main">🎡 Main Race Wheel</option>';
        select.value = ids.includes(selectedId) ? selectedId : 'main';
        renderSelectedWheel();
    }

    function renderSelectedWheel() {
        const select = document.getElementById('linkedWheelSelect');
        const header = document.getElementById('selectedWheelEditor');
        const editor = document.getElementById('linkedSlicesEditor');
        const wheel = getWheel(select?.value || 'main');
        if (!select || !header || !editor || !wheel) return;

        const id = select.value || 'main';
        header.innerHTML = `
            <div class="wheel-editor-heading">
                <input id="selectedWheelName" class="input" type="text" value="${escapeHtml(wheel.name)}" aria-label="Wheel name">
                <button id="saveWheelName" class="btn btn-success" type="button">Save wheel name</button>
                ${id !== 'main' ? '<button id="deleteSelectedWheel" class="btn slice-delete" type="button">Delete this wheel</button>' : ''}
            </div>
            <div class="add-linked-slice">
                <h3>Add a slice to ${escapeHtml(wheel.name)}</h3>
                <div class="editor-grid">
                    <input id="newLinkedName" class="input" type="text" placeholder="Slice name">
                    <input id="newLinkedProbability" class="input" type="number" min="1" max="100" value="20" placeholder="Probability">
                    <input id="newLinkedColor" class="linked-color" type="color" value="#667eea" aria-label="Slice color">
                    <button id="addLinkedSlice" class="btn btn-primary" type="button">Add slice</button>
                </div>
            </div>`;

        header.querySelector('#saveWheelName').addEventListener('click', () => {
            const name = header.querySelector('#selectedWheelName').value.trim();
            if (!name) return;
            if (id !== 'main') getApp().wheels[id].name = name;
            saveChanges();
            renderWheelOptions(id);
        });

        const deleteButton = header.querySelector('#deleteSelectedWheel');
        if (deleteButton) deleteButton.addEventListener('click', () => deleteWheel(id));
        header.querySelector('#addLinkedSlice').addEventListener('click', () => addSlice(id));

        editor.innerHTML = wheel.slices.length
            ? wheel.slices.map((slice, index) => renderSlice(slice, index, id)).join('')
            : '<p class="editor-empty">This wheel has no slices yet. Add one above.</p>';

        editor.querySelectorAll('.save-editor-slice').forEach(button => {
            button.addEventListener('click', () => saveSlice(id, button));
        });
        editor.querySelectorAll('.delete-editor-slice').forEach(button => {
            button.addEventListener('click', () => deleteSlice(id, button));
        });
        editor.querySelectorAll('.slice-link-select').forEach(linkSelect => {
            linkSelect.addEventListener('change', () => setSliceLink(id, linkSelect));
        });
        editor.querySelectorAll('.link-existing-button').forEach(button => {
            button.addEventListener('click', () => openLinkModal(id, button));
        });
    }

    function renderSlice(slice, index, currentWheelId) {
        const linkOptions = ['<option value="">No linked wheel</option>']
            .concat(getAllWheelIds()
                .filter(id => id !== currentWheelId)
                .map(id => `<option value="${escapeHtml(id)}" ${slice.linkedWheelId === id ? 'selected' : ''}>${escapeHtml(wheelLabel(id))}</option>`));

        const color = /^#[0-9a-f]{6}$/i.test(slice.color) ? slice.color : '#667eea';
        return `
            <div class="linked-slice-editor" data-slice-index="${index}">
                <input class="input editor-slice-name" type="text" value="${escapeHtml(slice.name)}" aria-label="Slice name">
                <div class="linked-slice-row">
                    <label>Probability
                        <input class="input editor-slice-probability" type="number" min="1" max="100" value="${Number(slice.probability) || 1}">
                    </label>
                    <label>Color
                        <input class="linked-color editor-slice-color" type="color" value="${color}">
                    </label>
                </div>
                <label>Next linked wheel
                    <select class="input slice-link-select">${linkOptions.join('')}</select>
                </label>
                <div class="editor-actions">
                    <button class="btn btn-success save-editor-slice" type="button">Save slice</button>
                    <button class="btn slice-delete delete-editor-slice" type="button">Delete slice</button>

                    <!-- NEW unified Link button -->
                    <button class="btn btn-primary link-existing-button" type="button">Link</button>
                </div>
                <span class="linked-save-status" aria-live="polite"></span>
            </div>`;
    }

    function saveSlice(wheelId, button) {
        const row = button.closest('.linked-slice-editor');
        const slice = getWheel(wheelId)?.slices[Number(row.dataset.sliceIndex)];
        const status = row.querySelector('.linked-save-status');
        const name = row.querySelector('.editor-slice-name').value.trim();
        const probability = Number(row.querySelector('.editor-slice-probability').value);
        if (!slice || !name || !Number.isFinite(probability) || probability < 1 || probability > 100) {
            status.textContent = 'Enter a name and probability from 1 to 100.';
            status.className = 'linked-save-status error';
            return;
        }
        slice.name = name;
        slice.probability = probability;
        slice.color = row.querySelector('.editor-slice-color').value;
        saveChanges();
        status.textContent = 'Saved';
        status.className = 'linked-save-status saved';
        setTimeout(() => { status.textContent = ''; }, 1500);
    }

    function setSliceLink(wheelId, select) {
        const row = select.closest('.linked-slice-editor');
        const slice = getWheel(wheelId)?.slices[Number(row.dataset.sliceIndex)];
        if (!slice) return;
        slice.linkedWheelId = select.value || null;
        saveChanges();
        renderSelectedWheel();
    }

    function addSlice(wheelId) {
        const wheel = getWheel(wheelId);
        const nameInput = document.getElementById('newLinkedName');
        const probabilityInput = document.getElementById('newLinkedProbability');
        const colorInput = document.getElementById('newLinkedColor');
        const name = nameInput.value.trim();
        const probability = Number(probabilityInput.value);
        if (!wheel || !name || !Number.isFinite(probability) || probability < 1 || probability > 100) return;
        wheel.slices.push({
            id: `slice_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            name,
            probability,
            color: colorInput.value || palette[wheel.slices.length % palette.length],
            linkedWheelId: null
        });
        saveChanges();
        renderSelectedWheel();
    }

    function deleteSlice(wheelId, button) {
        const wheel = getWheel(wheelId);
        const row = button.closest('.linked-slice-editor');
        if (!wheel || !row) return;
        wheel.slices.splice(Number(row.dataset.sliceIndex), 1);
        saveChanges();
        renderSelectedWheel();
    }

    // NEW: Use existing modal for linking
    function openLinkModal(wheelId, button) {
        const row = button.closest('.linked-slice-editor');
        const sliceIndex = Number(row.dataset.sliceIndex);
        const slice = getWheel(wheelId)?.slices[sliceIndex];
        if (!slice) return;

        window.wheel.selectedSliceForLink = slice.id;
        document.getElementById('sliceNameModal').textContent = slice.name;

        const list = document.getElementById('wheelsList');
        list.innerHTML = Object.keys(window.wheel.wheels)
            .filter(w => w !== wheelId)
            .map(w => `<div class="wheel-option" onclick="wheel.selectWheelForLink('${w}')">${window.wheel.wheels[w].name}</div>`)
            .join('');

        document.getElementById('wheelModal').classList.add('show');
    }

    function deleteWheel(id) {
        const app = getApp();
        if (!app || id === 'main' || !app.wheels[id]) return;
        if (!window.confirm(`Delete ${wheelLabel(id)} and remove all links to it?`)) return;
        app.slices.forEach(slice => { if (slice.linkedWheelId === id) slice.linkedWheelId = null; });
        Object.values(app.wheels).forEach(wheel => wheel.slices.forEach(slice => {
            if (slice.linkedWheelId === id) slice.linkedWheelId = null;
        }));
        delete app.wheels[id];
        saveChanges();
        renderWheelOptions('main');
    }

    function init() {
        const select = document.getElementById('linkedWheelSelect');
        if (!select) return;
        select.addEventListener('change', renderSelectedWheel);
        window.addEventListener('wheel-data-restored', () => renderWheelOptions(select.value || 'main'));
        const start = () => {
            if (getApp()) renderWheelOptions('main');
            else setTimeout(start, 50);
        };
        start();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
