document.addEventListener('DOMContentLoaded', function() {
  const promptInput = document.getElementById('prompt-input');
  const saveButton = document.getElementById('save-prompt');
  const promptList = document.getElementById('prompt-list');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  let prompts = [];
  let editingIndex = -1;

  // Load saved prompts
  chrome.storage.sync.get(['prompts'], function(result) {
    prompts = result.prompts || [];
    renderPrompts();
  });

  // Save prompt
  saveButton.addEventListener('click', function() {
    const promptText = promptInput.value.trim();
    if (promptText) {
      if (editingIndex === -1) {
        // Add new prompt
        prompts.unshift({ text: promptText, timestamp: Date.now() });
      } else {
        // Update existing prompt
        prompts[editingIndex].text = promptText;
        prompts[editingIndex].timestamp = Date.now();
        editingIndex = -1;
      }
      chrome.storage.sync.set({ prompts: prompts }, function() {
        promptInput.value = '';
        saveButton.textContent = 'Save';
        renderPrompts();
      });
    }
  });

  // Search prompts
  searchInput.addEventListener('input', function() {
    renderPrompts();
  });

  // Sort prompts
  sortSelect.addEventListener('change', function() {
    renderPrompts();
  });

  function renderPrompts() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortMethod = sortSelect.value;

    let filteredPrompts = prompts.filter(prompt => 
      prompt.text.toLowerCase().includes(searchTerm)
    );

    if (sortMethod === 'time') {
      filteredPrompts.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortMethod === 'custom') {
      // Implement custom sorting logic here
    }

    promptList.innerHTML = '';
    filteredPrompts.forEach(function(prompt, index) {
      const li = document.createElement('li');
      const promptPreview = truncateText(prompt.text, 50);
      
      const promptSpan = document.createElement('span');
      promptSpan.textContent = promptPreview;
      promptSpan.title = prompt.text;
      promptSpan.classList.add('prompt-text');
      promptSpan.addEventListener('click', function() {
        promptInput.value = prompt.text;
      });

      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('button-container');

      const editButton = createButton('Edit', function() {
        promptInput.value = prompt.text;
        editingIndex = prompts.indexOf(prompt);
        saveButton.textContent = 'Update';
      });

      const deleteButton = createButton('Delete', function() {
        if (confirm('Are you sure you want to delete this prompt?')) {
          prompts.splice(prompts.indexOf(prompt), 1);
          chrome.storage.sync.set({ prompts: prompts }, renderPrompts);
        }
      });

      const copyButton = createButton('Copy', function() {
        navigator.clipboard.writeText(prompt.text).then(function() {
          alert('Prompt copied to clipboard!');
        });
      });

      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);
      buttonContainer.appendChild(copyButton);

      li.appendChild(promptSpan);
      li.appendChild(buttonContainer);
      promptList.appendChild(li);
    });
  }

  function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('prompt-button');
    button.addEventListener('click', onClick);
    return button;
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }
});