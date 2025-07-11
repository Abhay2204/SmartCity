  let currentLocation = 'ballarpur';
        let complaintCounter = 1001;

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            loadNews();
            loadLocationInfo();
            
            // Location change handler
            document.querySelectorAll('input[name="location"]').forEach(radio => {
                radio.addEventListener('change', function() {
                    currentLocation = this.value;
                    loadNews();
                    loadLocationInfo();
                });
            });

            // Complaint form handler
            document.getElementById('complaintForm').addEventListener('submit', function(e) {
                e.preventDefault();
                submitComplaint();
            });
        });

        // Document Scanner using Tesseract.js
        async function scanDocument() {
            const fileInput = document.getElementById('documentFile');
            const file = fileInput.files[0];
            
            if (!file) {
                showAlert('Error', 'Please select an image file first.');
                return;
            }

            const progressDiv = document.getElementById('scanProgress');
            const resultDiv = document.getElementById('scanResult');
            const progressBar = progressDiv.querySelector('.progress-bar');
            
            progressDiv.style.display = 'block';
            resultDiv.innerHTML = '';

            try {
                const result = await Tesseract.recognize(file, 'eng', {
                    logger: info => {
                        if (info.status === 'recognizing text') {
                            const progress = Math.round(info.progress * 100);
                            progressBar.style.width = progress + '%';
                            progressBar.textContent = progress + '%';
                        }
                    }
                });

                progressDiv.style.display = 'none';
                
                if (result.data.text.trim()) {
                    resultDiv.innerHTML = `
                        <div class="alert alert-success">
                            <h6><i class="fas fa-check-circle me-2"></i>Text Extracted Successfully:</h6>
                            <div class="bg-light p-3 rounded mt-2">
                                <pre class="mb-0" style="white-space: pre-wrap; font-size: 0.9em;">${result.data.text}</pre>
                            </div>
                            <button class="btn btn-sm btn-outline-success mt-2" onclick="copyToClipboard('${result.data.text.replace(/'/g, "\\'")}')">
                                <i class="fas fa-copy me-1"></i>Copy Text
                            </button>
                        </div>
                    `;
                } else {
                    resultDiv.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            No text could be extracted from this image. Please try with a clearer image.
                        </div>
                    `;
                }
            } catch (error) {
                progressDiv.style.display = 'none';
                resultDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-times-circle me-2"></i>
                        Error processing document: ${error.message}
                    </div>
                `;
            }
        }

        // Load news from API
        async function loadNews() {
            const newsContainer = document.getElementById('newsContainer');
            newsContainer.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Loading latest news...</p>
                </div>
            `;

            try {
                const response = await fetch(`/api/news/${currentLocation}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.articles && data.articles.length > 0) {
                    newsContainer.innerHTML = '';
                    data.articles.slice(0, 3).forEach(article => {
                        const newsItem = document.createElement('div');
                        newsItem.className = 'border-bottom pb-3 mb-3';
                        newsItem.innerHTML = `
                            <h6 class="text-primary mb-2">${article.title}</h6>
                            <p class="text-muted small mb-2">${article.description || 'No description available'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-secondary">
                                    <i class="fas fa-clock me-1"></i>
                                    ${new Date(article.published_at).toLocaleDateString()}
                                </small>
                                ${article.url ? `<a href="${article.url}" target="_blank" class="btn btn-sm btn-outline-success">Read More</a>` : ''}
                            </div>
                        `;
                        newsContainer.appendChild(newsItem);
                    });
                } else {
                    newsContainer.innerHTML = `
                        <div class="text-center text-muted">
                            <i class="fas fa-newspaper fa-3x mb-3"></i>
                            <p>No recent news available for ${currentLocation}</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error loading news:', error);
                newsContainer.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Unable to load news at this time. Please try again later.
                    </div>
                `;
            }
        }

        // Load location information
        async function loadLocationInfo() {
            const locationInfo = document.getElementById('locationInfo');
            locationInfo.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Loading location data...</p>
                </div>
            `;

            try {
                const response = await fetch(`/api/location/${currentLocation}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                locationInfo.innerHTML = `
                    <div class="row g-3">
                        <div class="col-6">
                            <div class="text-center">
                                <h3 class="text-primary mb-0">${data.population.toLocaleString()}</h3>
                                <small class="text-muted">Population</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center">
                                <h3 class="text-success mb-0">${data.area}</h3>
                                <small class="text-muted">Area (km²)</small>
                            </div>
                        </div>
                        <div class="col-12">
                            <hr>
                            <h6 class="text-secondary">Infrastructure</h6>
                            <div class="row text-center">
                                <div class="col-4">
                                    <i class="fas fa-hospital text-danger"></i>
                                    <br><small>${data.infrastructure.hospitals} Hospitals</small>
                                </div>
                                <div class="col-4">
                                    <i class="fas fa-graduation-cap text-info"></i>
                                    <br><small>${data.infrastructure.educational_institutes} Schools</small>
                                </div>
                                <div class="col-4">
                                    <i class="fas fa-university text-warning"></i>
                                    <br><small>${data.infrastructure.banks} Banks</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('Error loading location info:', error);
                locationInfo.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Unable to load location information at this time.
                    </div>
                `;
            }
        }

        // Submit complaint
        function submitComplaint() {
            const category = document.getElementById('complaintCategory').value;
            const description = document.getElementById('complaintDescription').value;
            const name = document.getElementById('complaintName').value;
            const phone = document.getElementById('complaintPhone').value;

            if (!category || !description || !name || !phone) {
                showAlert('Error', 'Please fill in all required fields.');
                return;
            }

            const complaintId = `${currentLocation.toUpperCase()}-${complaintCounter++}`;
            
            // Store complaint (in real app, this would go to server)
            const complaint = {
                id: complaintId,
                category,
                description,
                name,
                phone,
                location: currentLocation,
                status: 'Submitted',
                date: new Date().toISOString()
            };

            // Save to localStorage for demo purposes
            const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
            complaints.push(complaint);
            localStorage.setItem('complaints', JSON.stringify(complaints));

            showAlert('Success', `Complaint submitted successfully! Your complaint ID is: ${complaintId}. Please keep this ID for tracking.`);
            
            // Reset form
            document.getElementById('complaintForm').reset();
        }

        // Track service request
        function trackRequest() {
            const trackingId = document.getElementById('trackingId').value.trim();
            const resultDiv = document.getElementById('trackingResult');
            
            if (!trackingId) {
                resultDiv.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Please enter a valid tracking ID.
                    </div>
                `;
                return;
            }

            // Check localStorage for demo complaints
            const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
            const complaint = complaints.find(c => c.id === trackingId);

            if (complaint) {
                const statuses = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
                const currentStatusIndex = Math.min(
                    Math.floor((Date.now() - new Date(complaint.date).getTime()) / (24 * 60 * 60 * 1000)),
                    statuses.length - 1
                );
                
                resultDiv.innerHTML = `
                    <div class="alert alert-info">
                        <h6><i class="fas fa-info-circle me-2"></i>Complaint Status</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <strong>ID:</strong> ${complaint.id}<br>
                                <strong>Category:</strong> ${complaint.category}<br>
                                <strong>Status:</strong> <span class="badge bg-primary">${statuses[currentStatusIndex]}</span>
                            </div>
                            <div class="col-md-6">
                                <strong>Submitted:</strong> ${new Date(complaint.date).toLocaleDateString()}<br>
                                <strong>Location:</strong> ${complaint.location}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-search me-2"></i>
                        No complaint found with ID: ${trackingId}
                    </div>
                `;
            }
        }

        // Utility functions
        function showAlert(title, message) {
            document.getElementById('alertModalTitle').textContent = title;
            document.getElementById('alertModalBody').textContent = message;
            new bootstrap.Modal(document.getElementById('alertModal')).show();
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showAlert('Success', 'Text copied to clipboard!');
            }).catch(() => {
                showAlert('Error', 'Failed to copy text to clipboard.');
            });
        }