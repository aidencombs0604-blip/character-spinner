// Multi-level wheel and slice editor
(function () {
    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));

    const wheelName = id => id === 'main' ? '🎡 Main Race Wheel' : window.wheel.wheels[id]?.name || id;

    function getWheel(id) {
        if (!window.wheel) return null;
        if (id === 'main') return { id: 'main', name: '🎡 Main Race Wheel', slices: window.wheel.slices };
        return window.wheel.wheels[id] || null;
    }

    function saveAndRefresh() {
        window.wheel.saveToStorage();
        window.wheel.updateUI();
        if (window.wheel.currentWheelId === 'main') window.wheel.draw();
        renderWheelOptions(document.getElementById('linkedWheelSelect').value);
    }

    function renderWheelOptions(selectedId) {
        const select = document.getElementById('linkedWheelSelect');
        if (!select || !window.wheel) return;
        const ids = ['main', ...Object.keys(window.wheel.wheels)];
        select.innerHTML = ids.map(id => `<option value="${escapeHtml(id)}">${escapeHtml(wheelName(id))}</option>`).join('');
        select.value = ids.includes(selectedId) ? selectedId : 'main';
        renderSelectedWheel();
    }

    function renderSelectedWheel() {
        const select = document.getElementById('linkedWheelSelect');
        const header = document.getElementById('selectedWheelEditor');
        const editor = document.getElementById('linkedSlicesEditor');
        if (!select || !header || !editor || !window.wheel) return;

        const id = select.value || 'main';
        const current = getWheel(id);
        if (!current) return;

        header.innerHTML = `
            <div class="wheel-editor-heading">
                <input id="selectedWheelName" class="input" type="text" value="${escapeHtml(current.name)}" aria-label="Wheel name">
                <button id="saveWheelName" class="btn btn-success" type="button">Save wheel name</button>
                ${id !== 'main' ? '<button id="deleteSelectedWheel" class="btn slice-delete" type="button">Delete this wheel</button>' : ''}
            </div>
            <div class="add-linked-slice">
                <h3>Add slice to this wheel</h3>
                <div class="editor-grid">
                    <input id="newLinkedName" class="input" type="text" placeholder="Slice name">
                    <input id="newLinkedProbability" class="input" type="number" min="1" max="100" value="20" placeholder="Probability">
                    <input id="newLinkedColor" class="linked-color" type="color" value="#667eea" aria-label="New slice color">
                    <button id="addLinkedSlice" class="btn btn-primary" type="button">Add slice</button>
                </div>
            </div>`;

        header.querySelector('#saveWheelName').addEventListener('click', () => {
            const name = header.querySelector('#selectedWheelName').value.trim();
            if (!name) return;
            if (id === 'main') {
                header.querySelector('#selectedWheelName').value = name;
            } else {
                window.wheel.wheels[id].name = name;
            }
            if (window.wheel.currentWheelId === id) window.wheel.wheelTitle.textContent = name;
            saveAndRefresh();
        });

        const deleteWheelButton = header.querySelector('#deleteSelectedWheel');
        if (deleteWheelButton) deleteWheelButton.addEventListener('click', () => deleteWheel(id));
        header.querySelector('#addLinkedSlice').addEventListener('click', () => addSliceToWheel(id));

        editor.innerHTML = current.slices.length
            ? current.slices.map((slice, index) => renderSliceEditor(slice, index, id)).join('')
            : '<p class="editor-empty">This wheel has no slices yet. Add one above.</p>';
        editor.querySelectorAll('.save-linked-slice').forEach(button => button.addEventListener('click', () => saveSlice(id, button)));
        editor.querySelectorAll('.delete-linked-slice').forEach(button => button.addEventListener('click', () => deleteSlice(id, button)));
        editor.querySelectorAll('.slice-link-select').forEach(selectElement => selectElement.addEventListener('change', () => updateSliceLink(id, selectElement)));
        editor.querySelectorAll('.new-link-button').forEach(button => button.addEventListener('click', () => createAndLinkWheel(id, button)));
    }

    function renderSliceEditor(slice, index, currentWheelId) {
        const linkOptions = ['<option value="">No linked wheel</option>']
            .concat(Object.keys(window.wheel.wheels).filter(id => id !== currentWheelId).map(id =>
                `<option value="${escapeHtml(id)}" ${slice.linkedWheelId === id ? 'selected' : ''}>${escapeHtml(wheelName(id))}</option>`));
        return `<div class="linked-slice-editor" data-slice-index="${index}">
            <input class="input linked-name" type="text" value="${escapeHtml(slice.name)}" aria-label="Slice name">
            <div class="linked-slice-row">
                <label>Probability<input class="input linked-probability" type="number" min="1" max="100" value="${Number(slice.probability) || 1}"></label>
                <label>Color<input class="linked-color linked-slice-color" type="color" value="${/^#[0-9a-f]{6}$/i.test(slice.color) ? slice.color : '#667eea'}"></label>
            </div>
            <label>Next linked wheel<select class="input slice-link-select">${linkOptions.join('')}</select></label>
            <div class="slice-actions editor-actions">
                <button class="btn btn-success save-linked-slice" type="button">Save</button>
                <button class="btn slice-delete delete-linked-slice" type="button">Delete slice</button>
                <button class="btn btn-primary new-link-button" type="button">New wheel & link</button>
            </div>
            <span class="linked-save-status" aria-live="polite"></span>
        </div>`;
    }

    function saveSlice(wheelId, button) {
        const row = button.closest('.linked-slice-editor');
        const slice = getWheel(wheelId).slices[Number(row.dataset.sliceIndex)];
        const status = row.querySelector('.linked-save-status');
        const name = row.querySelector('.linked-name').value.trim();
        const probability = Number(row.querySelector('.linked-probability').value);
        if (!slice || !name || !Number.isFinite(probability) || probability < 1 || probability > 100) {
            status.textContent = 'Enter a name and probability from 1 to 100.';
            status.className = 'linked-save-status error';
            return;
        }
        slice.name = name;
        slice.probability = probability;
        slice.color = row.querySelector('.linked-slice-color').value;
        saveAndRefresh();
        status.textContent = 'Saved';
        status.className = 'linked-save-status saved';
        window.setTimeout(() => { status.textContent = ''; }, 1800);
    }

    function updateSliceLink(wheelId, selectElement) {
        const row = selectElement.closest('.linked-slice-editor');
        const slice = getWheel(wheelId).slices[Number(row.dataset.sliceIndex)];
        if (!slice) return;
        slice.linkedWheelId = selectElement.value || null;
        saveAndRefresh();
    }

    function addSliceToWheel(wheelId) {
        const nameInput = document.getElementById('newLinkedName');
        const probabilityInput = document.getElementById('newLinkedProbability');
        const colorInput = document.getElementById('newLinkedColor');
        const name = nameInput.value.trim();
        const probability = Number(probabilityInput.value);
        if (!name || !Number.isFinite(probability) || probability < 1 || probability > 100) return;
        getWheel(wheelId).slices.push({ id: `slice_${Date.now()}_${Math.random()}`, name, probability, color: colorInput.value, linkedWheelId: null });
        saveAndRefresh();
    }

    function deleteSlice(wheelId, button) {
        const wheel = getWheel(wheelId);
        const index = Number(button.closest('.linked-slice-editor').dataset.sliceIndex);
        wheel.slices.splice(index, 1);
        saveAndRefresh();
    }

    function createAndLinkWheel(wheelId, button) {
        const row = button.closest('.linked-slice-editor');
        const slice = getWheel(wheelId).slices[Number(row.dataset.sliceIndex)];
        const name = window.prompt('Name for the new linked wheel:');
        if (!name || !name.trim() || !slice) return;
        const id = `wheel_${Date.now()}`;
        window.wheel.wheels[id] = { id, name: name.trim(), slices: [] };
        slice.linkedWheelId = id;
        saveAndRefresh();
    }

    function deleteWheel(id) {
        if (id === 'main' || !window.wheel.wheels[id]) return;
        Object.values(window.wheel.wheels).forEach(wheel => wheel.slices.forEach(slice => {
            if (slice.linkedWheelId === id) slice.linkedWheelId = null;
        }));
        window.wheel.slices.forEach(slice => {
            if (slice.linkedWheelId === id) slice.linkedWheelId = null;
        });
        delete window.wheel.wheels[id];
        saveAndRefresh();
    }

    document.addEventListener('DOMContentLoaded', () => {
        const select = document.getElementById('linkedWheelSelect');
        if (select) select.addEventListener('change', renderSelectedWheel);
        window.setTimeout(() => renderWheelOptions('main'), 100);
    });
})();
