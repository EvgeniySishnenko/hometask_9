import render from '../map-reviews.hbs';
import renderSlider from '../map-slider.hbs';
import './style/style.scss';
import './style/slider.scss';
import './slider.js';


ymaps.ready(init);

const popup = document.querySelector('.wrapper-popup'),
    closed = document.querySelector('.header--closed'),
    button = document.querySelector('.button--add-reviews'),
    form = document.querySelector('.form'),
    wrapper = document.querySelector('.wrapper');
let arrReviews = [],
    oldReviews = [],
    reviews = {},
    placemark,
    address,
    coords;
let hasItemNumber = true;
function init() {
    // Создание карты.    
    let myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 15,
        controls: []
        
    }),
    clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
        hasBalloon: false
    });
    myMap.geoObjects.add(clusterer);

    myMap.events.add('click', function (e) {
        // Получение координат щелчка

        var coords = e.get('coords');
       
        placemark = new ymaps.Placemark(coords, {
            //
        });
       
        myMap.geoObjects.add(placemark);
        placemark.properties.set('type', 'placemark');
        clusterer.add(placemark);
    });
   
    myMap.geoObjects.events.add('click', async (e) => {
        const target = e.get('target');
        
        if (target.properties.get('type') === 'placemark') {
            popup.style.display = 'block';
            mouseMoviePopup(e);

            coords = e.get('coords');

            placemark = e.get('target');
            // получаем адрес  ипереводим из долготы и широты в дом, улица, город
            const response = await ymaps.geocode(coords);
            address = response.geoObjects.get(0).getAddressLine();
            const coordinates = document.querySelector('.header--coordinates');

            coordinates.innerHTML = '';
            coordinates.innerHTML = address; // добавляем адрес  в шапку 

            oldReviews = placemark.properties.get('reviews')
                ? placemark.properties.get('reviews') : [];

            placemark.properties.set('reviews', oldReviews);
            addReviews(oldReviews); // отрисовываем отзывы при клике на маркер
            clusterer.add(placemark);
        
        } else {
            const containerSlider = document.querySelector('.slider--wrapper');
            containerSlider.style.display = 'block';
            
            const target = e.get('target');
            const сlusterMarkers = target.properties.get('geoObjects');
            const sliderReviews = [];
            for (let i = 0; i < сlusterMarkers.length; i++) {
                const cur = сlusterMarkers[i];
                const reviewsArr = cur.properties.get('reviews'); 
                for (let i = 0; i < reviewsArr.length; i++) {
                    const address = reviewsArr[i]['address'];
                    const id = reviewsArr[i]['id'];
                    const date = reviewsArr[i]['date'];
                    const place = reviewsArr[i]['place'];
                    const reviews = reviewsArr[i]['reviews']; 
                    const obj = {
                        id: id,
                        address: address,
                        date: date,
                        place: place,
                        reviews: reviews
                    }
                    sliderReviews.push(obj);
                }
                
            }
            addSlider(sliderReviews);
            mouseMovieSlider(e);
            generateNumberControl();
            addShowing();       
        }
    }); 
 
}

//добавляю класс для первого елемента в слайдере
function addShowing () {
    const slides = document.querySelector('.slider-item');
    slides.classList.add('showing');
    let activeNumber = document.querySelector('#num1');
    activeNumber.classList.add('numbers-active');
}
function generateNumberControl() {
    let num = 0;
    const slides = document.querySelectorAll('.slider-item');
    const numberList = document.querySelector('.slider-numbers--list');
    numberList.innerHTML = '';
    for (let i = 0; i < slides.length; i++) {
        num++;
        const li = document.createElement('li');
        const div = document.createElement('div');

        div.className = 'slider-numbers--count';
        div.setAttribute('attr', num);
        li.setAttribute('data-attr', num);
        li.id = 'num' + num;
        li.className = 'slider-numbers--item';
        numberList.appendChild(li);
        li.appendChild(div);
        div.innerText = num;
    }
}
function mouseMovieSlider(event) {
    let width = wrapper.offsetWidth;
    let height = wrapper.offsetHeight;
    let slider = document.querySelector('.slider--wrapper');
    let heightPopup = slider.offsetHeight;
    let widthPopup = slider.offsetWidth;


    const screenCoords = event.get('position');
    const [offX, offY] = screenCoords;


    let a = height - offY;
    let b = width - offX;
    if (a < heightPopup) {
        let c = height - heightPopup;
        slider.style.top = c - 15 + 'px';
        slider.style.left = offX + 10 + 'px';
    }
    if (b < widthPopup) {
        let c = width - widthPopup - b - 20;
        slider.style.left = c + 'px';
    }
    if (a > heightPopup && b > widthPopup) {
        slider.style.left = offX + 10 + 'px';
        slider.style.top = offY + 'px';
    }
}
function mouseMoviePopup(event) {

    let width = wrapper.offsetWidth;
    let height = wrapper.offsetHeight;
    let heightPopup = popup.offsetHeight;
    let widthPopup = popup.offsetWidth;

  
    const screenCoords = event.get('position');
    const [offX, offY] = screenCoords;
    

    let a = height - offY;
    let b = width - offX;
    if (a < heightPopup) {
        let c = height- heightPopup;
        popup.style.top = c - 15 + 'px';
        popup.style.left = offX + 10 + 'px';
    } 
    if (b < widthPopup) {
        let c = width - widthPopup - b - 20;
        popup.style.left = c + 'px';  
    }
    if (a > heightPopup && b > widthPopup) {
        popup.style.left = offX + 10 + 'px';
        popup.style.top = offY + 'px';
    }
   
} 

closed.addEventListener('click', () => {
    popup.style.display = 'none';
});


button.addEventListener('click', (e) => {
    e.preventDefault();
    let error;
    
    const formName = document.querySelector('#form-name');
    const formPlace = document.querySelector('#form-place');
    const formText = document.querySelector('#form-text');
    // проверка формы
    if (form.elements.formName.value == '') {
        error = false;
        formName.style.border = '1px solid red';
    } else {
        error = true;
        formName.style.border = '1px solid #c4c4c4';
    }
    if (form.elements.formPlace.value == '') {
        error = false;
        formPlace.style.border = '1px solid red';
    } else {
        error = true;
        formPlace.style.border = '1px solid #c4c4c4';
    } 
    if (form.elements.formText.value == '') {
        error = false;
        formText.style.border = '1px solid red';
    } else {
        error = true;
        formText.style.border = '1px solid #c4c4c4';
    }
 // если нет ошибок ...
    if (error != false) { 
        let reviews = {};
        // получем дату
        let d = new Date();
        let currDate = d.getDate();
        let currMonth = d.getMonth() + 1;
        let currYear = d.getFullYear();
       
        // добавляем в объкт
        
        reviews.name = form.elements.formName.value;
        reviews.place = form.elements.formPlace.value;
        reviews.reviews = form.elements.formText.value;
        reviews.date = `${currDate}.${currMonth}.${currYear}`;
        reviews.address = address;
        reviews.id = Date.now();
        reviews.type = 'placemark';
        arrReviews.push(reviews); // это мой объкт держу его на всякий случай

        // заношу в placemark данные
        placemark.properties.set('id', Date.now());
        placemark.properties.set('type', 'placemark');
        placemark.properties.set('address', address);

        oldReviews = placemark.properties.get('reviews')
            ? placemark.properties.get('reviews') : [];
        oldReviews.push(reviews);
        placemark.properties.set('reviews', oldReviews);
        // очищаю поля формы
        form.elements.formName.value = '';
        form.elements.formPlace.value = '';
        form.elements.formText.value = '';

        addReviews(oldReviews);
    }
});
// функци отрисовки отзывов
function addReviews (array) {
    let mapHTML = render({ items: array});
    const result = document.querySelector('.reviews--container');
        result.innerHTML = '';
        result.innerHTML = mapHTML;
}

function addSlider (array) {
    let sliderHTML = renderSlider({ slider: array });
    const result = document.querySelector('.slider');
   
    result.innerHTML = '';
    result.innerHTML = sliderHTML;
   
}

// обработчик клика по ссылке в слайдере 

const slider = document.querySelector('.slider');
slider.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('slider-item--link')) {
        popup.style.display = 'block';
        const id = e.target.getAttribute('attr');
        let arrayReviews = [];
        let oneReview = arrReviews.find(items => items.id == Number(id));
        let coordinates = document.querySelector('.header--coordinates');
        arrayReviews.push(oneReview);
        coordinates.innerHTML = '';
        coordinates.innerHTML = oneReview.address; // добавляем адрес  в шапку 
        addReviews(arrayReviews);
    }
});

