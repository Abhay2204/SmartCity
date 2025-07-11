  let map;
        let currentLocation = 'ballarpur';
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            initializeMap();
            loadLocationData();
        });

        // Initialize Leaflet map
        function initializeMap() {
            map = L.map('map').setView([19.8333, 79.35], 12);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        }

        // Load location-specific data
        async function loadLocationData() {
            currentLocation = document.getElementById('locationSelect').value;
            
            try {
                // Load weather data
                await loadWeatherData();
                
                // Load transportation data
                await loadTransportationData();
                
                // Load location info
                await loadLocationInfo();
                
                // Update map
                updateMap();
                
            } catch (error) {
                console.error('Error loading location data:', error);
            }
        }

        // Load weather data
        async function loadWeatherData() {
            try {
                const response = await fetch(`/api/weather/current/${currentLocation}`);
                const data = await response.json();
                
                document.getElementById('weatherInfo').innerHTML = `
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <img src="https://openweathermap.org/img/w/${data.icon}.png" alt="${data.description}">
                        </div>
                        <div>
                            <strong>${data.temperature}°C</strong><br>
                            <small class="text-muted">${data.description}</small><br>
                            <small>Wind: ${data.wind_speed} m/s</small>
                        </div>
                    </div>
                `;
            } catch (error) {
                document.getElementById('weatherInfo').innerHTML = '<p class="text-danger">Weather data unavailable</p>';
            }
        }

        // Load transportation data
        async function loadTransportationData() {
            try {
                const response = await fetch(`/api/transport/${currentLocation}`);
                const data = await response.json();
                
                // Update transport counts
                document.getElementById('busCount').textContent = `${data.bus_stations.length} Stations`;
                document.getElementById('railwayCount').textContent = `${data.railway_stations.length} Stations`;
                document.getElementById('airportInfo').textContent = `${data.airports[0].distance} km away`;
                
                // Update bus stations list
                const busStationsHtml = data.bus_stations.map(station => `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <strong>${station.name}</strong><br>
                            <small class="text-muted">${station.distance} km away</small>
                        </div>
                        <i class="fas fa-bus text-primary"></i>
                    </div>
                `).join('');
                document.getElementById('busStations').innerHTML = busStationsHtml;
                
                // Update railway stations list
                const railwayStationsHtml = data.railway_stations.map(station => `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <strong>${station.name}</strong><br>
                            <small class="text-muted">${station.distance} km away</small>
                        </div>
                        <i class="fas fa-train text-success"></i>
                    </div>
                `).join('');
                document.getElementById('railwayStations').innerHTML = railwayStationsHtml;
                
            } catch (error) {
                console.error('Error loading transportation data:', error);
                document.getElementById('busStations').innerHTML = '<p class="text-danger">Transportation data unavailable</p>';
                document.getElementById('railwayStations').innerHTML = '<p class="text-danger">Transportation data unavailable</p>';
            }
        }

        // Load location information
        async function loadLocationInfo() {
            try {
                const response = await fetch(`/api/location/${currentLocation}`);
                const data = await response.json();
                
                document.getElementById('locationInfo').innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Basic Information</h6>
                            <p><strong>Name:</strong> ${data.name}</p>
                            <p><strong>District:</strong> ${data.district}</p>
                            <p><strong>State:</strong> ${data.state}</p>
                            <p><strong>Population:</strong> ${data.population.toLocaleString()}</p>
                            <p><strong>Area:</strong> ${data.area} sq km</p>
                        </div>
                        <div class="col-md-6">
                            <h6>Infrastructure</h6>
                            <p><strong>Railway Stations:</strong> ${data.infrastructure.railway_stations}</p>
                            <p><strong>Major Roads:</strong> ${data.infrastructure.major_roads}</p>
                            <p><strong>Hospitals:</strong> ${data.infrastructure.hospitals}</p>
                            <p><strong>Banks:</strong> ${data.infrastructure.banks}</p>
                            <p><strong>Post Offices:</strong> ${data.infrastructure.post_offices}</p>
                        </div>
                    </div>
                `;
            } catch (error) {
                document.getElementById('locationInfo').innerHTML = '<p class="text-danger">Location information unavailable</p>';
            }
        }

        // Update map with current location
        function updateMap() {
            // Clear existing markers
            map.eachLayer(function(layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // Location coordinates
            const locations = {
                ballarpur: { lat: 19.8333, lon: 79.35, name: 'Ballarpur' },
                chandrapur: { lat: 19.9703, lon: 79.3034, name: 'Chandrapur' }
            };

            const loc = locations[currentLocation];
            
            // Center map on location
            map.setView([loc.lat, loc.lon], 13);
            
            // Add main location marker
            L.marker([loc.lat, loc.lon])
                .addTo(map)
                .bindPopup(`<strong>${loc.name}</strong><br>Main City Center`)
                .openPopup();

            // Add transport markers (approximate locations)
            const transportMarkers = [
                { lat: loc.lat + 0.01, lon: loc.lon - 0.01, name: 'Bus Station', icon: '🚌' },
                { lat: loc.lat - 0.01, lon: loc.lon + 0.01, name: 'Railway Station', icon: '🚂' },
                { lat: loc.lat + 0.005, lon: loc.lon + 0.005, name: 'Local Transport Hub', icon: '🚐' }
            ];

            transportMarkers.forEach(marker => {
                const customIcon = L.divIcon({
                    html: `<div style="background: white; border-radius: 50%; padding: 5px; font-size: 16px;">${marker.icon}</div>`,
                    iconSize: [30, 30],
                    className: 'custom-div-icon'
                });

                L.marker([marker.lat, marker.lon], { icon: customIcon })
                    .addTo(map)
                    .bindPopup(`<strong>${marker.name}</strong>`);
            });
        }