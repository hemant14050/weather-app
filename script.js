const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".user-info-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorCard = document.querySelector("[data-errorCard]");

let currentTab = userTab;
const API_KEY = "bdea0b849da8e69ae596a9a5f2ddbf46";
currentTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(clickedTab) {
    if(clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
            errorCard.classList.remove("active");
        } else {
            // search tab to --> weather tab
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            errorCard.classList.remove("active");
            // to display weather, check local storage first
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

// check if coordinates are in local storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grant container invisible
    grantAccessContainer.classList.remove("active");
    // make loading icon visible
    loadingScreen.classList.add("active");
    errorCard.classList.remove("active");

    // API Call
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userContainer.classList.add("active");
        
        if(data) {
            renderWeatherData(data);
        } else {
            errorCard.querySelector('img').src = "./assets/not-found.png";
            errorCard.classList.add("active");
            loadingScreen.classList.remove("active");
        }

    } catch(err) {
        errorCard.querySelector('img').src = "./assets/not-found.png";
        errorCard.classList.add("active");
        loadingScreen.classList.remove("active");
    }
}

function renderWeatherData(weatherInfo) {
    // firstly we have to fetch elements to show data
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const weatherDesc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const clouds = document.querySelector("[data-clouds]");

    
    // fetch values from weatherInfo
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherDesc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = (parseInt(weatherInfo?.main?.temp)-273.15).toFixed(2) + " ℃";
    windSpeed.innerText = weatherInfo?.wind?.speed + "m/s";
    humidity.innerText = weatherInfo?.main?.humidity + "%";
    clouds.innerText = weatherInfo?.clouds?.all + "%";

}

function showposition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    
    // console.log("show pos");
    // console.log(userCoordinates);
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    
    fetchUserWeatherInfo(userCoordinates);
}

function getLocation(){
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showposition);
    } else {
        // show an alert
        window.alert("Geolocation not supported..");
    }
    // console.log("get loc");
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "") return;
    fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorCard.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        

        if(data?.cod == '404') {
            errorCard.querySelector('img').src = "./assets/not-found.png";
            errorCard.classList.add("active");
            loadingScreen.classList.remove("active");
        } else {
            userInfoContainer.classList.add("active");
            renderWeatherData(data);
        }

    } catch(err) {
        errorCard.querySelector('img').src = "./assets/not-found.png";
        errorCard.classList.add("active");
        loadingScreen.classList.remove("active");
    }
}