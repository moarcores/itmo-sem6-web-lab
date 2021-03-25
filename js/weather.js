const token = 'c8ae874a8f45aed70971d4ec2383a700';
const tyumenId = '1488754';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?';

const getCurrentLocation = () => {
    setLoading(true)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setFavCity, setDefaultCity);
    }
}

const getCityInfo = async (searchParams) => {
    setLoading(true);
    let response;
    try {
        response  = await fetch(apiUrl + new URLSearchParams(searchParams).toString());
        if (response.status === 404){
            throw new Error('Такого города увы не существует');
          }
          if (response.status === 401){
            throw new Error('Токен испортился');
          }
          if (response.status === 403){
            throw new Error('Forbiden');
          }
          if (response.status === 500){
            throw new Error('Внутренняя ошибка сервера');
          }
          if (response.status === 503){
            throw new Error('Сервис недоступен');
          }
    } catch(err) { 
        alert(err.message)
        setLoading(false)
    }
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    } else {
        let data = await response.json();
        return data;
    }

}

const setFavCity = async (data) => {
    searchParams = {
        lat: data.coords.latitude,
        lon: data.coords.longitude,
        appid: token
    }
    let cityInfo = await getCityInfo(searchParams)
    let city = document.querySelector('.current_city')
    fillCity(city, cityInfo)
    setLoading(false)
}

const setDefaultCity = async () => {
    searchParams = {
        id: tyumenId,
        appid: token
    }
    let cityInfo = await getCityInfo(searchParams)
    let city = document.querySelector('.current_city')
    fillCity(city, cityInfo)
    setLoading(false)
}

const fillCity = (cityPlace, cityInfo) => {
    
    cityPlace.querySelector('.city_name').innerHTML = cityInfo.name;
    cityPlace.querySelector('.degrees').innerHTML = Math.floor(cityInfo.main.temp - 273) + ' C';
    let iconUrl = "http://openweathermap.org/img/w/" + cityInfo.weather[0].icon + ".png";
    cityPlace.querySelector('.weather__icon').setAttribute('src', iconUrl)
    fillCityParams(cityPlace.querySelector('.city_info'), cityInfo)

    

}
const fillCityParams = (searchParams, weatherData) => {
    let paramArray = searchParams.querySelectorAll('.city_info_topic')

    paramArray[0].querySelector('.city_info_key').innerHTML  = 'Ветер'
    paramArray[1].querySelector('.city_info_key').innerHTML  = 'Облачность'
    paramArray[2].querySelector('.city_info_key').innerHTML  = 'Давление'
    paramArray[3].querySelector('.city_info_key').innerHTML  = 'Влажность'
    paramArray[4].querySelector('.city_info_key').innerHTML  = 'Координаты'
    
    paramArray[0].querySelector('.city_info_value').innerHTML  = weatherData.wind.speed
    paramArray[1].querySelector('.city_info_value').innerHTML  = weatherData.clouds.all
    paramArray[2].querySelector('.city_info_value').innerHTML  = weatherData.main.pressure
    paramArray[3].querySelector('.city_info_value').innerHTML  = weatherData.main.humidity
    paramArray[4].querySelector('.city_info_value').innerHTML  = '[ ' + weatherData.coord.lat + ', ' + weatherData.coord.lon + ' ]'
}

const generateEmptyTemplate = ()=> {
    let template = document.querySelector('#fav_city_list_template').content


    return template
}

const addFavorite = async (cityName, isNew) => {
    searchParams = {
        q: cityName,
        appid: token
    }
    let favList = document.querySelector('.fav_city_list')
    console.log(favList)
    let data = await getCityInfo(searchParams)
    console.log(localStorage.getItem(data.id))
    if (localStorage.getItem(data.id) !== null && isNew){
        alert('Такой город присутвует')
    } else {
        localStorage.setItem(data.id, cityName)
        let temaplte = generateEmptyTemplate()
        console.log('te', temaplte)

       
        
        let favoriteCity = document.importNode(temaplte, true)
        favoriteCity.querySelector('.city_name').setAttribute('custom_id', data.id)
        attachRemoveEvents(favoriteCity.querySelector('.delete_button'))
        fillCity(favoriteCity, data)
        favList.appendChild(favoriteCity)
    
        
    }

    setLoading(false)
}

setFavotites = () => {
    for (let i = 0; i < localStorage.length; i++) {
        addFavorite(localStorage.getItem(localStorage.key(i)), false)
    }
}

const attachAddEvents = () => {
    const input = document.querySelector('#fav_city_input')
    let submitBtn = document.querySelector('.submit__button')
    console.log(submitBtn)
    submitBtn.addEventListener('click', event => {
        event.preventDefault();
        if (input.value === ''){
          alert('Поле не должно быть пустое');
          return;
        }
        addFavorite(input.value, true)
        input.value = ''
    })
}

const attachRemoveEvents = (removeBtn) => {
    console.log('remove', removeBtn)
    removeBtn.addEventListener('click', (event) => {
        event.preventDefault()
        const mainList = removeBtn.parentNode.parentNode.parentNode
        if(removeBtn.parentNode.parentNode !== null){
          console.log('zdaraova katra', removeBtn.parentNode.querySelector('.city_name'))
          mainList.removeChild(removeBtn.parentNode.parentNode)
          localStorage.removeItem(removeBtn.parentNode.querySelector('.city_name').getAttribute('custom_id'))
        }
    })
}

const attachRefreshEvents = () => {
    let refrestBtn = document.querySelector('.refresh__button')
    refrestBtn.addEventListener('click', () => {
        getCurrentLocation()
    })
}

const setLoading = (state) => {
    let header = document.querySelector('.header');
    let main = document.querySelector('.main');
    let loader = document.querySelector('.loader');
    if (!state) {
        header.style.display = 'flex';
        main.style.display = 'block';
        loader.style.display = 'none';
    } else {
        header.style.display = 'none';
        main.style.display = 'none';
        loader.style.display = 'flex';
    }
}



getCurrentLocation();
attachAddEvents();
attachRefreshEvents();
setFavotites();