// Linked wheel slice editor
(function () {
    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>'"]/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[character]));
    }

    function renderLinkedWheelOptions() {
        const select = document.getElementById('linkedWheelSelect');
        if (!select || !window.wheel) return;

        const linkedIds = new Set(window.wheel.slices.map(slice => slice.linkedWheelId).filter(Boolean));
        const wheelIds = Object.keys(window.wheel.wheels).filter(id => linkedIds.has(id));
        select.innerHTML = wheelIds.length
            ? wheelIds.map(id => `<option value="${escapeHtml(id)}">${escapeHtml(window.wheel.wheels[id].name)}</option>`).join('')
            : '<option value="">No linked wheels yet</option>';
        renderLinkedSlices();
    }

    function renderLinkedSlices() {
        const select = document.getElementById('linkedWheelSelect');
        const editor = document.getElementById('linkedSlicesEditor');
        if (!select || !editor || !window.wheel) return;

        const linkedWheel = window.wheel.wheels[select.value];
        if (!linkedWheel) {
            editor.innerHTML = '<p class="editor-empty">Link a main-wheel slice to a wheel to edit it here.</p>';
            return;
        }

        editor.innerHTML = linkedWheel.slices.length
            ? linkedWheel.slices.map((slice, index) => `
                <div class="linked-slice-editor" data-slice-index="${index}">
                    <input class="input linked-name" type="text" value="${escapeHtml(slice.name)}" aria-label="Linked slice name">
                    <div class="linked-slice-row">
                        <label>Probability
                            <input class="input linked-probability" type="number" min="1" max="100" value="${Number(slice.probability) || 1}">
                        </label>
                        <label>Color
                            <input class="linked-color" type="color" value="${/^#[0-9a-f]{6}$/i.test(slice.color) ? slice.color : '#667eea'}">
                        </label>
                    </div>
                    <button class="btn btn-success linked-save" type="button">Save slice</button>
                    <span class="linked-save-status" aria-live="polite"></span>
                </div>
            `).join('')
            : '<p class="editor-empty">This linked wheel has no slices yet.</p>';

        editor.querySelectorAll('.linked-save').forEach(button => {
            button.addEventListener('click', () => saveLinkedSlice(button));
        });
    }

    function saveLinkedSlice(button) {
        const row = button.closest('.linked-slice-editor');
        const wheelId = document.getElementById('linkedWheelSelect').value;
        const linkedWheel = window.wheel.wheels[wheelId];
        const slice = linkedWheel?.slices[Number(row.dataset.sliceIndex)];
        const status = row.querySelector('.linked-save-status');
        if (!slice) return;

        const name = row.querySelector('.linked-name').value.trim();
        const probability = Number(row.querySelector('.linked-probability').value);
        if (!name || !Number.isFinite(probability) || probability < 1 || probability > 100) {
            status.textContent = 'Enter a name and probability from 1 to 100.';
            status.className = 'linked-save-status error';
            return;
        }

        slice.name = name;
        slice.probability = probability;
        slice.color = row.querySelector('.linked-color').value;
        window.wheel.saveToStorage();
        status.textContent = 'Saved';
        status.className = 'linked-save-status saved';
        window.setTimeout(() => { status.textContent = ''; }, 1800);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const select = document.getElementById('linkedWheelSelect');
        if (select) select.addEventListener('change', renderLinkedSlices);
        window.setTimeout(renderLinkedWheelOptions, 100);
    });
})();
