let elements = [];
let selectedElement = null;
let transformMode = false;
let canvasWidth = 800;
let canvasHeight = 600;

const canvas = document.getElementById('canvas');
canvas.style.width = canvasWidth + 'px';
canvas.style.height = canvasHeight + 'px';
const addBtn = document.getElementById('add-btn');
const elementType = document.getElementById('element-type');
const transformBtn = document.getElementById('transform-btn');
const exportBtn = document.getElementById('export-btn');
const keepRatioCheck = document.getElementById('keep-ratio-check');

addBtn.addEventListener('click', (e) => {
    console.log('Add button clicked');
    const type = elementType.value;
    const x = canvasWidth / 2 - 25;
    const y = canvasHeight / 2 - 25;
    addElement(type, x, y);
});

transformBtn.addEventListener('click', () => {
    transformMode = !transformMode;
    console.log('Transform button clicked, mode:', transformMode);
    transformBtn.textContent = transformMode ? 'Exit Transform' : 'Transform';
    updateInteractions();
});

const setCanvasSizeBtn = document.getElementById('set-canvas-size');
setCanvasSizeBtn.addEventListener('click', () => {
    canvasWidth = parseInt(document.getElementById('canvas-width').value) || 800;
    canvasHeight = parseInt(document.getElementById('canvas-height').value) || 600;
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    console.log('Canvas size set to:', canvasWidth, canvasHeight);
});

exportBtn.addEventListener('click', () => {
    const html = generateHTML();
    download(html, 'page.html');
    console.log('Export button clicked, HTML generated and downloaded');
});

window.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = () => {
                const x = canvasWidth / 2 - 50;
                const y = canvasHeight / 2 - 50;
                addImageFromData(reader.result, x, y);
            };
            reader.readAsDataURL(blob);
        }
    }
    console.log('Paste event detected, items:', items);
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const target = e.target.closest('.element');
    if (target) {
        showContextMenu(target, e.clientX, e.clientY);
    }
    console.log('Context menu event on canvas, target:', target);
});

document.addEventListener('keydown', (e) => {
    if (!selectedElement || !transformMode) return;
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const angle = (parseFloat(selectedElement.getAttribute('data-angle')) || 0) - 5;
        selectedElement.setAttribute('data-angle', angle);
        updateTransform(selectedElement);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const angle = (parseFloat(selectedElement.getAttribute('data-angle')) || 0) + 5;
        selectedElement.setAttribute('data-angle', angle);
        updateTransform(selectedElement);
    }
    console.log('Keydown event:', e.key, 'on selected element:', selectedElement);
});

function addElement(type, x = 100, y = 100) {
    let el;
    switch (type) {
        case 'text':
            el = document.createElement('div');
            el.textContent = 'New Text';
            el.style.color = 'white';
            el.style.width = '100px';
            el.style.height = '30px';
            el.style.padding = '5px';
            break;
        case 'link':
            el = document.createElement('a');
            el.textContent = 'New Link';
            el.href = '#';
            el.style.color = 'white';
            el.style.display = 'inline-block';
            el.style.width = '100px';
            el.style.height = '30px';
            el.style.padding = '5px';
            break;
        case 'image':
            el = document.createElement('img');
            loadMedia(el, 'image');
            return;
        case 'video':
            el = document.createElement('video');
            el.controls = false;
            el.style.width = '200px';
            el.style.height = '150px';
            loadMedia(el, 'video');
            return;
        case 'audio': 
            // Put audio inside a container div to fix dessapearing controls issue
            el = document.createElement('div'); 
            el.classList.add('audio-container');
            el.innerHTML = '<span class="placeholder" style="color:white; font-size:12px;">Audio Placeholder</span>';
            const audio = document.createElement('audio');
            audio.controls = false; 
            el.appendChild(audio);

            loadMedia(audio, 'audio'); 
            return;
    }
    if (el) {
        el.classList.add('element');
        el.dataset.id = Date.now();
        el.setAttribute('data-x', x);
        el.setAttribute('data-y', y);
        el.setAttribute('data-angle', 0);
        el.style.transform = `translate(${x}px, ${y}px)`;
        canvas.appendChild(el);
        elements.push(el);
        updateElementList();
        selectElement(el);
        updateInteractions();
    }
    console.log('Element added:', type, 'at:', x, y);
}

function addImageFromData(data, x, y) {
    const img = document.createElement('img');
    img.src = data;
    img.classList.add('element');
    img.dataset.id = Date.now();
    img.setAttribute('data-x', x);
    img.setAttribute('data-y', y);
    img.setAttribute('data-angle', 0);
    img.style.transform = `translate(${x}px, ${y}px)`;
    canvas.appendChild(img);
    elements.push(img);
    updateElementList();
    selectElement(img);

    console.log('Image added from data at:', x, y);
}

function loadMedia(el, type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                el.src = reader.result;
                
                // If it's audio, the 'element' is the parent div
                const target = type === 'audio' ? el.parentElement : el;
                
                target.classList.add('element');
                target.dataset.id = Date.now();
                target.setAttribute('data-x', 100);
                target.setAttribute('data-y', 100);
                target.setAttribute('data-angle', 0);
                
                if (type === 'video') {
                    target.style.width = '200px';
                    target.style.height = '150px';
                } else if (type === 'audio') {
                    // Audio div is already styled in styles.css
                }
                
                target.style.transform = `translate(100px, 100px)`;
                canvas.appendChild(target);
                elements.push(target);
                updateElementList();
                selectElement(target);
                updateInteractions();
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function addImageFromData(data, x, y) {
    const img = document.createElement('img');
    img.src = data;
    img.classList.add('element');
    img.dataset.id = Date.now();
    img.setAttribute('data-x', x);
    img.setAttribute('data-y', y);
    img.setAttribute('data-angle', 0);
    img.style.transform = `translate(${x}px, ${y}px)`;
    canvas.appendChild(img);
    elements.push(img);
    updateElementList();
    selectElement(img);
    updateInteractions();

    console.log('Image added from data at:', x, y);
}

function updateInteractions() {
    interact('.element').unset();
    if (transformMode) {
        interact('.element')
            .draggable({
                onmove: (event) => {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                    updateTransform(target);
                }
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true }
            })
            .on('resizestart', (event) => {
                const target = event.target;
                target.setAttribute('data-aspect-ratio', target.offsetWidth / target.offsetHeight);
            })
            .on('resizemove', (event) => {
                const target = event.target;
                let x = (parseFloat(target.getAttribute('data-x')) || 0);
                let y = (parseFloat(target.getAttribute('data-y')) || 0);
                let width = event.rect.width;
                let height = event.rect.height;
                
                // If keep ratio is checked, maintain aspect ratio
                // FIXME: Ratio breaks when making it too small
                if (keepRatioCheck.checked) {
                    const aspectRatio = parseFloat(target.getAttribute('data-aspect-ratio')) || 1;
                    // Adjust height based on width change
                    height = width / aspectRatio;
                }
                
                target.style.width = width + 'px';
                target.style.height = height + 'px';
                x += event.deltaRect.left;
                y += event.deltaRect.top;
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
                updateTransform(target);
            });

        interact('.element').gesturable({
            onmove: (event) => {
                const target = event.target;
                const angle = (parseFloat(target.getAttribute('data-angle')) || 0) + event.da;
                target.setAttribute('data-angle', angle);
                updateTransform(target);
            }
        });
    } else {
        interact('.element').draggable({
            onmove: (event) => {
                const target = event.target;
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
                updateTransform(target);
            }
        });
    }
}

function showContextMenu(el, x, y) {
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.style.background = 'white';
    menu.style.border = '1px solid #ccc';
    menu.style.zIndex = 1000;
    menu.innerHTML = `
        <div class="clickable-item" onclick="changeText('${el.dataset.id}')">Change Text</div>
        <div class="clickable-item" onclick="changeLink('${el.dataset.id}')">Change Link</div>
        <div class="clickable-item" onclick="addId('${el.dataset.id}')">Add ID</div>
        <div class="clickable-item" onclick="removeId('${el.dataset.id}')">Remove ID</div>
        <div class="clickable-item" onclick="addClass('${el.dataset.id}')">Add Class</div>
        <div class="clickable-item" onclick="removeClass('${el.dataset.id}')">Remove Class</div>
        <div class="clickable-item" onclick="deleteElement('${el.dataset.id}')" style="color: red;">Delete</div>
        <div class="clickable-item" onclick="moveUp('${el.dataset.id}')">Move Up</div>
        <div class="clickable-item" onclick="moveDown('${el.dataset.id}')">Move Down</div>
        <div class="clickable-item" onclick="toggleControls('${el.dataset.id}')">Toggle Controls</div>
    `;
    document.body.appendChild(menu);
    document.addEventListener('click', () => menu.remove(), {once: true});
}

function changeText(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el && (el.tagName === 'DIV' || el.tagName === 'A')) {
        const text = prompt('Enter text:', el.textContent);
        if (text !== null) el.textContent = text;
    }
}

function changeLink(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el && el.tagName === 'A') {
        const href = prompt('Enter link:', el.href);
        if (href !== null) el.href = href;
    }
}

function addId(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    const newId = prompt('Enter ID:');
    if (newId) el.id = newId;
}

function removeId(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    el.id = '';
}

function addClass(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    const cls = prompt('Enter class:');
    if (cls) el.classList.add(cls);
}

function removeClass(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    const cls = prompt('Enter class to remove:');
    if (cls) el.classList.remove(cls);
}

function deleteElement(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    el.remove();
    elements = elements.filter(e => e !== el);
    updateElementList();
}

function moveUp(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    const next = el.nextElementSibling;
    if (next) el.parentNode.insertBefore(next, el);
}

function moveDown(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    const prev = el.previousElementSibling;
    if (prev) el.parentNode.insertBefore(el, prev);
}

function toggleControls(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    // Find audio/video inside the clicked element or check if the element is the tag itself
    const media = el.tagName === 'VIDEO' || el.tagName === 'AUDIO' ? el : el.querySelector('audio, video');
    
    if (media) {
        media.controls = !media.controls;
        // Optional: Hide the "🎵 Audio Player" text if controls are on
        if (el.classList.contains('audio-container')) {
            const span = el.querySelector('span');
            if (span) span.style.display = media.controls ? 'none' : 'block';
        }
    }
}

function generateHTML() {
    const isIframeExport = document.getElementById('iframe-check').checked;
    
    // 1. Build the base collage content
    let innerHTML = '<!DOCTYPE html><html><head><title>Exported Page</title></head><body style="margin:0; background:black; position:relative; width:' + canvasWidth + 'px; height:' + canvasHeight + 'px;">';
    
    elements.forEach(el => {
        // Ensure media has controls in the export
        if (el.tagName === 'VIDEO' || el.tagName === 'AUDIO') {
            el.controls = true;
        }
        
        const media = el.querySelector('video, audio');
        if (media) media.controls = true;

        const x = parseFloat(el.getAttribute('data-x')) || 0;
        const y = parseFloat(el.getAttribute('data-y')) || 0;
        const angle = parseFloat(el.getAttribute('data-angle')) || 0;
        
        const clone = el.cloneNode(true);
        clone.removeAttribute('data-id');
        clone.removeAttribute('data-x');
        clone.removeAttribute('data-y');
        clone.removeAttribute('data-angle');
        clone.classList.remove('selected');
        
        clone.style.position = 'absolute';
        clone.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
        
        innerHTML += clone.outerHTML;
    });
    
    innerHTML += '</body></html>';

    // 2. Conditional Iframe Wrapping
    if (isIframeExport) {
        // Escape quotes so srcdoc doesn't break
        const escapedHTML = innerHTML.replace(/"/g, '&quot;');
        
        return `<!DOCTYPE html>
        <html>
        <head><title>Iframe Wrapper</title></head>
        <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#111;">
            <iframe 
                id="exported-iframe"
                width="${canvasWidth}" 
                height="${canvasHeight}" 
                style="border:none; background:black;"
                srcdoc="${escapedHTML}">
            </iframe>
        </body>
        </html>`;
    }

    // Default: Return standard HTML
    return innerHTML;
}

function download(content, filename) {
    const blob = new Blob([content], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Initial setup
updateInteractions();

function updateTransform(el) {
    const x = parseFloat(el.getAttribute('data-x')) || 0;
    const y = parseFloat(el.getAttribute('data-y')) || 0;
    const angle = parseFloat(el.getAttribute('data-angle')) || 0;
    el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
}

function updateElementList() {
    const ul = document.getElementById('elements-ul');
    ul.innerHTML = '';
    elements.forEach(el => {
        const li = document.createElement('li');
        li.textContent = el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.replace('element', '').trim() : '');
        li.onclick = () => selectElement(el);

        li.oncontextmenu = (e) => {
            e.preventDefault();
            selectElement(el); 
            showContextMenu(el, e.clientX, e.clientY);
        };

        ul.appendChild(li);
    });
    console.log('Element list updated:', elements);
}

function selectElement(el) {
    document.querySelectorAll('.element').forEach(elem => elem.classList.remove('selected'));
    document.querySelectorAll('#elements-ul li').forEach(li => li.classList.remove('selected'));
    el.classList.add('selected');
    const lis = document.querySelectorAll('#elements-ul li');
    const index = elements.indexOf(el);
    if (lis[index]) lis[index].classList.add('selected');
    selectedElement = el;
    console.log('Element selected:', el);
}
