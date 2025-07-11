 let currentLocation = 'ballarpur';

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            loadEnvironmentData();
        });

        async function loadEnvironmentData() {
            currentLocation = document.getElementById('locationSelect').value;
            
            // Load all environmental data
            await Promise.all([
                loadWeatherData(),
                loadAirQualityData(),
                loadForecastData(),
                loadLocationData()
            ]);
            
            updateLastUpdated();
        }

        async function loadWeatherData() {
            try {
                const response = await fetch(`/api/weather/current/${currentLocation}`);
                const data = await response.json();
                
                if (response.ok) {
                    displayWeatherData(data);
                } else {
                    throw new Error(data.error || 'Failed to fetch weather data');
                }
            } catch (error) {
                console.error('Weather data error:', error);
                showError('weatherData', 'Failed to load weather data');
            }
        }

        async function loadAirQualityData() {
            try {
                const response = await fetch(`/api/air-quality/${currentLocation}`);
                const data = await response.json();
                
                if (response.ok) {
                    displayAirQualityData(data);
                } else {
                    throw new Error(data.error || 'Failed to fetch air quality data');
                }
            } catch (error) {
                console.error('Air quality data error:', error);
                showError('aqiData', 'Failed to load air quality data');
            }
        }

        async function loadForecastData() {
            try {
                const response = await fetch(`/api/weather/forecast/${currentLocation}`);
                const data = await response.json();
                
                if (response.ok) {
                    displayForecastData(data);
                } else {
                    throw new Error(data.error || 'Failed to fetch forecast data');
                }
            } catch (error) {
                console.error('Forecast data error:', error);
                showError('forecastData', 'Failed to load forecast data');
            }
        }

        async function loadLocationData() {
            try {
                const response = await fetch(`/api/location/${currentLocation}`);
                const data = await response.json();
                
                if (response.ok) {
                    displayLocationData(data);
                } else {
                    throw new Error(data.error || 'Failed to fetch location data');
                }
            } catch (error) {
                console.error('Location data error:', error);
            }
        }

        function displayWeatherData(data) {
            document.getElementById('weatherLoading').classList.add('d-none');
            document.getElementById('weatherData').classList.remove('d-none');
            
            document.getElementById('temperature').textContent = `${data.temperature}°C`;
            document.getElementById('description').textContent = data.description;
            document.getElementById('feelsLike').textContent = `${data.feels_like}°C`;
            document.getElementById('humidity').textContent = `${data.humidity}%`;
            document.getElementById('pressure').textContent = `${data.pressure} hPa`;
            document.getElementById('windSpeed').textContent = `${data.wind_speed} m/s`;
            document.getElementById('visibility').textContent = `${data.visibility} km`;
            
            // Weather icon
            const iconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
            document.getElementById('weatherIcon').src = iconUrl;
            
            // Sun times
            if (data.sunrise && data.sunset) {
                document.getElementById('sunrise').textContent = new Date(data.sunrise).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                document.getElementById('sunset').textContent = new Date(data.sunset).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }

        function displayAirQualityData(data) {
            document.getElementById('aqiLoading').classList.add('d-none');
            document.getElementById('aqiData').classList.remove('d-none');
            
            document.getElementById('aqiValue').textContent = data.aqi;
            document.getElementById('aqiStation').textContent = data.station || data.location;
            
            // AQI Category and color
            const category = document.getElementById('aqiCategory');
            const progress = document.getElementById('aqiProgress');
            
            category.textContent = data.category;
            progress.style.width = `${Math.min(data.aqi / 3, 100)}%`;
            
            // Set colors based on AQI level
            if (data.aqi <= 50) {
                category.className = 'badge bg-success';
                progress.className = 'progress-bar bg-success';
            } else if (data.aqi <= 100) {
                category.className = 'badge bg-warning';
                progress.className = 'progress-bar bg-warning';
            } else if (data.aqi <= 150) {
                category.className = 'badge bg-orange';
                progress.className = 'progress-bar bg-orange';
            } else {
                category.className = 'badge bg-danger';
                progress.className = 'progress-bar bg-danger';
            }
            
            // Display pollutants if available
            if (data.pollutants) {
                document.getElementById('pm25').textContent = data.pollutants.pm25?.v || '--';
                document.getElementById('pm10').textContent = data.pollutants.pm10?.v || '--';
                document.getElementById('o3').textContent = data.pollutants.o3?.v || '--';
                document.getElementById('no2').textContent = data.pollutants.no2?.v || '--';
            }
            
            // Check for environmental alerts
            checkEnvironmentalAlerts(data.aqi);
        }

        function displayForecastData(data) {
            document.getElementById('forecastLoading').classList.add('d-none');
            document.getElementById('forecastData').classList.remove('d-none');
            
            const forecastCards = document.getElementById('forecastCards');
            forecastCards.innerHTML = '';
            
            // Group forecast by day and take first entry for each day
            const dailyForecast = [];
            const seenDates = new Set();
            
            data.forecast.forEach(item => {
                const date = new Date(item.datetime).toDateString();
                if (!seenDates.has(date) && dailyForecast.length < 5) {
                    dailyForecast.push(item);
                    seenDates.add(date);
                }
            });
            
            dailyForecast.forEach(day => {
                const date = new Date(day.datetime);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                const card = document.createElement('div');
                card.className = 'col';
                card.innerHTML = `
                    <div class="card text-center h-100">
                        <div class="card-body py-2">
                            <small class="text-muted">${dayName}</small>
                            <div class="small">${monthDay}</div>
                            <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}" width="32">
                            <div class="fw-bold">${day.temperature}°C</div>
                            <small class="text-muted">${day.description}</small>
                        </div>
                    </div>
                `;
                forecastCards.appendChild(card);
            });
        }

        function displayLocationData(data) {
            document.getElementById('population').textContent = data.population.toLocaleString();
            document.getElementById('area').textContent = `${data.area} km²`;
            document.getElementById('elevation').textContent = `${data.elevation} m`;
            document.getElementById('district').textContent = data.district;
        }

        function checkEnvironmentalAlerts(aqi) {
            const alertsContainer = document.getElementById('alertsContainer');
            
            if (aqi > 100) {
                alertsContainer.innerHTML = `
                    <div class="alert alert-warning py-2 mb-0">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Air Quality Alert:</strong> Unhealthy air quality detected. 
                        Consider limiting outdoor activities.
                    </div>
                `;
            } else {
                alertsContainer.innerHTML = `
                    <div class="text-muted text-center">
                        <i class="fas fa-check-circle text-success me-2"></i>
                        No active environmental alerts
                    </div>
                `;
            }
        }

        function updateLastUpdated() {
            document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
        }

        function refreshData() {
            loadEnvironmentData();
        }

        function showError(elementId, message) {
            const element = document.getElementById(elementId);
            element.innerHTML = `
                <div class="alert alert-danger py-2 mb-0">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    ${message}
                </div>
            `;
            element.classList.remove('d-none');
        }