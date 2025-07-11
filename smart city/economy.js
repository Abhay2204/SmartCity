 let currentLocation = 'ballarpur';

        // Load initial data
        document.addEventListener('DOMContentLoaded', function() {
            loadStockData();
            loadEconomyIndicators();
            loadLocationData();
            
            // Refresh data every 5 minutes
            setInterval(loadStockData, 5 * 60 * 1000);
            setInterval(loadEconomyIndicators, 10 * 60 * 1000);
        });

        // Load stock market data
        async function loadStockData() {
            try {
                const response = await fetch('/api/stock/indian-markets');
                const data = await response.json();
                
                if (data.stocks) {
                    displayStockData(data.stocks);
                }
                
                if (data.currency) {
                    displayCurrencyData(data.currency);
                }
            } catch (error) {
                console.error('Error loading stock data:', error);
                document.getElementById('stockTableBody').innerHTML = 
                    '<tr><td colspan="5" class="text-center text-danger">Failed to load stock data</td></tr>';
            }
        }

        // Display stock data in table
        function displayStockData(stocks) {
            const tbody = document.getElementById('stockTableBody');
            tbody.innerHTML = '';
            
            stocks.forEach(stock => {
                const changeClass = stock.change >= 0 ? 'text-success' : 'text-danger';
                const changeIcon = stock.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
                
                const row = `
                    <tr>
                        <td><strong>${stock.symbol}</strong></td>
                        <td>₹${stock.price.toFixed(2)}</td>
                        <td class="${changeClass}">
                            <i class="fas ${changeIcon} me-1"></i>
                            ${stock.change.toFixed(2)}
                        </td>
                        <td>${stock.volume ? stock.volume.toLocaleString() : 'N/A'}</td>
                        <td>${new Date(stock.timestamp).toLocaleTimeString()}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }

        // Display currency data
        function displayCurrencyData(currency) {
            document.getElementById('usdInrRate').textContent = `₹${currency.rate ? currency.rate.toFixed(2) : currency.rate}`;
            document.getElementById('currencyUpdate').textContent = 
                `Last updated: ${currency.timestamp ? new Date(currency.timestamp).toLocaleString() : 'N/A'}`;
        }

        // Load economy indicators
        async function loadEconomyIndicators() {
            try {
                const response = await fetch('/api/economy/indicators');
                const data = await response.json();
                
                // Gold price
                if (data.gold) {
                    document.getElementById('goldPrice').textContent = `₹${data.gold.price_per_10g_inr.toLocaleString()}`;
                    document.getElementById('goldUpdate').textContent = 
                        `Updated: ${data.gold.timestamp ? new Date(data.gold.timestamp).toLocaleString() : 'N/A'}`;
                }
                
                // Oil price
                if (data.crude_oil) {
                    document.getElementById('oilPrice').textContent = `$${data.crude_oil.price_usd}`;
                    document.getElementById('oilUpdate').textContent = 
                        `Updated: ${data.crude_oil.date ? new Date(data.crude_oil.date).toLocaleDateString() : 'N/A'}`;
                }
                
                // Local economy data
                if (data.local_economy) {
                    displayLocalEconomyData(data.local_economy);
                }
            } catch (error) {
                console.error('Error loading economy indicators:', error);
                document.getElementById('goldPrice').textContent = 'Error loading';
                document.getElementById('oilPrice').textContent = 'Error loading';
            }
        }

        // Display local economy data
        function displayLocalEconomyData(localEconomy) {
            const container = document.getElementById('localEconomyData');
            const locationData = localEconomy[currentLocation];
            
            if (locationData) {
                container.innerHTML = `
                    <div class="col-md-3">
                        <div class="text-center">
                            <h4 class="text-primary">${locationData.employment_rate}%</h4>
                            <p class="mb-0">Employment Rate</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <h4 class="text-success">₹${locationData.per_capita_income.toLocaleString()}</h4>
                            <p class="mb-0">Per Capita Income</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6>Major Industries:</h6>
                        <div class="d-flex flex-wrap gap-2">
                            ${locationData.major_industries.map(industry => 
                                `<span class="badge bg-secondary">${industry}</span>`
                            ).join('')}
                        </div>
                        <p class="mt-2 mb-0"><strong>Primary Occupation:</strong> ${locationData.primary_occupation}</p>
                    </div>
                `;
            }
        }
// Handle location change and initial load
async function loadLocationData() {
    currentLocation = document.getElementById('locationSelect').value || currentLocation;
    document.getElementById('selectedLocation').textContent = 
        currentLocation.charAt(0).toUpperCase() + currentLocation.slice(1);

    // Reload local economy section
    loadEconomyIndicators();

    // Load location-specific info
    try {
        const response = await fetch(`/api/location/${currentLocation}`);
        const data = await response.json();
        displayLocationInfo(data);
    } catch (error) {
        console.error('Error loading location data:', error);
        document.getElementById('locationInfo').innerHTML = 
            '<div class="col-12 text-center text-danger">Failed to load location data</div>';
    }
}


        // Display location information
        function displayLocationInfo(location) {
            const container = document.getElementById('locationInfo');
            
            container.innerHTML = `
                <div class="col-md-4">
                    <h6>Basic Information</h6>
                    <p><strong>District:</strong> ${location.district}</p>
                    <p><strong>State:</strong> ${location.state}</p>
                    <p><strong>Area:</strong> ${location.area} km²</p>
                    <p><strong>Population:</strong> ${location.population.toLocaleString()}</p>
                    <p><strong>Elevation:</strong> ${location.elevation}m</p>
                </div>
                <div class="col-md-4">
                    <h6>Infrastructure</h6>
                    <p><strong>Railway Stations:</strong> ${location.infrastructure.railway_stations}</p>
                    <p><strong>Major Roads:</strong> ${location.infrastructure.major_roads}</p>
                    <p><strong>Hospitals:</strong> ${location.infrastructure.hospitals}</p>
                    <p><strong>Educational Institutes:</strong> ${location.infrastructure.educational_institutes}</p>
                    <p><strong>Banks:</strong> ${location.infrastructure.banks}</p>
                </div>
                <div class="col-md-4">
                    <h6>Demographics</h6>
                    <p><strong>Population Density:</strong> ${location.demographics.density}/km²</p>
                    <p><strong>Literacy Rate:</strong> ${location.demographics.literacy_rate}%</p>
                    <p><strong>Sex Ratio:</strong> ${location.demographics.sex_ratio}</p>
                    <p><strong>Coordinates:</strong> ${location.lat}°N, ${location.lon}°E</p>
                </div>
            `;
        }

        // Handle location change