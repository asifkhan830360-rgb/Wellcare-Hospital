// Doctors Database
const doctors = [
    { id: 1, name: "Dr. Rajesh Kumar", specialty: "Cardiologist", experience: "15 years", fee: 1200, avatar: "❤️" },
    { id: 2, name: "Dr. Priya Sharma", specialty: "Neurologist", experience: "12 years", fee: 1100, avatar: "🧠" },
    { id: 3, name: "Dr. Amit Patel", specialty: "Orthopedic", experience: "10 years", fee: 1000, avatar: "🦴" },
    { id: 4, name: "Dr. Sneha Reddy", specialty: "Pediatrician", experience: "8 years", fee: 900, avatar: "👶" },
    { id: 5, name: "Dr. Vikram Singh", specialty: "Dermatologist", experience: "9 years", fee: 950, avatar: "🧴" },
    { id: 6, name: "Dr. Neha Gupta", specialty: "Gynecologist", experience: "11 years", fee: 1100, avatar: "👩‍⚕️" }
];

// Patients Data (stored in localStorage)
let patients = JSON.parse(localStorage.getItem('wellcare_patients')) || [];
let appointments = JSON.parse(localStorage.getItem('wellcare_appointments')) || [];

// Display Doctors on Homepage
function displayDoctors() {
    const doctorGrid = document.getElementById('doctorGrid');
    if (doctorGrid) {
        doctorGrid.innerHTML = doctors.map(doc => `
            <div class="doctor-card">
                <div class="doctor-avatar">${doc.avatar}</div>
                <h3>${doc.name}</h3>
                <p class="doctor-specialty">${doc.specialty}</p>
                <p>⭐ ${doc.experience}</p>
                <p>💰 ₹${doc.fee}</p>
            </div>
        `).join('');
    }
}

// Load Doctors in Appointment Form Dropdown
function loadDoctorDropdown() {
    const doctorSelect = document.getElementById('doctorSelect');
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>';
        doctors.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${doc.name} - ${doc.specialty} (₹${doc.fee})`;
            doctorSelect.appendChild(option);
        });
    }
}

// Book Appointment
function bookAppointment(event) {
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
    if (!selectedDoctor) {
        showMessage('❌ Please select a valid doctor', 'error');
        return;
    }
    
    const appointmentId = Date.now();
    
    const appointment = {
        id: appointmentId,
        patientName: patientName,
        age: patientAge,
        gender: patientGender,
        doctorId: parseInt(doctorId),
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: date,
        time: time,
        symptoms: symptoms || 'No symptoms mentioned',
        status: 'Scheduled',
        fee: selectedDoctor.fee,
        billPaid: false,
        createdAt: new Date().toISOString()
    };
    
    appointments.push(appointment);
    localStorage.setItem('wellcare_appointments', JSON.stringify(appointments));
    
    // Add to patients record
    let existingPatient = patients.find(p => p.name === patientName);
    if (!existingPatient) {
        existingPatient = {
            id: Date.now(),
            name: patientName,
            age: patientAge,
            gender: patientGender,
            appointments: []
        };
        patients.push(existingPatient);
    }
    
    existingPatient.appointments = existingPatient.appointments || [];
    existingPatient.appointments.push({
        id: appointmentId,
        doctor: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: date,
        time: time,
        symptoms: symptoms || 'No symptoms mentioned',
        status: 'Scheduled',
        fee: selectedDoctor.fee
    });
    
    localStorage.setItem('wellcare_patients', JSON.stringify(patients));
    
    showMessage(`✅ Appointment confirmed! ${selectedDoctor.name} on ${date} at ${time}. Fee: ₹${selectedDoctor.fee}`, 'success');
    
    // Reset form
    document.getElementById('appointmentForm')?.reset();
    displayPatientRecords();
}

// Show Message
function showMessage(msg, type) {
    const msgDiv = document.getElementById('appointmentMessage');
    if (msgDiv) {
        msgDiv.innerHTML = `<div class="${type}" style="padding: 10px; background: ${type === 'success' ? '#d4edda' : '#f8d7da'}; color: ${type === 'success' ? '#155724' : '#721c24'}; border-radius: 8px;">${msg}</div>`;
        setTimeout(() => {
            msgDiv.innerHTML = '';
        }, 4000);
    }
}

// Display Patient Records
function displayPatientRecords() {
    const recordsDiv = document.getElementById('patientRecords');
    if (!recordsDiv) return;
    
    if (appointments.length === 0) {
        recordsDiv.innerHTML = '<p style="text-align: center;">📋 No appointments yet. Book your first appointment!</p>';
        return;
    }
    
    recordsDiv.innerHTML = appointments.map(apt => `
        <div class="record-item" style="border-bottom: 1px solid #ddd; padding: 15px; margin-bottom: 10px;">
            <div style="font-weight: bold; color: #2c5f8a;">👤 ${apt.patientName}</div>
            <div>👨‍⚕️ ${apt.doctorName} - ${apt.specialty}</div>
            <div>📅 ${apt.date} at ${apt.time}</div>
            <div>💊 Symptoms: ${apt.symptoms}</div>
            <div>💰 Bill: ₹${apt.fee} | ${apt.billPaid ? '✅ Paid' : '⏳ Pending'}</div>
        </div>
    `).join('');
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - Initializing...');
    displayDoctors();
    loadDoctorDropdown();
    displayPatientRecords();
    
    const form = document.getElementById('appointmentForm');
    if (form) {
        form.addEventListener('submit', bookAppointment);
        console.log('Form attached successfully');
    }
    
    // Debug: Check if doctors array is loaded
    console.log('Doctors loaded:', doctors.length);
});