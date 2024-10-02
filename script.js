const main = document.getElementById('main');
const header = document.getElementById('header');
const footer = document.getElementById('footer');

let footerDiv = document.createElement('div');
let footerText = document.createElement('p');
footerText.innerHTML = '<a href="https://github.com/FCsab/weblap">GitHub</a>';

footerDiv.style.display = 'flex';
footerDiv.style.justifyContent = 'center';
footerDiv.style.alignItems = 'center';
footerDiv.style.height = '100%';

footerDiv.appendChild(footerText);
footer.appendChild(footerDiv);