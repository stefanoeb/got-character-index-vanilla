let debounceTimer;
const debounceMs = 500;

function onSearchChange(value) {
  clearTimeout(debounceTimer);
  const searchString = value;
  const valid = isValid(searchString);
  if (valid) {
    hideElement('error');
    debounceTimer = setTimeout(() => {
      document.getElementById('loading').style.display = 'inline-block';
      window.fetch('https://api.got.show/api/characters/locations/' + value)
        .then(response => {
          hideElement('loading');
          return response.text();
        })
        .then(data => {
          const characters = JSON.parse(data).data || [];
          if (characters.length > 0) {
            buildSuggestionResults(
              characters.slice(0, 6).map(character => character.name)
            );
          }
        })
        .catch(error => {
          console.error(error);
          hideElement('loading');
        });
    }, debounceMs);
  } else {
    document.getElementById('error').style.display = 'block';
  }
}

function onKeyDownSearch(event) {
  const suggestions = document.getElementById('suggestions-ul');
  if (
    event.key === 'ArrowDown' &&
    suggestions &&
    suggestions.firstChild.nextSibling
  ) {
    suggestions.firstChild.nextSibling.focus();
  }
}

function isValid(text = '') {
  return text.length > 3;
}

function hideElement(id) {
  document.getElementById(id).style.display = 'none';
}

function buildSuggestionResults(names) {
  // Jesus this is so 90s
  let innerHTML = '<div class="suggestions-wrapper">';
  innerHTML += '<ul id="suggestions-ul">';

  innerHTML += names.reduce((html, name) => {
    html += `
      <li
        tabindex="0"
        id="li-${name}"
      >
        <div class="suggestion-div">
          <h4>${name}</h4>
        </div>
      </li>
    `;
    return html;
  }, '');

  innerHTML += '</ul>';
  innerHTML += '</div>';
  const elemSuggestions = document.getElementById('suggestions');
  elemSuggestions.innerHTML = innerHTML;
  elemSuggestions.style.display = 'block';

  // This foreach below is needed because templates dont get evalued in the insertion time
  names.forEach(name => {
    const el = document.getElementById('li-' + name);
    el.addEventListener('click', () => onSuggestionClick(name));
    el.addEventListener('keydown', event => onNavigateSuggestions(event, name));
  });
}

function onSuggestionClick(name) {
  document.getElementById('search').value = name;
  hideElement('suggestions');
}

function onNavigateSuggestions(event, name) {
  const { target, key } = event;
  if (key === 'Enter') {
    onSuggestionClick(name);
  } else if (key === 'ArrowDown' && target.nextSibling.nextSibling) {
    target.nextSibling.nextSibling.focus();
  } else if (key === 'ArrowUp' && target.previousSibling.previousSibling) {
    target.previousSibling.previousSibling.focus();
  }
}

// Listeners
document.addEventListener('DOMContentLoaded', function() {
  document
    .getElementById('search')
    .addEventListener('keydown', onKeyDownSearch);
});
