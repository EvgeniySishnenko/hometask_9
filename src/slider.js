// import { create } from "domain";

const left = document.querySelector('.slider-btn-left');
const right = document.querySelector('.slider-btn-right');
const slides = document.querySelectorAll('.slider-item');
const numberList = document.querySelector('.slider-numbers--list');
const closed = document.querySelector('.slider--closed');
const container = document.querySelector('.slider--wrapper');
let currentSlide = 0;

function goToSlide(n) {
    const slides = document.querySelectorAll('.slider-item');

    for (let i = 0; i < slides.length; i++) {
        
        if (slides[i].classList.contains('showing')) {
            slides[i].classList.remove('showing');
        }
    }
    slides[currentSlide].className = 'slider-item';
    currentSlide = (n + slides.length) % slides.length; // остаток от деления
    slides[currentSlide].className = 'slider-item showing';
}
function setupListners() {
    right.onclick = function (e) {
        e.preventDefault();
        goToSlide(currentSlide + 1);
        activeNumber(currentSlide + 1);
    }
    left.onclick = function (e) {
        e.preventDefault();
        goToSlide(currentSlide - 1);
        activeNumber(currentSlide + 1);
    }
}

function getCurrentElem (from) {
    do {
        if (from.classList.contains('slider-numbers--item')) {
            return from;
        }
    } while (from = from.parentElement);
}
numberList.addEventListener('click', (e) => {
    let index;
    let target = e.target;
    let child = numberList.childNodes;
   
    for (let i = 0; i < child.length; i++) {
        if (child[i].classList.contains('numbers-active')) {
            child[i].classList.remove('numbers-active');
        }
    }

    if (target.classList.contains('slider-numbers--count')) {
        index = target.getAttribute('attr');  
        goToSlide(index - 1);  
    } else {
        goToSlide(1);
    }

    let activeNumber = getCurrentElem(target);
    
    activeNumber.classList.add('numbers-active');
});

closed.addEventListener('click', () => {
    container.style.display = 'none';
});

function activeNumber(n) {
    let child = numberList.childNodes;

    for (let i = 0; i < child.length; i++) {
        if (child[i].classList.contains('numbers-active')) {
            child[i].classList.remove('numbers-active');
        }
    
    }

    let activeNumber = document.querySelector('#num'+n);

    activeNumber.classList.add('numbers-active');
}


setupListners();

// function numberInit() {
//     return new Promise((resolve) => {
//         console.log('до if');
//         console.log(slides);
//         if (slides.length !== 0) {
//             console.log(slides);
//             console.log('внутри if');
//             resolve();
//         }
//     });
// }
// numberInit().then(() => console.log('внутри then' + slides));

