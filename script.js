// ==================== JSONBin.io Configuration ====================
const BIN_ID = "69f4fd69856a6821899659c1";
const API_KEY = "$2a$10$0vUEHFcuGWmANzLjdruSdukmz5u9/4TTxCqWZa8eU8v00u8Cz7zzy";

// ==================== Global Variables ====================
let doctors = [];
let appointments = [];

// ==================== Helper Functions ====================
async function fetchData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        const data = await response.json();
        doctors = data.record.doctors;
        appointments = data.record.appointments || [];
        return data.record;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function updateData(record) {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(record)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating data:', error);
        return null;
    }
}

// ==================== Display Doctors ====================
function displayDoctors() {
    const doctorGrid = document.getElementById('doctorGrid');
    if (!doctorGrid) return;
    
    doctorGrid.innerHTML = doctors.map(doc => `
        <div class="doctor-card">
            <div class="doctor-avatar">${doc.avatar}</div>
            <h3>${doc.name}</h3>
            <p class="doctor-specialty">${doc.specialty}</p>
            <p>⭐ ${doc.experience}</p>
            <p>💰 ₹${doc.fee}</p>
        </div>
    `).join('');
    
    const doctorSelect = document.getElementById('doctorSelect');
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' +
            doctors.map(doc => `<option value="${doc.id}">${doc.name} - ${doc.specialty} (₹${doc.fee})</option>`).join('');
    }
}

// ==================== Book Appointment ====================
async function bookAppointment(event) {
    event.preventDefault();
    
    const patientName = document.getElementById('patientName')?.value;
    const patientAge = document.getElementById('patientAge')?.value;
    const patientGender = document.getElementById('patientGender')?.value;
    const doctorId = document.getElementById('doctorSelect')?.value;
    const date = document.getElementById('appointmentDate')?.value;
    const time = document.getElementById('appointmentTime')?.value;
    const symptoms = document.getElementById('symptoms')?.value;
    
    if (!patientName || !doctorId || !date || !time) {
        showMessage('⚠️ Please fill all required fields!', 'error');
        return;
    }
    
    const selectedDoctor = doctors.find(d => d.id == doctorId);
    
    const newAppointment = {
        id: Date.now(),
        patientName,
        patientAge,
        patientGender,
        doctorId: parseInt(doctorId),
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date,
        time,
        symptoms: symptoms || 'No symptoms mentioned',
        fee: selectedDoctor.fee,
        billPaid: false,
        status: 'Scheduled',
        createdAt: new Date().toISOString()
    };
    
    const record = await fetchData();
    if (record) {
        const updatedAppointments = [...(record.appointments || []), newAppointment];
        const updatedRecord = {
            doctors: doctors,
            appointments: updatedAppointments,
            patients: record.patients || []
        };
        
        await updateData(updatedRecord);
        await fetchData();
        
        showMessage(`✅ Appointment booked with ${selectedDoctor.name} on ${date} at ${time}. Fee: ₹${selectedDoctor.fee}`, 'success');
        document.getElementById('appointmentForm')?.reset();
        displayPatientRecords();
    }
}

// ==================== Display Patient Records ====================
async function displayPatientRecords() {
    const recordsDiv = document.getElementById('patientRecords');
    if (!recordsDiv) return;
    
    const record = await fetchData();
    const allAppointments = record?.appointments || [];
    
    if (allAppointments.length === 0) {
        recordsDiv.innerHTML = '<p style="text-align: center;">📋 No appointments yet. Book your first appointment!</p>';
        return;
    }
    
    recordsDiv.innerHTML = allAppointments.slice().reverse().map(apt => `
        <div class="record-item" style="border-bottom: 1px solid #ddd; padding: 15px; margin-bottom: 10px;">
            <div style="font-weight: bold; color: #2c5f8a;">👤 ${apt.patientName}</div>
            <div>👨‍⚕️ ${apt.doctorName} - ${apt.specialty}</div>
            <div>📅 ${apt.date} at ${apt.time}</div>
            <div>💊 Symptoms: ${apt.symptoms}</div>
            <div>💰 Bill: ₹${apt.fee} | ${apt.billPaid ? '✅ Paid' : '⏳ Pending'}</div>
        </div>
    `).join('');
}

// ==================== Show Message ====================
function showMessage(msg, type) {
    const msgDiv = document.getElementById('appointmentMessage');
    if (msgDiv) {
        msgDiv.innerHTML = `<div class="${type}" style="padding: 10px; background: ${type === 'success' ? '#d4edda' : '#f8d7da'}; color: ${type === 'success' ? '#155724' : '#721c24'}; border-radius: 8px;">${msg}</div>`;
        setTimeout(() => {
            msgDiv.innerHTML = '';
        }, 4000);
    }
}

// ==================== Initialize ====================
async function init() {
    await fetchData();
    displayDoctors();
    await displayPatientRecords();
    
    const form = document.getElementById('appointmentForm');
    if (form) {
        form.addEventListener('submit', bookAppointment);
    }
}

// Start the app
init();
