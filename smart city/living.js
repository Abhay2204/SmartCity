let currentLocation = 'ballarpur';

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            loadPageData();
        });

        function changeLocation() {
            currentLocation = document.getElementById('locationSelect').value;
            loadPageData();
        }

        async function loadPageData() {
            await Promise.all([
                loadWeatherData(),
                loadAirQualityData(),
                loadLocationData(),
                loadNearbyServices(),
                loadNews(),
                loadUtilityStatus()
            ]);
        }

        async function loadWeatherData() {
            try {
                const response = await fetch(`/api/weather/current/${currentLocation}`);
                const data = await response.json();
                
                document.getElementById('weatherInfo').innerHTML = `
                    <div class="fs-1 mb-2">${data.temperature}°C</div>
                    <div class="mb-2">${data.description}</div>
                    <small>Feels like ${data.feels_like}°C</small>
                `;
            } catch (error) {
                document.getElementById('weatherInfo').innerHTML = '<small>Weather data unavailable</small>';
            }
        }

        async function loadAirQualityData() {
            try {
                const response = await fetch(`/api/air-quality/${currentLocation}`);
                const data = await response.json();
                
                let aqiClass = 'air-quality-good';
                if (data.aqi > 100) aqiClass = 'air-quality-unhealthy';
                else if (data.aqi > 50) aqiClass = 'air-quality-moderate';
                
                document.getElementById('airQualityInfo').innerHTML = `
                    <div class="badge ${aqiClass} fs-6 mb-2">${data.aqi} AQI</div>
                    <div class="small">${data.category}</div>
                `;
            } catch (error) {
                document.getElementById('airQualityInfo').innerHTML = '<small>AQI data unavailable</small>';
            }
        }

        async function loadLocationData() {
            try {
                const response = await fetch(`/api/location/${currentLocation}`);
                const data = await response.json();
                
                document.getElementById('locationInfo').innerHTML = `
                    <div class="fw-bold mb-1">${data.name}</div>
                    <div class="small mb-1">${data.district}, ${data.state}</div>
                    <div class="small">Population: ${data.population.toLocaleString()}</div>
                `;
            } catch (error) {
                document.getElementById('locationInfo').innerHTML = '<small>Location data unavailable</small>';
            }
        }

        async function loadNearbyServices() {
            try {
                const response = await fetch(`/api/location/${currentLocation}`);
                const data = await response.json();
                
                // Hospital list
                document.getElementById('hospitalList').innerHTML = `
                    <div class="small mb-1">• ${data.name} District Hospital</div>
                    <div class="small mb-1">• Primary Health Center</div>
                    <div class="small">• Community Health Center</div>
                `;
                
                // Community centers
                document.getElementById('communityList').innerHTML = `
                    <div class="small mb-1">• ${data.name} Community Hall</div>
                    <div class="small mb-1">• Municipal Library</div>
                    <div class="small">• Sports Complex</div>
                `;
            } catch (error) {
                document.getElementById('hospitalList').innerHTML = '<small>Data unavailable</small>';
                document.getElementById('communityList').innerHTML = '<small>Data unavailable</small>';
            }
        }

        async function loadNews() {
            try {
                const response = await fetch(`/api/news/${currentLocation}`);
                const data = await response.json();
                
                let newsHtml = '';
                data.articles.slice(0, 5).forEach(article => {
                    const publishedDate = new Date(article.published_at).toLocaleDateString();
                    newsHtml += `
                        <div class="news-item">
                            <h6 class="mb-1">${article.title}</h6>
                            <p class="small text-muted mb-1">${article.description}</p>
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>${publishedDate}
                                <i class="fas fa-tag ms-2 me-1"></i>${article.source}
                            </small>
                        </div>
                    `;
                });
                
                document.getElementById('newsContainer').innerHTML = newsHtml;
            } catch (error) {
                document.getElementById('newsContainer').innerHTML = '<p class="text-muted">News data unavailable</p>';
            }
        }

        async function loadUtilityStatus() {
            // Simulate utility status
            const statuses = ['Normal', 'Maintenance', 'Alert'];
            const utilities = ['Water Supply', 'Electricity', 'Waste Collection'];
            
            let statusHtml = '';
            utilities.forEach(utility => {
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const badgeClass = status === 'Normal' ? 'success' : status === 'Alert' ? 'danger' : 'warning';
                statusHtml += `<div class="small mb-1">${utility}: <span class="badge bg-${badgeClass}">${status}</span></div>`;
            });
            
            document.getElementById('utilityStatus').innerHTML = statusHtml;
        }

        function callEmergency(number) {
            if (confirm(`Call emergency number ${number}?`)) {
                window.open(`tel:${number}`);
            }
        }

        function bookAppointment() {
            alert('Appointment booking system would be integrated here. For now, please call your healthcare provider directly.');
        }

        function viewAppointments() {
            alert('Appointment viewing system would be implemented here.');
        }

        function openHealthBot() {
            alert('Health chatbot would be integrated here. For medical emergencies, please call 108.');
        }

        function viewEvents() {
            alert('Community events calendar would be displayed here.');
        }

        function joinCommunity() {
            alert('Community group joining feature would be implemented here.');
        }

        function viewVolunteerOps() {
            alert('Volunteer opportunities portal would be shown here.');
        }

        function newServiceRequest() {
            const modal = new bootstrap.Modal(document.getElementById('serviceRequestModal'));
            modal.show();
        }

        function trackServiceRequest() {
            const modal = new bootstrap.Modal(document.getElementById('trackRequestModal'));
            modal.show();
        }

        async function submitServiceRequest() {
            const form = document.getElementById('serviceRequestForm');
            const formData = new FormData(form);
            
            const requestData = {
                service_type: formData.get('service_type'),
                description: formData.get('description'),
                name: formData.get('name'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                location: currentLocation
            };
            
            try {
                const response = await fetch('/api/service-requests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(`Service request submitted successfully!\nRequest ID: ${result.request_id}\nEstimated completion: ${new Date(result.estimated_completion).toLocaleDateString()}`);
                    form.reset();
                    bootstrap.Modal.getInstance(document.getElementById('serviceRequestModal')).hide();
                } else {
                    alert('Failed to submit service request. Please try again.');
                }
            } catch (error) {
                alert('Error submitting request. Please try again.');
            }
        }

        async function trackRequest() {
            const requestId = document.getElementById('trackRequestId').value.trim();
            
            if (!requestId) {
                alert('Please enter a request ID');
                return;
            }
            
            try {
                const response = await fetch(`/api/complaints/${requestId}`);
                const data = await response.json();
                
                if (response.ok) {
                    document.getElementById('trackResult').innerHTML = `
                        <div class="alert alert-info">
                            <h6>Request Status: ${data.status}</h6>
                            <p><strong>Service:</strong> ${data.category}</p>
                            <p><strong>Description:</strong> ${data.description}</p>
                            <p><strong>Submitted:</strong> ${new Date(data.created_at).toLocaleString()}</p>
                            <p><strong>Estimated Resolution:</strong> ${data.estimated_resolution}</p>
                        </div>
                    `;
                } else {
                    document.getElementById('trackResult').innerHTML = `
                        <div class="alert alert-warning">
                            Request ID not found. Please check the ID and try again.
                        </div>
                    `;
                }
            } catch (error) {
                document.getElementById('trackResult').innerHTML = `
                    <div class="alert alert-danger">
                        Error tracking request. Please try again.
                    </div>
                `;
            }
        }

        function payBills() {
            alert('Bill payment system would be integrated here.');
        }

        function viewBills() {
            alert('Bill viewing system would be implemented here.');
        }