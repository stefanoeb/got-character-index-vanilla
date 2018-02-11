'use strict';

var debounceTimer = void 0;
var debounceMs = 500;

function onSearchChange(value) {
  clearTimeout(debounceTimer);
  var searchString = value;
  var valid = isValid(searchString);
  if (valid) {
    hideElement('error');
    debounceTimer = setTimeout(function () {
      document.getElementById('loading').style.display = 'inline-block';
      window.fetch('https://api.got.show/api/characters/locations/' + value).then(function (response) {
        hideElement('loading');
        return response.text();
      }).then(function (data) {
        var characters = JSON.parse(data).data || [];
        if (characters.length > 0) {
          buildSuggestionResults(characters.slice(0, 6).map(function (character) {
            return character.name;
          }));
        }
      }).catch(function (error) {
        console.error(error);
        hideElement('loading');
      });
    }, debounceMs);
  } else {
    document.getElementById('error').style.display = 'block';
  }
}

function onKeyDownSearch(event) {
  var suggestions = document.getElementById('suggestions-ul');
  if (event.key === 'ArrowDown' && suggestions && suggestions.firstChild.nextSibling) {
    suggestions.firstChild.nextSibling.focus();
  }
}

function isValid() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  return text.length > 3;
}

function hideElement(id) {
  document.getElementById(id).style.display = 'none';
}

function buildSuggestionResults(names) {
  // Jesus this is so 90s
  var innerHTML = '<div class="suggestions-wrapper">';
  innerHTML += '<ul id="suggestions-ul">';

  innerHTML += names.reduce(function (html, name) {
    html += '\n      <li\n        tabindex="0"\n        id="li-' + name + '"\n      >\n        <div class="suggestion-div">\n          <h4>' + name + '</h4>\n        </div>\n      </li>\n    ';
    return html;
  }, '');

  innerHTML += '</ul>';
  innerHTML += '</div>';
  var elemSuggestions = document.getElementById('suggestions');
  elemSuggestions.innerHTML = innerHTML;
  elemSuggestions.style.display = 'block';

  // This foreach below is needed because templates dont get evalued in the insertion time
  names.forEach(function (name) {
    var el = document.getElementById('li-' + name);
    el.addEventListener('click', function () {
      return onSuggestionClick(name);
    });
    el.addEventListener('keydown', function (event) {
      return onNavigateSuggestions(event, name);
    });
  });
}

function onSuggestionClick(name) {
  document.getElementById('search').value = name;
  hideElement('suggestions');
}

function onNavigateSuggestions(event, name) {
  var target = event.target,
      key = event.key;

  if (key === 'Enter') {
    onSuggestionClick(name);
  } else if (key === 'ArrowDown' && target.nextSibling.nextSibling) {
    target.nextSibling.nextSibling.focus();
  } else if (key === 'ArrowUp' && target.previousSibling.previousSibling) {
    target.previousSibling.previousSibling.focus();
  }
}

// Listeners
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('search').addEventListener('keydown', onKeyDownSearch);
});