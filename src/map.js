import render from '../map-reviews.hbs';
import renderSlider from '../map-slider.hbs';
import './style/style.scss';
import './style/slider.scss';
import './slider.js';
import './movie.js'


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
        // Координаты центра карты.
        // Порядок по умолчнию: «широта, долгота».
        // Чтобы не определять координаты центра карты вручную,
        // воспользуйтесь инструментом Определение координат.
        center: [55.76, 37.64],
        // Уровень масштабирования. Допустимые значения:
        // от 0 (весь мир) до 19.
        zoom: 15,
        controls: []
        
    }),
    clusterer = new ymaps.Clusterer({
        /**
          * Через кластеризатор можно указать только стили кластеров,
          * стили для меток нужно назначать каждой метке отдельно.
          * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml
          */
        preset: 'islands#invertedVioletClusterIcons',
        /**
         * Ставим true, если хотим кластеризовать только точки с одинаковыми координатами.
         */
        groupByCoordinates: false,
        /**
         * Опции кластеров указываем в кластеризаторе с префиксом "cluster".
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ClusterPlacemark.xml
         */
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false
    });
    myMap.geoObjects.add(clusterer);

    myMap.events.add('click', function (e) {
        // Получение координат щелчка

        var coords = e.get('coords');
       
        placemark = new ymaps.Placemark(coords, {
            // Хинт показывается при наведении мышкой на иконку метки.
            //hintContent: 'Содержимое всплывающей подсказки',
            // Балун откроется при клике по метке.
            //balloonContent: 'Содержимое балуна'
        });
       
        myMap.geoObjects.add(placemark);
        placemark.properties.set('type', 'placemark');
        clusterer.add(placemark);
    });
   
    myMap.geoObjects.events.add('click', async (e) => {
        const target = e.get('target');
        
        if (target.properties.get('type') === 'placemark') {
            popup.style.display = 'block';
            mouseMoviePopup();

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
        
        }
    }); 

    //попытка открыть кластер
    clusterer.options.set({

        // clusterBalloonLayout: ymaps.templateLayoutFactory.createClass(""),

        clusterBalloonShadow: false
        // hasBalloon: false

    });

    myMap.balloon.events.add('open', function (event) {
        const containerSlider = document.querySelector('.slider--wrapper');
        containerSlider.style.display = 'block';
        let properties;
       
        addSlider(arrReviews);
        mouseMovieSlider(containerSlider);
        generateNumberControl();
    }); 

}// не трогать
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
function mouseMovieSlider(containerSlider) {
    event = event || window.event;
    let offY = event.offsetY;
    let offX = event.offsetX;
    containerSlider.style.left = offX - 40 + 'px';
    containerSlider.style.top = offY - 250 + 'px';

    // console.log(offX);
    // console.log(offY);
    // console.log(containerSlider.style.left = offX - 40 + 'px');
    // console.log(containerSlider.style.top = offY - 260 + 'px');

}
function mouseMoviePopup() {

    let width = wrapper.offsetWidth;
    let height = wrapper.offsetHeight;
    let heightPopup = popup.offsetHeight;
    let widthPopup = popup.offsetWidth;

    event = event || window.event;
    let offY = event.offsetY;
    let offX = event.offsetX;

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
        const oneReviews = arrReviews.find(items => items.id == Number(id));
        addReviews(oneReviews);
        // coordinates = document.querySelector('.header--coordinates');
        coordinates.innerHTML = '';
        coordinates.innerHTML = oneReviews.address; // добавляем адрес  в шапку 
        
    }
});

