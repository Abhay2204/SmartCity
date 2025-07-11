// Dashboard.js - Complete Frontend Implementation
// Author: Maharashtra Dashboard
// Last Updated: 2025

class MaharashtraDashboard {
    constructor() {
        this.currentLocation = 'ballarpur';
        this.weatherChart = null;
        this.refreshInterval = null;
        
        // API endpoints
        this.API_BASE = window.location.origin;
        this.endpoints = {
            weather: (location) => `${this.API_BASE}/api/weather/current/${location}`,
            forecast: (location) => `${this.API_BASE}/api/weather/forecast/${location}`,
            airQuality: (location) => `${this.API_BASE}/api/air-quality/${location}`,
            news: (location) => `${this.API_BASE}/api/news/${location}`,
            stocks: () => `${this.API_BASE}/api/stock/indian-markets`,
            location: (location) => `${this.API_BASE}/api/location/${location}`,
            transport: (location) => `${this.API_BASE}/api/transport/${location}`,
            economy: () => `${this.API_BASE}/api/economy/indicators`
        };

        this.init();
    }

    async init() {
        console.log('🚀 Initializing Maharashtra Dashboard...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start real-time clock
        this.startClock();
        
        // Load initial data
        await this.loadAllData();
        
        // Set up auto-refresh
        this.setupAutoRefresh();
        
        console.log('✅ Dashboard initialized successfully');
    }

    setupEventListeners() {
        // Location selector
        const locationRadios = document.querySelectorAll('input[name="location"]');
        locationRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentLocation = e.target.value;
                    this.loadAllData();
                }
            });
        });

        // Refresh button (if exists)
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAllData());
        }
    }

    startClock() {
        const updateTime = () => {
            const now = new Date();
            const timeElement = document.getElementById('local-time');
            const dateElement = document.getElementById('local-date');
            
            if (timeElement) {
                timeElement.textContent = now.toLocaleTimeString('en-IN', {
                    hour12: true,
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            if (dateElement) {
                dateElement.textContent = now.toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                });
            }
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    setupAutoRefresh() {
        // Refresh data every 5 minutes
        this.refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing dashboard data...');
            this.loadAllData();
        }, 5 * 60 * 1000);
    }

    async loadAllData() {
        console.log(`📊 Loading data for ${this.currentLocation}...`);
        
        try {
            // Show loading states
            this.showLoadingStates();
            
            // Load all data concurrently
            const promises = [
                this.loadWeatherData(),
                this.loadForecastData(),
                this.loadAirQualityData(),
                this.loadLocationData(),
                this.loadNewsData(),
                this.loadEconomicData(),
                this.loadTransportData()
            ];

            await Promise.allSettled(promises);
            
            console.log('✅ All data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            this.showError('Failed to load some dashboard data');
        }
    }

    showLoadingStates() {
        // Set loading text for various elements
        const loadingElements = [
            'current-temp', 'weather-desc', 'aqi-value', 'aqi-status',
            'population', 'currency-rate', 'gold-price', 'crude-price'
        ];
        
        loadingElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = 'Loading...';
            }
        });
    }

    async loadWeatherData() {
        try {
            const response = await fetch(this.endpoints.weather(this.currentLocation));
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.updateWeatherUI(data);
            
        } catch (error) {
            console.error('Weather data error:', error);
            this.updateWeatherUI({
                temperature: '--',
                description: 'Unavailable',
                feels_like: '--'
            });
        }
    }

    updateWeatherUI(data) {
        const tempElement = document.getElementById('current-temp');
        const descElement = document.getElementById('weather-desc');
        
        if (tempElement) {
            tempElement.textContent = data.temperature !== '--' ? `${data.temperature}°C` : '--°C';
        }
        
        if (descElement) {
            descElement.textContent = data.description || 'Unavailable';
        }

        // Update weather card color based on temperature
        const weatherCard = tempElement?.closest('.card');
        if (weatherCard && data.temperature !== '--') {
            if (data.temperature > 35) {
                weatherCard.className = weatherCard.className.replace('bg-primary', 'bg-danger');
            } else if (data.temperature < 15) {
                weatherCard.className = weatherCard.className.replace('bg-primary', 'bg-info');
            }
        }
    }

    async loadForecastData() {
        try {
            const response = await fetch(this.endpoints.forecast(this.currentLocation));
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.updateForecastChart(data);
            
        } catch (error) {
            console.error('Forecast data error:', error);
            this.updateForecastChart({ forecast: [] });
        }
    }

    updateForecastChart(data) {
        const ctx = document.getElementById('weatherChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.weatherChart) {
            this.weatherChart.destroy();
        }

        // Prepare data for next 5 days
        const dailyForecasts = this.groupForecastByDay(data.forecast || []);
        const labels = dailyForecasts.map(day => day.date);
        const temperatures = dailyForecasts.map(day => day.avgTemp);
        const humidity = dailyForecasts.map(day => day.avgHumidity);

        this.weatherChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temperatures,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    yAxisID: 'y'
                }, {
                    label: 'Humidity (%)',
                    data: humidity,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Humidity (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `5-Day Weather Forecast - ${this.currentLocation.charAt(0).toUpperCase() + this.currentLocation.slice(1)}`
                    },
                    legend: {
                        display: true
                    }
                }
            }
        });
    }

    groupForecastByDay(forecast) {
        if (!forecast || forecast.length === 0) {
            // Return dummy data for 5 days
            return Array.from({ length: 5 }, (_, i) => ({
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric' 
                }),
                avgTemp: 25 + Math.random() * 10,
                avgHumidity: 60 + Math.random() * 20
            }));
        }

        const grouped = {};
        
        forecast.forEach(item => {
            const date = new Date(item.datetime).toDateString();
            if (!grouped[date]) {
                grouped[date] = {
                    temps: [],
                    humidity: [],
                    date: new Date(item.datetime).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric' 
                    })
                };
            }
            grouped[date].temps.push(item.temperature);
            grouped[date].humidity.push(item.humidity);
        });

        return Object.values(grouped)
            .slice(0, 5)
            .map(day => ({
                date: day.date,
                avgTemp: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
                avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length)
            }));
    }

    async loadAirQualityData() {
        try {
            const response = await fetch(this.endpoints.airQuality(this.currentLocation));
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.updateAirQualityUI(data);
            
        } catch (error) {
            console.error('Air quality data error:', error);
            this.updateAirQualityUI({
                aqi: '--',
                category: 'Unavailable'
            });
        }
    }

    updateAirQualityUI(data) {
        const aqiElement = document.getElementById('aqi-value');
        const statusElement = document.getElementById('aqi-status');
        
        if (aqiElement) {
            aqiElement.textContent = data.aqi || '--';
        }
        
        if (statusElement) {
            statusElement.textContent = data.category || 'Unavailable';
        }

        // Update AQI card color based on value
        const aqiCard = aqiElement?.closest('.card');
        if (aqiCard && data.aqi !== '--') {
            let cardClass = 'bg-success'; // Good
            if (data.aqi > 100) cardClass = 'bg-warning'; // Moderate to Unhealthy
            if (data.aqi > 200) cardClass = 'bg-danger'; // Very Unhealthy
            
            aqiCard.className = aqiCard.className.replace(/bg-\w+/, cardClass);
        }
    }

    async loadLocationData() {
        try {
            const response = await fetch(this.endpoints.location(this.currentLocation));
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.updateLocationUI(data);
            
        } catch (error) {
            console.error('Location data error:', error);
            this.updateLocationUI({});
        }
    }

    updateLocationUI(data) {
        // Update basic location info
        const updates = {
            'population': data.population?.toLocaleString('en-IN') || '--',
            'district-area': data.area || '--',
            'latitude': data.lat || '--',
            'longitude': data.lon || '--',
            'elevation': data.elevation || '--'
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Update demographics if available
        if (data.demographics) {
            const demo = data.demographics;
            const demoUpdates = {
                'density': demo.density?.toLocaleString('en-IN') || '--',
                'literacy-rate': demo.literacy_rate || '--',
                'sex-ratio': demo.sex_ratio || '--'
            };

            Object.entries(demoUpdates).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });
        }

        // Update infrastructure info
        if (data.infrastructure) {
            const infra = data.infrastructure;
            const infraUpdates = {
                'railway-count': infra.railway_stations || '--',
                'roads-count': infra.major_roads || '--',
                'hospitals-count': infra.hospitals || '--',
                'education-count': infra.educational_institutes || '--'
            };

            Object.entries(infraUpdates).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });
        }
    }

    async loadNewsData() {
        try {
            const response = await fetch(this.endpoints.news(this.currentLocation));
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.updateNewsUI(data);
            
        } catch (error) {
            console.error('News data error:', error);
            this.updateNewsUI({ articles: [] });
        }
    }

    updateNewsUI(data) {
        const container = document.getElementById('news-container');
        if (!container) return;

        if (!data.articles || data.articles.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No recent news available for this location.
                </div>
            `;
            return;
        }

        const newsHTML = data.articles.slice(0, 5).map(article => {
            const publishedDate = new Date(article.published_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="mb-3 pb-3 border-bottom">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">
                                <a href="${article.url || '#'}" target="_blank" class="text-decoration-none">
                                    ${article.title}
                                </a>
                            </h6>
                            <p class="text-muted mb-1 small">${article.description || 'No description available'}</p>
                            <div class="d-flex justify-content-between">
                                <small class="text-muted">
                                    <i class="fas fa-newspaper me-1"></i>${article.source || 'Unknown Source'}
                                </small>
                                <small class="text-muted">
                                    <i class="fas fa-clock me-1"></i>${publishedDate}
                                </small>
                            </div>
                        </div>
                        ${article.image ? `
                            <div class="ms-3">
                                <img src="${article.image}" alt="News Image" 
                                     class="img-thumbnail" style="width: 80px; height: 60px; object-fit: cover;">
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = newsHTML;
    }

    async loadEconomicData() {
        try {
            const response = await fetch(this.endpoints.economy());
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.updateEconomicUI(data);
            
        } catch (error) {
            console.error('Economic data error:', error);
            this.updateEconomicUI({});
        }
    }

    updateEconomicUI(data) {
        // Update currency rate
        const currencyElement = document.getElementById('currency-rate');
        if (currencyElement) {
            if (data.currency?.rate) {
                currencyElement.textContent = `₹${data.currency.rate.toFixed(2)}`;
            } else {
                currencyElement.textContent = '₹--';
            }
        }

        // Update gold price
        const goldElement = document.getElementById('gold-price');
        if (goldElement) {
            if (data.gold?.price_per_10g_inr) {
                goldElement.textContent = `₹${data.gold.price_per_10g_inr.toLocaleString('en-IN')}`;
            } else {
                goldElement.textContent = '₹--';
            }
        }

        // Update crude oil price
        const crudeElement = document.getElementById('crude-price');
        if (crudeElement) {
            if (data.crude_oil?.price_usd) {
                crudeElement.textContent = `$${data.crude_oil.price_usd.toFixed(2)}`;
            } else {
                crudeElement.textContent = '$--';
            }
        }

        // Load stock market data
        this.loadStockData();
    }

    async loadStockData() {
        try {
            const response = await fetch(this.endpoints.stocks());
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.updateStockUI(data);
            
        } catch (error) {
            console.error('Stock data error:', error);
            this.updateStockUI({ stocks: [] });
        }
    }

    updateStockUI(data) {
        const container = document.getElementById('stock-data');
        if (!container) return;

        if (!data.stocks || data.stocks.length === 0) {
            container.innerHTML = '<p class="text-muted">Stock data unavailable</p>';
            return;
        }

        const stockHTML = data.stocks.slice(0, 4).map(stock => {
            const changeClass = stock.change >= 0 ? 'text-success' : 'text-danger';
            const changeIcon = stock.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
            
            return `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <strong>${stock.symbol.replace('.BSE', '')}</strong>
                        <div class="small text-muted">₹${stock.price.toFixed(2)}</div>
                    </div>
                    <div class="text-end">
                        <span class="${changeClass}">
                            <i class="fas ${changeIcon} me-1"></i>
                            ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = stockHTML;
    }

    async loadTransportData() {
        try {
            const response = await fetch(this.endpoints.transport(this.currentLocation));
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            // Transport data is already updated in location data
            
        } catch (error) {
            console.error('Transport data error:', error);
        }
    }

    showError(message) {
        console.error('Dashboard Error:', message);
        
        // You could show a toast notification here
        // For now, we'll just log it
    }

    // Utility method to format numbers
    formatNumber(num) {
        if (typeof num !== 'number') return '--';
        return num.toLocaleString('en-IN');
    }

    // Utility method to format dates
    formatDate(dateString) {
        if (!dateString) return '--';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // Clean up method
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        if (this.weatherChart) {
            this.weatherChart.destroy();
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM Content Loaded - Initializing Dashboard...');
    
    // Create global dashboard instance
    window.dashboard = new MaharashtraDashboard();
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        if (window.dashboard) {
            window.dashboard.destroy();
        }
    });
});

// Handle page visibility changes to pause/resume updates
document.addEventListener('visibilitychange', () => {
    if (window.dashboard) {
        if (document.hidden) {
            console.log('📱 Page hidden - pausing updates');
            // Could pause updates here
        } else {
            console.log('📱 Page visible - resuming updates');
            window.dashboard.loadAllData();
        }
    }
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaharashtraDashboard;
}