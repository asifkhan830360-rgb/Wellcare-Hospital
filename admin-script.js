// ==================== JSONBin.io Configuration ====================
const BIN_ID = "69f4fd69856a6821899659c1";
const API_KEY = "$2a$10$0vUEHFcuGWmANzLjdruSdukmz5u9/4TTxCqWZa8eU8v00u8Cz7zzy";

async function fetchData() {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
    });
    const data = await response.json();
    return data.record;
}

async function updateData(record) {
    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
        },
        body: JSON.stringify(record)
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (sectionId === 'dashboard') loadAdminDashboard();
    if (sectionId === 'appointments') loadAllAppointments();
    if (sectionId === 'billing') loadBillingData();
    if (sectionId === 'patients') loadAllPatients();
    if (sectionId === 'doctors') loadDoctorsList();
    if (sectionId === 'reports') loadReports();
}

async function loadAdminDashboard() {
    const record = await fetchData();
    const appointments = record.appointments || [];
    const patients = record.patients || [];
    
    document.getElementById('totalPatients').innerHTML = `<h3>${patients.length}</h3><p>Total Patients</p>`;
    document.getElementById('totalAppointments').innerHTML = `<h3>${appointments.length}</h3><p>Appointments</p>`;
    document.getElementById('pendingBills').innerHTML = `<h3>${appointments.filter(a => !a.billPaid).length}</h3><p>Pending Bills</p>`;
    document.getElementById('totalRevenue').innerHTML = `<h3>₹${appointments.filter(a => a.billPaid).reduce((s, a) => s + a.fee, 0)}</h3><p>Total Revenue</p>`;
    
    const recent = appointments.slice(-5).reverse();
    const recentDiv = document.getElementById('recentAppointments');
    if (recentDiv) {
        recentDiv.innerHTML = recent.map(apt => `
            <div class="record-item"><strong>${apt.patientName}</strong> - Dr. ${apt.doctorName} on ${apt.date}</div>
        `).join('');
    }
}

async function loadAllAppointments() {
    const record = await fetchData();
    const appointments = record.appointments || [];
    const tbody = document.getElementById('appointmentsList');
    if (tbody) {
        tbody.innerHTML = appointments.map(apt => `
            <tr>
                <td>${apt.patientName}</td>
                <td>Dr. ${apt.doctorName}</td>
                <td>${apt.date}</td>
                <td>${apt.time}</td>
                <td>${apt.billPaid ? '✅ Paid' : '⏳ Pending'}</td>
                <td><button class="btn-danger" onclick="cancelAppointment(${apt.id})">Cancel</button></td>
            </tr>
        `).join('');
    }
}

async function loadAllPatients() {
    const record = await fetchData();
    const patients = record.patients || [];
    const tbody = document.getElementById('patientsList');
    if (tbody) {
        tbody.innerHTML = patients.map(p => `
            <tr>
                <td>${p.id || p.name}</td>
                <td>${p.name}</td>
                <td>${p.age || '-'}</td>
                <td>${p.gender || '-'}</td>
                <td>${p.appointments?.length || 0}</td>
            </tr>
        `).join('');
    }
}

async function loadBillingData() {
    const record = await fetchData();
    const appointments = record.appointments || [];
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
    fetchData().then(record => {
        const doctors = record.doctors || [];
        const doctorsDiv = document.getElementById('doctorsAdminList');
        if (doctorsDiv) {
            doctorsDiv.innerHTML = `
                <div class="doctor-grid">
                    ${doctors.map(doc => `
                        <div class="doctor-card">
                            <div class="doctor-avatar">${doc.avatar || '👨‍⚕️'}</div>
                            <h3>${doc.name}</h3>
                            <p>${doc.specialty}</p>
                            <p>⭐ ${doc.experience}</p>
                            <p>💰 ₹${doc.fee}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    });
}

async function markBillPaid(id) {
    const record = await fetchData();
    const appointments = record.appointments.map(apt => 
        apt.id === id ? { ...apt, billPaid: true } : apt
    );
    await updateData({ ...record, appointments });
    loadBillingData();
    loadAdminDashboard();
}

async function cancelAppointment(id) {
    const record = await fetchData();
    const appointments = record.appointments.filter(apt => apt.id !== id);
    await updateData({ ...record, appointments });
    loadAllAppointments();
    loadAdminDashboard();
}

async function generateReport(type) {
    const record = await fetchData();
    const appointments = record.appointments || [];
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

function loadReports() {
    document.getElementById('reportOutput').innerHTML = '<p>Click on any report to generate</p>';
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin-login.html';
}

// Load dashboard when page opens
if (document.getElementById('totalPatients')) {
    loadAdminDashboard();
}
