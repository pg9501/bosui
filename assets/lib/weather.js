$(document).ready(function () {
    getWeather(); //Get the initial weather.
    setInterval(getWeather, 600000); //Update the weather every 10 minutes.
});

function getWeather() {
    $.simpleWeather({
        zipcode: '76133',
        location: 'Karlsruhe, BW',
        woeid: '',
        unit: 'c',
        success: function (weather) {
            html = '<img src='+ weather.thumbnail+' width="60px" height="60px"><span class="tempStyle">' + weather.temp + '&deg;' + weather.units.temp + '</span>';
            $("#weather").html(html);
        },
        error: function (error) {
            $("#weather").html('<p>' + error + '</p>');
        }
    });
};
