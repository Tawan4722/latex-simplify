document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const formulaInput = document.getElementById('formula-input');
  const mathPreview = document.getElementById('math-preview');
  const latexOutput = document.getElementById('latex-output');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const mathKeys = document.querySelectorAll('.math-key');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // Placeholder texts
  const previewPlaceholder = '<span class="placeholder-text">Your rendered formula will appear here...</span>';
  const emptyCodePlaceholder = '\\text{Your formula is empty}';

  // Real-time rendering function using KaTeX
  function updatePreview() {
    const rawValue = formulaInput.value.trim();

    if (!rawValue) {
      mathPreview.innerHTML = previewPlaceholder;
      latexOutput.textContent = emptyCodePlaceholder;
      return;
    }

    // Update Raw LaTeX Panel
    latexOutput.textContent = formulaInput.value;

    // Render mathematical preview
    try {
      // Use KaTeX displayMode rendering
      katex.render(formulaInput.value, mathPreview, {
        displayMode: true,
        throwOnError: false,
        trust: true,
        strict: false
      });
    } catch (err) {
      console.error('KaTeX rendering error:', err);
    }
  }

  // Insert template at current textarea cursor position
  function insertTemplate(template) {
    const startPos = formulaInput.selectionStart;
    const endPos = formulaInput.selectionEnd;
    const text = formulaInput.value;
    
    // Insert the template
    const newText = text.substring(0, startPos) + template + text.substring(endPos);
    formulaInput.value = newText;
    
    // Focus the textarea
    formulaInput.focus();
    
    // Find the first '?' character in the inserted template to select it
    const placeholderIndex = template.indexOf('?');
    
    if (placeholderIndex !== -1) {
      // Select the placeholder character
      const targetSelStart = startPos + placeholderIndex;
      formulaInput.setSelectionRange(targetSelStart, targetSelStart + 1);
    } else {
      // Place cursor right after the inserted text
      const nextCursorPos = startPos + template.length;
      formulaInput.setSelectionRange(nextCursorPos, nextCursorPos);
    }
    
    // Update live rendering
    updatePreview();
  }

  // Tab Navigation for Keypad
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Toggle active states on tab buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Toggle active states on tab panes
      tabPanes.forEach(pane => {
        if (pane.id === `tab-${targetTab}`) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });

  // Attach key listeners to math keypad keys
  mathKeys.forEach(key => {
    key.addEventListener('click', (e) => {
      e.preventDefault();
      const template = key.getAttribute('data-insert');
      insertTemplate(template);
    });
  });

  // Clear button handler
  clearBtn.addEventListener('click', () => {
    formulaInput.value = '';
    formulaInput.focus();
    updatePreview();
  });

  // Textarea input event handler
  formulaInput.addEventListener('input', () => {
    updatePreview();
  });

  // Copy to clipboard functionality
  copyBtn.addEventListener('click', async () => {
    const rawValue = formulaInput.value.trim();
    const textToCopy = rawValue ? formulaInput.value : '';

    if (!textToCopy) {
      showToast('Nothing to copy! Type some math first.', 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('LaTeX copied to clipboard!', 'success');
      
      // Update Button State to show success visual feedback
      const originalHtml = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span class="btn-text">Copied!</span>
      `;
      copyBtn.style.background = 'linear-gradient(135deg, var(--success), #2ecc71)';
      copyBtn.style.boxShadow = '0 4px 14px var(--success-glow)';
      
      setTimeout(() => {
        copyBtn.innerHTML = originalHtml;
        copyBtn.style.background = '';
        copyBtn.style.boxShadow = '';
      }, 2000);

    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      showToast('Failed to copy. Please select and copy manually.', 'error');
    }
  });

  // Helper to trigger toast notification
  function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    // Set colors based on notification type
    if (type === 'success') {
      toast.style.borderColor = 'var(--success)';
      toast.style.background = 'hsla(145, 80%, 6%, 0.95)';
      toast.style.boxShadow = '0 8px 30px var(--success-glow)';
    } else if (type === 'warning') {
      toast.style.borderColor = 'hsl(45, 100%, 50%)';
      toast.style.background = 'hsla(45, 100%, 6%, 0.95)';
      toast.style.boxShadow = '0 8px 30px hsla(45, 100%, 50%, 0.15)';
    } else {
      toast.style.borderColor = 'var(--danger)';
      toast.style.background = 'hsla(355, 85%, 6%, 0.95)';
      toast.style.boxShadow = '0 8px 30px hsla(355, 85%, 55%, 0.15)';
    }

    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Keyboard Shorthand Replacements to make typing fluid like a calculator
  const shorthands = {
    '* ': '\\times ',
    '/ ': '\\frac{?}{?} ',
    'pi ': '\\pi ',
    'theta ': '\\theta ',
    'alpha ': '\\alpha ',
    'beta ': '\\beta ',
    'gamma ': '\\gamma ',
    'delta ': '\\delta ',
    'omega ': '\\omega ',
    'phi ': '\\phi ',
    'lambda ': '\\lambda ',
    'inf ': '\\infty ',
    'sum ': '\\sum_{?}^{?} ',
    'int ': '\\int_{?}^{?} ',
    'approx ': '\\approx ',
    '!= ': '\\neq ',
    '<= ': '\\leq ',
    '>= ': '\\geq ',
    '-> ': '\\to ',
  };

  formulaInput.addEventListener('keydown', (e) => {
    // Enable simple tab indentation in textarea
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = formulaInput.selectionStart;
      const end = formulaInput.selectionEnd;
      formulaInput.value = formulaInput.value.substring(0, start) + '  ' + formulaInput.value.substring(end);
      formulaInput.selectionStart = formulaInput.selectionEnd = start + 2;
      updatePreview();
    }
  });

  // Watch typing for shorthands and swap them instantly
  formulaInput.addEventListener('keyup', (e) => {
    const text = formulaInput.value;
    const caretPos = formulaInput.selectionStart;
    
    // Check if we hit space or specific symbols
    if (e.key === ' ' || e.key === '=' || e.key === '>') {
      // Find the last typed word/symbol before caret
      const textBeforeCaret = text.substring(0, caretPos);
      
      for (const [shorthand, replacement] of Object.entries(shorthands)) {
        if (textBeforeCaret.endsWith(shorthand)) {
          const matchStart = caretPos - shorthand.length;
          
          // Replace shorthand with LaTeX equivalent
          formulaInput.value = text.substring(0, matchStart) + replacement + text.substring(caretPos);
          
          // Reset caret position
          const placeholderIndex = replacement.indexOf('?');
          if (placeholderIndex !== -1) {
            const targetSelStart = matchStart + placeholderIndex;
            formulaInput.focus();
            formulaInput.setSelectionRange(targetSelStart, targetSelStart + 1);
          } else {
            const newCaretPos = matchStart + replacement.length;
            formulaInput.focus();
            formulaInput.setSelectionRange(newCaretPos, newCaretPos);
          }
          
          updatePreview();
          break;
        }
      }
    }
  });

  // Initialize preview on page load
  updatePreview();
});
