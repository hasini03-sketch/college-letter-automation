// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Demo System - Letter Request Management
class LetterRequestSystem {
    constructor() {
        this.requests = [];
        this.requestCounter = 1;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        const form = document.getElementById('letterRequestForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const request = {
            id: `REQ-${String(this.requestCounter).padStart(4, '0')}`,
            studentName: formData.get('studentName'),
            studentId: formData.get('studentId'),
            letterType: formData.get('letterType'),
            purpose: formData.get('purpose'),
            urgency: formData.get('urgency'),
            status: 'pending',
            timestamp: new Date(),
            processingTime: this.calculateProcessingTime(formData.get('urgency'))
        };

        this.requests.push(request);
        this.requestCounter++;

        // Reset form
        e.target.reset();

        // Update displays
        this.updateDisplay();
        this.showSuccessMessage(request);

        // Auto-process based on criteria
        setTimeout(() => {
            this.autoProcessRequest(request);
        }, 2000);
    }

    calculateProcessingTime(urgency) {
        const times = {
            'standard': Math.floor(Math.random() * 3) + 3, // 3-5 minutes
            'expedited': Math.floor(Math.random() * 2) + 1, // 1-2 minutes
            'urgent': 0.5 // 30 seconds
        };
        return times[urgency] || 3;
    }

    autoProcessRequest(request) {
        // Simulate auto-approval logic
        const approvalRate = this.getApprovalRate(request.letterType);
        const isApproved = Math.random() < approvalRate;

        request.status = isApproved ? 'approved' : 'pending_review';
        request.processedAt = new Date();

        if (isApproved) {
            request.autoApproved = true;
            this.showNotification(`Request ${request.id} has been automatically approved!`, 'success');
        } else {
            this.showNotification(`Request ${request.id} requires manual review.`, 'info');
        }

        this.updateDisplay();
    }

    getApprovalRate(letterType) {
        const rates = {
            'recommendation': 0.95,
            'transcript': 0.98,
            'verification': 0.99,
            'achievement': 0.92
        };
        return rates[letterType] || 0.90;
    }

    approveRequest(requestId) {
        const request = this.requests.find(r => r.id === requestId);
        if (request) {
            request.status = 'approved';
            request.processedAt = new Date();
            request.approvedBy = 'Admin User';
            this.updateDisplay();
            this.showNotification(`Request ${requestId} has been approved!`, 'success');
        }
    }

    rejectRequest(requestId) {
        const request = this.requests.find(r => r.id === requestId);
        if (request) {
            request.status = 'rejected';
            request.processedAt = new Date();
            request.rejectedBy = 'Admin User';
            request.rejectionReason = 'Insufficient documentation provided';
            this.updateDisplay();
            this.showNotification(`Request ${requestId} has been rejected.`, 'error');
        }
    }

    updateDisplay() {
        this.updatePendingRequests();
        this.updateStatusTracking();
    }

    updatePendingRequests() {
        const container = document.getElementById('pendingRequests');
        if (!container) return;

        const pendingRequests = this.requests.filter(r => r.status === 'pending' || r.status === 'pending_review');

        if (pendingRequests.length === 0) {
            container.innerHTML = '<p class="no-requests">No pending requests. Submit a request to see the approval process.</p>';
            return;
        }

        container.innerHTML = pendingRequests.map(request => `
            <div class="request-item">
                <div class="request-header">
                    <span class="request-id">${request.id}</span>
                    <span class="request-time">${this.formatTime(request.timestamp)}</span>
                </div>
                <div class="request-details">
                    <p><strong>Student:</strong> ${request.studentName} (${request.studentId})</p>
                    <p><strong>Type:</strong> ${this.formatLetterType(request.letterType)}</p>
                    <p><strong>Purpose:</strong> ${request.purpose}</p>
                    <p><strong>Urgency:</strong> ${this.formatUrgency(request.urgency)}</p>
                </div>
                <div class="request-actions">
                    <button class="btn-approve" onclick="letterSystem.approveRequest('${request.id}')">
                        Approve
                    </button>
                    <button class="btn-reject" onclick="letterSystem.rejectRequest('${request.id}')">
                        Reject
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateStatusTracking() {
        const container = document.getElementById('requestStatus');
        if (!container) return;

        if (this.requests.length === 0) {
            container.innerHTML = '<p class="no-status">Submit a request to track its status here.</p>';
            return;
        }

        container.innerHTML = this.requests.slice(-5).reverse().map(request => `
            <div class="status-item">
                <div class="status-header">
                    <div>
                        <strong>${request.id}</strong> - ${this.formatLetterType(request.letterType)}
                        <br>
                        <small>${request.studentName}</small>
                    </div>
                    <span class="status-badge ${request.status.replace('_', '-')}">
                        ${this.formatStatus(request.status)}
                    </span>
                </div>
                <div class="status-progress">
                    <div class="progress-step">
                        <div class="progress-dot completed"></div>
                        <span>Submitted</span>
                    </div>
                    <div class="progress-step">
                        <div class="progress-dot ${request.status !== 'pending' ? 'completed' : 'current'}"></div>
                        <span>Processing</span>
                    </div>
                    <div class="progress-step">
                        <div class="progress-dot ${request.status === 'approved' ? 'completed' : ''}"></div>
                        <span>Completed</span>
                    </div>
                </div>
                ${request.processedAt ? `
                    <p style="margin-top: 1rem; font-size: 0.875rem; color: #6b7280;">
                        ${request.status === 'approved' ? 'Approved' : 'Processed'} on ${this.formatDateTime(request.processedAt)}
                        ${request.autoApproved ? ' (Auto-approved)' : ''}
                    </p>
                ` : ''}
                ${request.rejectionReason ? `
                    <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #dc2626;">
                        Reason: ${request.rejectionReason}
                    </p>
                ` : ''}
            </div>
        `).join('');
    }

    formatLetterType(type) {
        const types = {
            'recommendation': 'Recommendation Letter',
            'transcript': 'Official Transcript',
            'verification': 'Enrollment Verification',
            'achievement': 'Achievement Letter'
        };
        return types[type] || type;
    }

    formatUrgency(urgency) {
        const urgencies = {
            'standard': 'Standard (5-7 days)',
            'expedited': 'Expedited (2-3 days)',
            'urgent': 'Urgent (Same day)'
        };
        return urgencies[urgency] || urgency;
    }

    formatStatus(status) {
        const statuses = {
            'pending': 'Pending',
            'pending_review': 'Under Review',
            'approved': 'Approved',
            'rejected': 'Rejected'
        };
        return statuses[status] || status;
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDateTime(date) {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showSuccessMessage(request) {
        this.showNotification(
            `Request ${request.id} submitted successfully! Processing will take approximately ${request.processingTime} minutes.`,
            'success'
        );
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 90px;
                    right: 20px;
                    max-width: 400px;
                    padding: 1rem;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    z-index: 1001;
                    animation: slideInRight 0.3s ease-out;
                }
                .notification-success {
                    background: #d1fae5;
                    border-left: 4px solid #10b981;
                    color: #065f46;
                }
                .notification-error {
                    background: #fee2e2;
                    border-left: 4px solid #dc2626;
                    color: #991b1b;
                }
                .notification-info {
                    background: #dbeafe;
                    border-left: 4px solid #2563eb;
                    color: #1e40af;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .notification-message {
                    flex: 1;
                    font-size: 0.875rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    opacity: 0.7;
                }
                .notification-close:hover {
                    opacity: 1;
                }
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'info': 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.letterSystem = new LetterRequestSystem();
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.problem-item, .letter-type-card, .benefit-card, .tech-category');
    animateElements.forEach(el => observer.observe(el));
});

// Counter animation for statistics
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + (element.dataset.suffix || '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + (element.dataset.suffix || '');
        }
    }, 16);
}

// Animate counters when they come into view
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            const target = parseInt(entry.target.dataset.target);
            animateCounter(entry.target, target);
            entry.target.classList.add('animated');
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    // Set up counter elements
    const benefitStats = document.querySelectorAll('.benefit-stat');
    benefitStats.forEach((stat, index) => {
        const values = ['85', '50', '99.2', '24'];
        const suffixes = ['%', 'K', '%', '/7'];
        stat.dataset.target = values[index];
        stat.dataset.suffix = suffixes[index];
        stat.textContent = '0' + suffixes[index];
        counterObserver.observe(stat);
    });
});

// Form validation and enhancement
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('letterRequestForm');
    if (form) {
        // Add real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
});

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing error
    clearFieldError(e);
    
    // Validate based on field type
    let isValid = true;
    let errorMessage = '';
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    } else if (field.name === 'studentId' && value && !isValidStudentId(value)) {
        isValid = false;
        errorMessage = 'Student ID should be in format: STU12345';
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
}

function clearFieldError(e) {
    const field = e.target;
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    field.classList.remove('error');
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = 'color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem;';
    
    field.parentElement.appendChild(errorElement);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidStudentId(id) {
    return /^[A-Z]{3}\d{5}$/.test(id);
}

// Add CSS for form validation
document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('#form-validation-styles')) {
        const styles = document.createElement('style');
        styles.id = 'form-validation-styles';
        styles.textContent = `
            .form-group input.error,
            .form-group select.error,
            .form-group textarea.error {
                border-color: #dc2626;
                box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
            }
        `;
        document.head.appendChild(styles);
    }
});