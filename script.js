function renderCard(icon, word) {
    var elmIcon      = document.getElementById('icon'),
        elmWord      = document.getElementById('word'),
        elmIconValue = document.getElementById('icon_input'),
        elmWordValue = document.getElementById('word_input');

    elmIcon.className = elmIcon.dataset.class.replace('{icon}', icon);
    elmWord.innerText = word;

    elmIconValue.value = icon;
    elmWordValue.value = word;
}

function readCardConfig() {
    var config    = window.location.search.substr(1).split('&'),
        configObj = {};

    for (var i in config) {
        var param = config[i].split('=');
        configObj[param[0]] = decodeURIComponent(param[1]) || null;
    }

    configObj.icon = configObj.icon || 'book';
    configObj.word = configObj.word || 'словодня';

    return configObj;
}

document.getElementById('config_form').onsubmit = function(event) {
    event.preventDefault();

    var icon = document.getElementById('icon_input').value,
        word = document.getElementById('word_input').value;

    history.pushState(
        {},
        '',
        './?icon='
        + encodeURIComponent(icon)
        + '&word='
        + encodeURIComponent(word)
    );

    renderCard(icon, word);
};

var configObj = readCardConfig();
renderCard(configObj.icon, configObj.word);