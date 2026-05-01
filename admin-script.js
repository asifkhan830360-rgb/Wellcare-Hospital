// Admin Panel Functionality
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('.sidebar ul li').forEach(li => {
        li.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Refresh data when section changes
    if (sectionId === 'dashboard') loadAdminDashboard();
    if (sectionId === 'appointments') loadAllAppointments();
    if (sectionId === 'patients') loadAllPatients();
    if (sectionId === 'billing') loadBillingData();
    if (sectionId === 'doctors') loadDoctorsList();
}

function loadAdminDashboard() {
    const appointments = JSON.parse(localStorage.getItem('wellcare_appointments')) || [];
    const patients = JSON.parse(localStorage.getItem('wellcare_patients')) || [];
    
    const totalPatients = patients.length;
    const totalAppointments = appointments.length;
    const pendingBills = appointments.filter(a => !a.billPaid).length;
    const totalRevenue = appointments.filter(a => a.billPaid).reduce((sum, a) => sum + a.fee, 0);
    
    document.getElementById('totalPatients').innerHTML = `<h3>${totalPatients}</h3><p>Total Patients</p>`;
    document.getElementById('totalAppointments').innerHTML = `<h3>${totalAppointments}</h3><p>Appointments</p>`;
    document.getElementById('pendingBills').innerHTML = `<h3>${pendingBills}</h3><p>Pending Bills</p>`;
    document.getElementById('totalRevenue').innerHTML = `<h3>₹${totalRevenue}</h3><p>Total Revenue</p>`;
    
    const recent = appointments.slice(-5).reverse();
    const recentDiv = document.getElementById('recentAppointments');
    if (recentDiv) {
        recentDiv.innerHTML = recent.map(apt => `
            <div class="record-item">
                <strong>${apt.patientName}</strong> - Dr. ${apt.doctorName} on ${apt.date}
            </div>
        `).join('');
    }
}

function loadAllAppointments() {
    const appointments = JSON.parse(localStorage.getItem('wellcare_appointments')) || [];
    const tbody = document.getElementById('appointmentsList');
    if (tbody) {
        tbody.innerHTML = appointments.map(apt => `
            <tr>
                <td>${apt.patientName}</td>
                <td>Dr. ${apt.doctorName}</td>
                <td>${apt.date}</td>
                <td>${apt.time}</td>
                <td><span class="status ${apt.status}">${apt.status}</span></td>
                <td><button class="btn-danger" onclick="cancelAppointment(${apt.id})">Cancel</button></td>
            </tr>
        `).join('');
    }
}

function loadAllPatients() {
    const patients = JSON.parse(localStorage.getItem('wellcare_patients')) || [];
    const tbody = document.getElementById('patientsList');
    if (tbody) {
        tbody.innerHTML = patients.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.age}</td>
                <td>${p.gender}</td>
                <td>${p.appointments?.length || 0}</td>
            </tr>
        `).join('');
    }
}

function loadBillingData() {
    const appointments = JSON.parse(localStorage.getItem('wellcare_appointments')) || [];
    const tbody = document.getElementById('billingList');
    if (tbody) {
        tbody.innerHTML = appointments.map(apt => `
            <tr>
                <td>${apt.patientName}</td>
                <td>Dr. ${apt.doctorName}</td>
                <td>₹${apt.fee}</td>
                <td>${apt.billPaid ? '✅ Paid' : '⏳ Pending'}</td>
                <td>${!apt.billPaid ? `<button class="btn-success" onclick="markBillPaid(${apt.id})">Mark Paid</button>` : '-'}</td>
            </tr>
        `).join('');
    }
}

function loadDoctorsList() {
    const doctorsDiv = document.getElementById('doctorsAdminList');
    if (doctorsDiv) {
        doctorsDiv.innerHTML = `
            <div class="doctor-grid">
                ${doctors.map(doc => `
                    <div class="doctor-card">
                        <div class="doctor-avatar">${doc.avatar}</div>
                        <h3>${doc.name}</h3>
                        <p>${doc.specialty}</p>
                        <p>⭐ ${doc.experience}</p>
                        <p>💰 ₹${doc.fee}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function markBillPaid(id) {
    let appointments = JSON.parse(localStorage.getItem('wellcare_appointments')) || [];
    appointments = appointments.map(apt => 
        apt.id === id ? { ...apt, billPaid: true } : apt
    );
    localStorage.setItem('wellcare_appointments', JSON.stringify(appointments));
    loadBillingData();
    showMessage('Bill marked as paid!', 'success');
}

function cancelAppointment(id) {
    let appointments = JSON.parse(localStorage.getItem('wellcare_appointments')) || [];
    appointments = appointments.filter(apt => apt.id !== id);
    localStorage.setItem('wellcare_appointments', JSON.stringify(appointments));
    loadAllAppointments();
    loadAdminDashboard();
    showMessage('Appointment cancelled!', 'success');
}

function generateReport(type) {
    const appointments = JSON.parse(localStorage.getItem('wellcare_appointments')) || [];
    const output = document.getElementById('reportOutput');
    
    if (type === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        const todayApps = appointments.filter(a => a.date === today);
        output.innerHTML = `
            <h3>📅 Daily Report - ${today}</h3>
            <p>Total Appointments: ${todayApps.length}</p>
            <p>Total Revenue: ₹${todayApps.filter(a => a.billPaid).reduce((s, a) => s + a.fee, 0)}</p>
            <p>Pending Bills: ${todayApps.filter(a => !a.billPaid).length}</p>
        `;
    } else if (type === 'monthly') {
        const currentMonth = new Date().getMonth() + 1;
        const monthlyApps = appointments.filter(a => new Date(a.date).getMonth() + 1 === currentMonth);
        output.innerHTML = `
            <h3>📊 Monthly Report - Month ${currentMonth}</h3>
            <p>Total Appointments: ${monthlyApps.length}</p>
            <p>Total Revenue: ₹${monthlyApps.filter(a => a.billPaid).reduce((s, a) => s + a.fee, 0)}</p>
            <p>Total Patients: ${new Set(monthlyApps.map(a => a.patientName)).size}</p>
        `;
    } else if (type === 'doctor') {
        let doctorStats = {};
        appointments.forEach(a => {
            if (!doctorStats[a.doctorName]) doctorStats[a.doctorName] = { appointments: 0, revenue: 0 };
            doctorStats[a.doctorName].appointments++;
            if (a.billPaid) doctorStats[a.doctorName].revenue += a.fee;
        });
        output.innerHTML = `<h3>👨‍⚕️ Doctor-wise Report</h3>${Object.entries(doctorStats).map(([doc, stats]) => `
            <div class="record-item"><strong>${doc}</strong>: ${stats.appointments} appointments, ₹${stats.revenue} revenue</div>
        `).join('')}`;
    }
}

// Initial load when page opens
document.addEventListener('DOMContentLoaded', () => {
    loadAdminDashboard();
});