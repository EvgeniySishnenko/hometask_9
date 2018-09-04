import { consoleLogHelper, consoleLogHelper2 } from './utils';
import './styles/styles.scss';

// const renderFn = Handlebars.compile(template)
// const html = render(array)
// container.innerHTML = html;

import renderFn from './templates/template.hbs';

console.log('My project!');

consoleLogHelper();

consoleLogHelper2();

const container = document.querySelector('.container');

const array = [
  { id: 1, title: 'Test 1', arr: [1, 2, 3] },
  { id: 1, title: 'Test 2', arr: [11, 22, 33] },
  { id: 1, title: 'Test 3', arr: [1, 2, 3] },
  { id: 1, title: 'Test 4', arr: [2424, 242, 24] },
  { id: 1, title: 'Test 5', arr: [1, 2, 3] }
]
const leftListHtml = renderFn({ friends: array, isLeft: true });
const rightListHtml = renderFn({ friends: array, isLeft: false });

container.innerHTML = rightListHtml;

const markers = []

const init = () => {
  const map = new ymaps.Map('map', {
    center: [55.76, 37.64],
    zoom: 7,
    controls: []
  });

  const clusterer = new ymaps.Clusterer({ 
    clusterDisableClickZoom: true,
    // дополнительные параметры по отрисовке контента
  });
  map.geoObjects.add(clusterer);

  map.events.add('click', async (e) => {
    console.log('click');
    const coords = e.get('coords');
    console.log(coords);

    const review = {
      place: 'Шоколадница',
      user: 'Igor',
      review: 'Ужас'
    }

    const response = await ymaps.geocode(coords)
    const address = response.geoObjects.get(0).getAddressLine()
    console.log(address);
    console.log(response);

    const placemark = new ymaps.Placemark(coords, {
      hintContent: 'Содержимое подсказки',
      baloonContent: 'Содержимое балуна'
    });

    placemark.properties.set('id', Date.now())
    placemark.properties.set('type', 'placemark')
    placemark.properties.set('address', address)
  
    const oldReviews = placemark.properties.get('reviews') 
      ? placemark.properties.get('reviews') : [];
    
    oldReviews.push(review);
    oldReviews.push(review);
    oldReviews.push(review);

    placemark.properties.set('reviews', oldReviews);

    markers.push(placemark);
    map.geoObjects.add(placemark);
    clusterer.add(placemark);
  })

  map.geoObjects.events.add('click', e => {
    console.log('Marker clicked!');
    const target = e.get('target');
    const { properties } = target;
    if (properties.get('type') !== 'placemark') return;

    console.log(properties.get('type'));
    console.log(properties.get('id'));
    console.log(properties.get('reviews'));
  })
}
ymaps.ready(init);