(function (eConfigForm, eCard, eIcon, eWord, eIconField, eWordField, eCardImage, eDownload) {

    /** @var {HTMLFormElement} eConfigForm **/
    /** @var {HTMLDivElement} eCard **/
    /** @var {HTMLElement} eIcon **/
    /** @var {HTMLDivElement} eWord **/
    /** @var {HTMLSelectElement} eIconField **/
    /** @var {HTMLInputElement} eWordField **/
    /** @var {HTMLCanvasElement} eCardImage **/
    /** @var {HTMLButtonElement} eDownload **/

    /** @var {string} defaultIcon **/
    const defaultIcon = 'book';

    /** @var {string} defaultWord **/
    const defaultWord = 'словодня';

    /** @var {string} svgHeader **/
    const svgHeader = '<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}">' +
        '<foreignObject width="100%" height="100%">' +
        '<defs>' +
        '<style type="text/css">{style}</style>' +
        '</defs>' +
        '<div xmlns="http://www.w3.org/1999/xhtml">';

    /** @var {string} svgFooter **/
    const svgFooter = '</div></foreignObject></svg>';

    /** @var {int} scaleFactor **/
    const scaleFactor = 2;

    /**
     * Renders HTML card from config form data.
     */
    function renderFormHtml() {
        let icon = eIconField.value,
            word = eWordField.value;

        storeState(icon, word);

        render(icon, word);
    }

    /**
     * Renders HTML card into the canvas.
     *
     * @param {function} postRenderCallback Callback to execute after the canvas is drawn
     */
    function renderFormCanvas(postRenderCallback) {

        eCardImage.width = eCard.clientWidth * scaleFactor;
        eCardImage.height = eCard.clientHeight * scaleFactor;

        let context = eCardImage.getContext('2d');

        let contents =
            svgHeader
                .replace('{width}', eCard.clientWidth)
                .replace('{height}', eCard.clientHeight)
                .replace('{style}', getElementStyle(eCard)) +
            eCard.outerHTML +
            svgFooter;

        contents = encodeURIComponent(contents);

        let img = new Image();
        img.onload = function () {
            context.scale(scaleFactor, scaleFactor);
            context.drawImage(img, 0, 0);
            postRenderCallback();
        };
        img.src = 'data:image/svg+xml,' + contents;
    }

    /**
     * Gets CSS text of the computed style for the element and all its children.
     *
     * @param {HTMLElement} elm Element to calculate style for
     *
     * @returns {string} Calculated style
     */
    function getElementStyle(elm) {
        const suffixes = [
            null,
            '::before',
            '::after',
        ];

        let style = '';
        for (let i in suffixes) {
            let selectorStyles = '',
                suffix = suffixes[i],
                properties = window.getComputedStyle(elm, suffix);

            for (let name in properties) {
                let value = properties.getPropertyValue(name);
                if (isNaN(name) && value !== '') {
                    selectorStyles += name + ':' + value + ';';
                }
            }

            let selector = elm.id
                ? ('#' + elm.id)
                : ('.' + elm.className);

            style += selector +
                (suffix === null ? '' : suffix) +
                '{' +
                selectorStyles +
                '}';
        }

        let elmChildren = elm.children;
        for (let i = 0; i < elmChildren.length; i++) {
            style += getElementStyle(elmChildren[i]);
        }

        return style;
    }

    /**
     * Renders HTML card.
     *
     * @param {string} icon Icon to draw on the card
     * @param {string} word Word to print on the card
     */
    function render(icon, word) {
        eIcon.className = eIcon.dataset.class.replace('{icon}', icon);
        eWord.innerText = word;
        eDownload.download = eDownload.dataset.download.replace('{word}', word);

        eIconField.value = icon;
        eWordField.value = word;
    }

    /**
     * Reads card properties from the URL.
     */
    function readState() {
        let state = window.location.search.substr(1).split('&'),
            stateObj = {};

        for (let i in state) {
            let param = state[i].split('=');
            stateObj[param[0]] = decodeURIComponent(param[1]) || null;
        }

        stateObj.icon = stateObj.icon || defaultIcon;
        stateObj.word = stateObj.word || defaultWord;

        return stateObj;
    }

    /**
     * Stores card properties in the URL.
     *
     * @param {string} icon Icon to draw on the card
     * @param {string} word Word to print on the card
     */
    function storeState(icon, word) {
        history.pushState(
            {},
            '',
            './?icon='
            + encodeURIComponent(icon)
            + '&word='
            + encodeURIComponent(word)
        );
    }

    /**
     * Adds render on config form submit.
     */
    function addConfigFormHandler() {
        eConfigForm.onsubmit = function (event) {
            event.preventDefault();
            renderFormHtml();
        };
    }

    /**
     * Adds render to canvas and image save.
     */
    function addCardSaveHandler() {
        eDownload.onclick = function (event) {
            renderFormHtml();

            if (eDownload.dataset.isDownloadReady === 'true') {
                eDownload.dataset.isDownloadReady = 'false';
                return true;
            }

            event.preventDefault();
            renderFormCanvas(saveCanvas);
        };
    }

    /**
     * Triggers file download.
     */
    function saveCanvas() {
        eDownload.href = eCardImage.toDataURL('image/png');
        eDownload.dataset.isDownloadReady = 'true';
        eDownload.click();
    }

    /**
     * Main routine.
     *
     * @returns {int}
     */
    function main() {
        const state = readState();
        render(state.icon, state.word);

        addConfigFormHandler();
        addCardSaveHandler();

        return 0;
    }

    main();
})(
    document.getElementById('config_form'),
    document.getElementById('card'),
    document.getElementById('icon'),
    document.getElementById('word'),
    document.getElementById('icon_input'),
    document.getElementById('word_input'),
    document.getElementById('card_image'),
    document.getElementById('download'),
);