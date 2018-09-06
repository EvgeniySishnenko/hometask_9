import './style/style.scss';
import './style/slider.scss';
import './slider.js';
import render from '../map-reviews.hbs';
import renderSlider from '../map-slider.hbs';

ymaps.ready(init);

const popup = document.querySelector('.wrapper-popup'),
    closed = document.querySelector('.header--closed'),
    button = document.querySelector('.button--add-reviews'),
    form = document.querySelector('.form');

let arrReviews = [];
let oldReviews = [];
let placemark;
let address;
let coords;
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

        
    });

    myMap.geoObjects.events.add('click', async (e) => {

        popup.style.display = 'block';
        coords = e.get('coords');
        
        placemark = e.get('target');
        // получаем адрес  ипереводим из долготы и широты в дом, улица, город
        const response = await ymaps.geocode(coords);
        address = response.geoObjects.get(0).getAddressLine();
        const coordinates = document.querySelector('.header--coordinates');
        
        coordinates.innerHTML = '';
        coordinates.innerHTML = address; // добавляем адрес  в шапку 
        let obj = {// создаем объект
            name: '',
            place: '',
            reviews: '',
            date: ''
        };
        placemark.properties.set('id', Date.now());
        placemark.properties.set('type', 'placemark');
        placemark.properties.set('address', address);

        const oldReviews = placemark.properties.get('obj')
            ? placemark.properties.get('obj') : [];
        placemark.properties.set('obj', oldReviews);
        oldReviews.push(obj);
        addReviews(oldReviews); // отрисовываем отзывы при клике на маркер
        clusterer.add(placemark);
    
        
    }); 

    // попытка открыть кластер
    clusterer.options.set({

        // clusterBalloonLayout: ymaps.templateLayoutFactory.createClass(""),

        clusterBalloonShadow: false

    });

    myMap.balloon.events.add('open', function (event) {

        const containerSlider = document.querySelector('.slider--wrapper');
        containerSlider.style.display = 'block';
        popup.style.display = 'none';

    });

   
}// не трогать


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
        let obj = {// создаем объект
            name: '',
            place: '',
            reviews: '',
            date: '',
            address: ''
        };
        // получем дату
        let d = new Date();
        let currDate = d.getDate();
        let currMonth = d.getMonth() + 1;
        let currYear = d.getFullYear();
       
        // добавляем в объкт
        obj.name = form.elements.formName.value;
        obj.place = form.elements.formPlace.value;
        obj.reviews = form.elements.formText.value;
        obj.date = `${currDate}.${currMonth}.${currYear}`;
        obj.address = address;
        arrReviews.push(obj); // это мой объкт держу его на всякий случай

        // заношу в placemark данные
        placemark.properties.set('id', Date.now());
        placemark.properties.set('type', 'placemark');
        placemark.properties.set('address', address);

        const oldReviews = placemark.properties.get('obj')
            ? placemark.properties.get('obj') : [];
        placemark.properties.set('obj', oldReviews);
        oldReviews.push(obj);
      
        // очищаю поля формы
        form.elements.formName.value = '';
        form.elements.formPlace.value = '';
        form.elements.formText.value = '';

        addSlider(oldReviews);
        addReviews(oldReviews);
        console.log(oldReviews);
       
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
