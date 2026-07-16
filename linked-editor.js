// Linked slice quick editor
(function () {
    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>'"]/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[character]));
    }

    function installLinkedSliceEditor() {
        if (!window.wheel || document.getElementById('linkedEditorSection')) return;

        const controlPanel = document.querySelector('.control-panel');
        if (!controlPanel) return;

        const section = document.createElement('div');
        section.id = 'linkedEditorSection';
        section.className = 'panel-section linked-editor-section';
        section.innerHTML = `
            <h2>Quick Edit Linked Slices</h2>
            <p class="editor-help">Edit the slices inside any linked race wheel without opening each wheel.</p>
            <label for="linkedWheelSelect">Linked wheel</label>
            <select id="linkedWheelSelect" class="input"></select>
            <div id="linkedSlicesEditor" class="linked-slices-editor"></div>
        `;
        controlPanel.insertBefore(section, controlPanel.lastElementChild);

        document.getElementById('linkedWheelSelect').addEventListener('change', renderLinkedSlices);
        renderLinkedWheelOptions();
    }

    function renderLinkedWheelOptions() {
        const select = document.getElementById('linkedWheelSelect');
        if (!select || !window.wheel) return;

        const linkedWheelIds = [...new Set(window.wheel.slices
            .map(slice => slice.linkedWheelId)
            .filter(Boolean))];
        const availableIds = Object.keys(window.wheel.wheels)
            .filter(id => linkedWheelIds.includes(id));

        select.innerHTML = availableIds.map(id =>
            `<option value="${escapeHtml(id)}">${escapeHtml(window.wheel.wheels[id].name)}</option>`
        ).join('');

        if (!availableIds.length) {
            select.innerHTML = '<option value="">No linked wheels yet</option>';
        }
        renderLinkedSlices();
    }

    function renderLinkedSlices() {
        const select = document.getElementById('linkedWheelSelect');
        const editor = document.getElementById('linkedSlicesEditor');
        if (!select || !editor || !window.wheel) return;

        const wheelId = select.value;
        const linkedWheel = window.wheel.wheels[wheelId];
        if (!linkedWheel) {
            editor.innerHTML = '<p class="editor-empty">Link a slice to a wheel to edit its contents here.</p>';
            return;
        }

        if (!linkedWheel.slices.length) {
            editor.innerHTML = '<p class="editor-empty">This linked wheel has no slices yet.</p>';
            return;
        }

        editor.innerHTML = linkedWheel.slices.map((slice, index) => `
            <div class="linked-slice-editor" data-slice-index="${index}">
                <input class="input linked-name" type="text" value="${escapeHtml(slice.name)}" aria-label="Slice name">
                <div class="linked-slice-row">
                    <input class="input linked-probability" type="number" min="1" max="100" value="${Number(slice.probability) || 1}" aria-label="Slice probability">
                    <input class="linked-color" type="color" value="${/^#[0-9a-f]{6}$/i.test(slice.color) ? slice.color : '#667eea'}" aria-label="Slice color">
                    <button class="btn btn-success linked-save" type="button">Save</button>
                </div>
                <span class="linked-save-status" aria-live="polite"></span>
            </div>
        `).join('');

        editor.querySelectorAll('.linked-save').forEach(button => {
            button.addEventListener('click', () => saveLinkedSlice(button));
        });
    }

    function saveLinkedSlice(button) {
        const editorRow = button.closest('.linked-slice-editor');
        const select = document.getElementById('linkedWheelSelect');
        const linkedWheel = window.wheel.wheels[select.value];
        const index = Number(editorRow.dataset.sliceIndex);
        const slice = linkedWheel?.slices[index];
        if (!slice) return;

        const name = editorRow.querySelector('.linked-name').value.trim();
        const probability = Number(editorRow.querySelector('.linked-probability').value);
        const color = editorRow.querySelector('.linked-color').value;
        const status = editorRow.querySelector('.linked-save-status');

        if (!name || !Number.isFinite(probability) || probability < 1 || probability > 100) {
            status.textContent = 'Enter a name and probability from 1 to 100.';
            status.className = 'linked-save-status error';
            return;
        }

        slice.name = name;
        slice.probability = probability;
        slice.color = color;
        window.wheel.saveToStorage();
        status.textContent = 'Saved';
        status.className = 'linked-save-status saved';
        window.setTimeout(() => { status.textContent = ''; }, 1800);
    }

    document.addEventListener('DOMContentLoaded', () => {
        window.setTimeout(installLinkedSliceEditor, 0);
    });
})();
