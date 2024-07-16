document.addEventListener('DOMContentLoaded', function() {
  const promptInput = document.getElementById('prompt-input');
  const saveButton = document.getElementById('save-prompt');
  const promptList = document.getElementById('prompt-list');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  let prompts = [];

  // Load saved prompts
  chrome.storage.sync.get(['prompts'], function(result) {
    prompts = result.prompts || [];
    renderPrompts();
  });

  // Save prompt
  saveButton.addEventListener('click', function() {
    const promptText = promptInput.value.trim();
    if (promptText) {
      prompts.unshift({ text: promptText, timestamp: Date.now() });
      chrome.storage.sync.set({ prompts: prompts }, function() {
        promptInput.value = '';
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
      
      li.textContent = promptPreview;
      li.title = prompt.text;
      li.addEventListener('click', function() {
        promptInput.value = prompt.text;
      });

      promptList.appendChild(li);
    });
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }
});