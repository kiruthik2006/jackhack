// Handle emoji picker visibility
const emojiButton = document.getElementById('emojiButton');
const emojiPicker = document.getElementById('emojiPicker');
const messageInput = document.getElementById('messageInput');

emojiButton.addEventListener('click', () => {
    emojiPicker.classList.toggle('visible');
});

// Close emoji picker when clicking outside
document.addEventListener('click', (e) => {
    if (!emojiButton.contains(e.target) && !emojiPicker.contains(e.target)) {
        emojiPicker.classList.remove('visible');
    }
});

// Handle emoji selection
const picker = document.querySelector('emoji-picker');
picker.addEventListener('emoji-click', event => {
    const emoji = event.detail.unicode;
    const cursorPosition = messageInput.selectionStart;
    const text = messageInput.value;
    messageInput.value = text.slice(0, cursorPosition) + emoji + text.slice(cursorPosition);
    messageInput.focus();
    emojiPicker.classList.remove('visible');
});

// Handle file attachments
const fileInput = document.getElementById('fileInput');
const attachButton = document.getElementById('attachButton');
const previewArea = document.getElementById('previewArea');
const attachmentPreviews = document.getElementById('attachmentPreviews');
let attachedFiles = [];

attachButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files);
    attachedFiles = attachedFiles.concat(files);
    
    // Show preview area if there are files
    if (attachedFiles.length > 0) {
        previewArea.classList.remove('hidden');
    }
    
    // Create previews for new files
    files.forEach(file => {
        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container';
        
        if (file.type.startsWith('image/')) {
            const preview = document.createElement('img');
            preview.className = 'file-preview';
            preview.src = URL.createObjectURL(file);
            previewContainer.appendChild(preview);
        } else {
            const preview = document.createElement('div');
            preview.className = 'p-4 bg-gray-100 rounded-lg flex items-center';
            preview.innerHTML = `
                <i data-feather="file" class="w-5 h-5 mr-2"></i>
                <span class="text-sm truncate">${file.name}</span>
            `;
            previewContainer.appendChild(preview);
        }
        
        // Add remove button
        const removeButton = document.createElement('button');
        removeButton.className = 'absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-lg';
        removeButton.innerHTML = '×';
        removeButton.addEventListener('click', () => {
            const fileIndex = attachedFiles.indexOf(file);
            if (fileIndex > -1) {
                attachedFiles.splice(fileIndex, 1);
                previewContainer.remove();
                if (attachedFiles.length === 0) {
                    previewArea.classList.add('hidden');
                }
            }
        });
        previewContainer.appendChild(removeButton);
        
        attachmentPreviews.appendChild(previewContainer);
    });
    
    // Re-run Feather icons for new file icons
    feather.replace();
});

// Handle message sending
const sendButton = document.getElementById('sendButton');
const chatMessages = document.querySelector('.chat-messages');

function createMessageElement(text, files) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'flex justify-end mb-4';
    
    const messageBubble = document.createElement('div');
    messageBubble.className = 'chat-bubble bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl rounded-tr-none shadow-md';
    
    // Add text if present
    if (text.trim()) {
        const textElement = document.createElement('p');
        textElement.className = 'mb-2';
        textElement.textContent = text;
        messageBubble.appendChild(textElement);
    }
    
    // Add file previews if present
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.className = 'rounded-lg max-w-[200px] mb-2';
            messageBubble.appendChild(img);
        } else {
            const fileElement = document.createElement('div');
            fileElement.className = 'bg-white bg-opacity-20 p-2 rounded-lg mb-2 flex items-center';
            fileElement.innerHTML = `
                <i data-feather="file" class="w-4 h-4 mr-2"></i>
                <span class="text-sm">${file.name}</span>
            `;
            messageBubble.appendChild(fileElement);
        }
    });
    
    messageContainer.appendChild(messageBubble);
    return messageContainer;
}

sendButton.addEventListener('click', () => {
    const text = messageInput.value;
    if (text.trim() || attachedFiles.length > 0) {
        const messageElement = createMessageElement(text, attachedFiles);
        chatMessages.appendChild(messageElement);
        
        // Clear input and attachments
        messageInput.value = '';
        attachedFiles = [];
        attachmentPreviews.innerHTML = '';
        previewArea.classList.add('hidden');
        
        // Re-run Feather icons for new file icons
        feather.replace();
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});