Array.prototype.shuffle = function () {
    var i = this.length, j, temp;
    if (i == 0) {
        return this;
    }
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
};

var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'Z'];

var randomLetters = letters.shuffle();

var currentIndex = -1;

var targetElement = document.getElementById('letterView');
var infoElement = document.getElementById('letterInfo');

var showNextLetter = function () {
    currentIndex++;
    if (currentIndex >= randomLetters.length) {
        targetElement.textContent = 'Ende';
        return;
    }
    var newLetter = randomLetters[currentIndex];
    targetElement.textContent = newLetter;
    infoElement.textContent = (currentIndex + 1) + ' von ' + randomLetters.length;
};

window.onkeyup = showNextLetter;