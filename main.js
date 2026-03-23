import { db } from './db.js';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    await initApp();
});

const initApp = async () => {
    const loader = document.getElementById('loader-bar');
    if (loader) loader.style.width = '30%';
    
    try {
        await renderDoctors();
        if (loader) loader.style.width = '60%';
        setupEventListeners();
        await checkAuthSession();
        if (loader) {
            loader.style.width = '100%';
            setTimeout(() => loader.style.width = '0%', 500);
        }
    } catch (e) {
        console.error("App Init Error:", e);
    }
};

// --- View Router ---
const showView = (viewId) => {
    const views = ['landing-view', 'dashboard-view', 'admin-view'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.toggle('hidden', v !== viewId);
    });
    
    const footer = document.querySelector('footer');
    if (footer) footer.classList.toggle('hidden', viewId !== 'landing-view');
    
    // Close mobile menu if open
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.remove('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- Auth State ---
const checkAuthSession = async () => {
    const user = await db.getCurrentUser();
    const logoutGroup = document.getElementById('logged-out-btns');
    const loginGroup = document.getElementById('logged-in-btns');
    const navLinks = document.querySelector('.nav-links');

    if (user) {
        if (logoutGroup) logoutGroup.classList.add('hidden');
        if (loginGroup) loginGroup.classList.remove('hidden');
        const nameEl = document.getElementById('user-name');
        if (nameEl) nameEl.innerText = user.name;
        
        if (!document.getElementById('nav-dash-link') && navLinks) {
             const li = document.createElement('li');
             li.id = 'nav-dash-link';
             li.innerHTML = `<a href="#${user.role === 'admin' ? 'admin' : 'dashboard'}" id="dash-link-btn">${user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}</a>`;
             navLinks.appendChild(li);
             document.getElementById('dash-link-btn').onclick = (e) => handleNavClick(e, user.role);
        }
    } else {
        if (logoutGroup) logoutGroup.classList.remove('hidden');
        if (loginGroup) loginGroup.classList.add('hidden');
        const dashLink = document.getElementById('nav-dash-link');
        if (dashLink) dashLink.remove();
        showView('landing-view');
    }
};

const handleNavClick = async (e, role) => {
    e.preventDefault();
    if (role === 'admin') {
        showView('admin-view');
        await renderAdminDashboard();
    } else {
        showView('dashboard-view');
        await renderDashboard();
    }
};

// --- DOM Rendering ---
const renderDoctors = async () => {
    const doctorGrid = document.getElementById('doctors-list');
    const bookingDoctor = document.getElementById('booking-doctor');
    const doctors = await db.getDoctors();

    if (doctorGrid) {
        doctorGrid.innerHTML = doctors.map(doc => `
            <div class="doctor-card fadeInUp">
                <div class="doc-img-container">
                    <img src="${doc.image}" alt="${doc.name}">
                </div>
                <div class="doc-info">
                    <span class="specialty">${doc.specialty}</span>
                    <h3>${doc.name}</h3>
                    <div class="rating">
                        <i data-lucide="star" fill="currentColor"></i>
                        <span>${doc.rating} (120+ reviews)</span>
                    </div>
                    <button class="btn-outline-sm btn-block" onclick="scrollToSection('appointment')">Book Now</button>
                </div>
            </div>
        `).join('');
    }

    if (bookingDoctor) {
        bookingDoctor.innerHTML = '<option value="">Choose a Doctor</option>' + 
            doctors.map(doc => `<option value="${doc.id}">${doc.name} (${doc.specialty})</option>`).join('');
    }

    lucide.createIcons();
};

const renderDashboard = async () => {
    const user = await db.getCurrentUser();
    if (!user) return showView('landing-view');

    const apptContainer = document.getElementById('appointments-list-container');
    const appts = await db.getAppointments(user.id);

    if (appts.length === 0) {
        if (apptContainer) apptContainer.innerHTML = '<p class="empty-msg">No appointments booked yet.</p>';
        return;
    }

    const doctors = await db.getDoctors();
    
    if (apptContainer) {
        apptContainer.innerHTML = appts.map(a => {
            const doc = doctors.find(d => d.id === a.doctorId);
            const dateObj = new Date(a.date);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();

            return `
                <div class="appt-item">
                    <div class="appt-info">
                        <div class="appt-date">
                            <b>${day || '--'}</b>
                            <span>${month || 'ANY'}</span>
                        </div>
                        <div>
                            <h4>${doc ? doc.name : 'Specialist'}</h4>
                            <p style="color: grey; font-size: 0.85rem;">${a.time} • ${doc ? doc.specialty : 'General'}</p>
                        </div>
                    </div>
                    <div class="appt-status status-${a.status}">${a.status}</div>
                </div>
            `;
        }).join('');
    }

    await renderReports();
};

const renderReports = async () => {
    const user = await db.getCurrentUser();
    const list = document.getElementById('report-list');
    const reportData = await db.getReports(user.id);

    if (list) {
        list.innerHTML = reportData.map(r => `
            <div class="report-item">
                <div style="display: flex; gap: 0.8rem; align-items: center;">
                    <i data-lucide="file-text" style="color: var(--primary);"></i>
                    <div>
                        <div style="font-weight: 600; font-size: 0.9rem;">${r.fileName}</div>
                        <div style="font-size: 0.75rem; color: grey;">Uploaded ${r.date}</div>
                    </div>
                </div>
                <a href="${r.url}" target="_blank"><i data-lucide="download" style="cursor: pointer; color: grey;"></i></a>
            </div>
        `).join('');
    }
    lucide.createIcons();
};

const renderAdminDashboard = async (filterSearch = '', statusFilter = 'all') => {
    const appts = await db.getAllAppointments();
    const tbody = document.getElementById('admin-appointments-tbody');

    const filtered = appts.filter(a => {
        const matchesSearch = (a.patientName || '').toLowerCase().includes(filterSearch.toLowerCase()) || 
                             (a.doctorName || '').toLowerCase().includes(filterSearch.toLowerCase());
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalEl = document.getElementById('admin-total-appts');
    const patientsEl = document.getElementById('admin-total-patients');
    if (totalEl) totalEl.innerText = appts.length;
    if (patientsEl) patientsEl.innerText = new Set(appts.map(a => a.userId)).size;

    if (tbody) {
        tbody.innerHTML = filtered.map(a => `
            <tr>
                <td>
                    <div class="patient-cell">
                        <div style="width: 32px; height: 32px; background: #e2e8f0; border-radius: 50%; display: grid; place-items: center;">${(a.patientName || 'P')[0]}</div>
                        ${a.patientName || 'Anonymous'}
                    </div>
                </td>
                <td>${a.doctorName || 'General Doctor'}</td>
                <td>${a.date} | ${a.time}</td>
                <td><span class="appt-status status-${a.status}">${a.status}</span></td>
                <td>
                    <select id="status-select-${a.id}" style="padding: 0.3rem; font-size: 0.8rem; width: auto;">
                        <option value="scheduled" ${a.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                        <option value="completed" ${a.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${a.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            </tr>
        `).join('');

        filtered.forEach(a => {
            const sel = document.getElementById(`status-select-${a.id}`);
            if (sel) sel.onchange = (e) => updateApptStatus(a.id, e.target.value);
        });
    }
};

const updateApptStatus = async (id, newStatus) => {
    await db.updateAppointmentStatus(id, newStatus);
    await renderAdminDashboard();
};

// --- Event Listeners ---
const setupEventListeners = () => {
    // Nav Scroll
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('main-nav');
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Mobile Toggle
    const toggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle && navLinks) {
        toggle.onclick = () => {
            navLinks.classList.toggle('active');
        };
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.onclick = () => {
            if (navLinks) navLinks.classList.remove('active');
        };
    });

    // Modal Switch
    const switchBtn = document.getElementById('switch-auth');
    if (switchBtn) {
        switchBtn.onclick = () => {
            const title = document.getElementById('modal-title');
            const extra = document.getElementById('signup-extra');
            const submit = document.getElementById('auth-submit');
            const isLogin = title.innerText === 'Sign In';

            title.innerText = isLogin ? 'Create Account' : 'Sign In';
            extra.classList.toggle('hidden', !isLogin);
            submit.innerText = isLogin ? 'Register' : 'Login';
            switchBtn.innerText = isLogin ? 'Sign In' : 'Sign Up';
        };
    }

    // Auth Form
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const pass = document.getElementById('auth-password').value;
            const nameEl = document.getElementById('auth-name');
            const name = nameEl ? nameEl.value : '';
            const isLogin = document.getElementById('modal-title').innerText === 'Sign In';
            const submitBtn = document.getElementById('auth-submit');
            
            submitBtn.disabled = true;
            submitBtn.innerText = "Processing...";

            try {
                if (isLogin) {
                    await db.login(email, pass);
                } else {
                    await db.register({ email, password: pass, name });
                }
                document.getElementById('auth-modal').classList.add('hidden');
                await checkAuthSession();
            } catch (err) {
                alert("Error: " + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = isLogin ? "Login" : "Register";
            }
        };
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await db.logout();
            await checkAuthSession();
            showView('landing-view');
        };
    }

    // Booking
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.onsubmit = async (e) => {
            e.preventDefault();
            const user = await db.getCurrentUser();
            if (!user) {
                alert("Please login first to book an appointment.");
                showAuthModal('Sign In');
                return;
            }

            const submitBtn = e.target.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.innerText = "Booking...";

            const appt = {
                userId: user.id,
                doctorId: document.getElementById('booking-doctor').value,
                date: document.getElementById('booking-date').value,
                time: document.getElementById('booking-time').value
            };

            try {
                await db.addAppointment(appt);
                alert("Appointment booked successfully!");
                e.target.reset();
                showView('dashboard-view');
                await renderDashboard();
            } catch (err) {
                alert("Booking error: " + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "Book My Visit";
            }
        };
    }

    // Reports
    const uploadBox = document.getElementById('report-upload');
    const reportInput = document.getElementById('report-input');
    if (uploadBox && reportInput) {
        uploadBox.onclick = () => reportInput.click();
        reportInput.onchange = async (e) => {
            const file = e.target.files[0];
            const user = await db.getCurrentUser();
            if (file && user) {
                uploadBox.innerHTML = '<i>...</i><span>Uploading...</span>';
                await db.uploadReport(user.id, file);
                uploadBox.innerHTML = '<i data-lucide="upload-cloud"></i><span>Drop file or click to upload</span>';
                lucide.createIcons();
                await renderReports();
            }
        };
    }

    // Admin Filters
    const adminSearch = document.getElementById('admin-search');
    const statusFilter = document.getElementById('admin-status-filter');
    if (adminSearch) {
        adminSearch.oninput = (e) => {
            renderAdminDashboard(e.target.value, statusFilter.value);
        };
    }
    if (statusFilter) {
        statusFilter.onchange = (e) => {
            renderAdminDashboard(adminSearch.value, e.target.value);
        };
    }

    // Modals
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const closeBtn = document.querySelector('.close-modal');
    if (loginBtn) loginBtn.onclick = () => showAuthModal('Sign In');
    if (signupBtn) signupBtn.onclick = () => showAuthModal('Create Account');
    if (closeBtn) closeBtn.onclick = () => document.getElementById('auth-modal').classList.add('hidden');
};

const showAuthModal = (type) => {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        document.getElementById('modal-title').innerText = type;
        document.getElementById('signup-extra').classList.toggle('hidden', type === 'Sign In');
        document.getElementById('auth-submit').innerText = type === 'Sign In' ? 'Login' : 'Register';
        modal.classList.remove('hidden');
    }
};

window.scrollToSection = (id) => {
    showView('landing-view');
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
};
