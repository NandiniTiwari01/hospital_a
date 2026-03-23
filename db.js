import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    push, 
    get, 
    child, 
    update 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { 
    getStorage, 
    ref as storageRef, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// --- FIREBASE LIVE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyB1J9U6uQ5S9wq313fngTlYWgxegXAKPzQ",
  authDomain: "hospital-2b236.firebaseapp.com",
  projectId: "hospital-2b236",
  storageBucket: "hospital-2b236.firebasestorage.app",
  messagingSenderId: "686698882232",
  appId: "1:686698882232:web:70de59b7dcb245006d004d",
  measurementId: "G-P5J5KNW29J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

class HospitalDB {
    constructor() {}

    // --- Authentication ---
    async register(user) {
        try {
            const res = await createUserWithEmailAndPassword(auth, user.email, user.password);
            const newUser = {
                id: res.user.uid,
                name: user.name,
                email: user.email,
                role: 'patient'
            };
            await set(ref(rtdb, 'users/' + res.user.uid), newUser);
            return newUser;
        } catch (e) { throw e; }
    }

    async login(email, password) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return await this.getCurrentUser();
        } catch (e) { throw e; }
    }

    async getCurrentUser() {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (u) => {
                if (u) {
                    const snapshot = await get(child(ref(rtdb), `users/${u.uid}`));
                    resolve(snapshot.exists() ? snapshot.val() : null);
                } else {
                    resolve(null);
                }
                unsubscribe();
            });
        });
    }

    async logout() {
        await signOut(auth);
    }

    // --- Data Management ---
    async getDoctors() {
        const snapshot = await get(child(ref(rtdb), 'doctors'));
        if (!snapshot.exists()) {
            const seedData = {
                doc1: { id: 'doc1', name: 'Dr. Sarah Mitchell', specialty: 'Cardiology', image: 'assets/doctor_1_sarah.png', rating: 4.8 },
                doc2: { id: 'doc2', name: 'Dr. James Wilson', specialty: 'Neurology', image: 'assets/doctor_2_james.png', rating: 4.9 },
                doc3: { id: 'doc3', name: 'Dr. Emily Chen', specialty: 'Pediatrics', image: 'assets/doctor_3_emily.png', rating: 5.0 },
                doc4: { id: 'doc4', name: 'Dr. Michael Brown', specialty: 'Orthopedics', image: 'assets/doctor_2_james.png', rating: 4.7 }
            };
            await set(ref(rtdb, 'doctors'), seedData);
            return Object.values(seedData);
        }
        return Object.values(snapshot.val());
    }

    async addAppointment(appt) {
        appt.status = 'scheduled';
        appt.createdAt = new Date().toISOString();
        const newApptRef = push(ref(rtdb, 'appointments'));
        await set(newApptRef, appt);
        return { ...appt, id: newApptRef.key };
    }

    async getAppointments(userId) {
        const snapshot = await get(child(ref(rtdb), 'appointments'));
        if (!snapshot.exists()) return [];
        const data = snapshot.val();
        return Object.keys(data)
            .map(key => ({ ...data[key], id: key }))
            .filter(a => a.userId === userId);
    }

    async getAllAppointments() {
        const snapshot = await get(child(ref(rtdb), 'appointments'));
        const userSnap = await get(child(ref(rtdb), 'users'));
        const docSnap = await get(child(ref(rtdb), 'doctors'));
        
        if (!snapshot.exists()) return [];
        
        const apptsData = snapshot.val();
        const users = userSnap.val() || {};
        const doctors = docSnap.val() || {};

        return Object.keys(apptsData).map(key => {
            const a = apptsData[key];
            return {
                ...a,
                id: key,
                patientName: users[a.userId]?.name || 'Unknown',
                doctorName: doctors[a.doctorId]?.name || 'Unknown'
            };
        });
    }

    async updateAppointmentStatus(id, status) {
        const updates = {};
        updates[`/appointments/${id}/status`] = status;
        await update(ref(rtdb), updates);
    }

    async uploadReport(userId, file) {
        const path = `reports/${userId}/${Date.now()}_${file.name}`;
        const sRef = storageRef(storage, path);
        const res = await uploadBytes(sRef, file);
        const url = await getDownloadURL(res.ref);
        
        const reportDoc = {
            userId,
            fileName: file.name,
            url,
            date: new Date().toLocaleDateString()
        };
        const newReportRef = push(ref(rtdb, 'reports'));
        await set(newReportRef, reportDoc);
        return reportDoc;
    }

    async getReports(userId) {
        const snapshot = await get(child(ref(rtdb), 'reports'));
        if (!snapshot.exists()) return [];
        const data = snapshot.val();
        return Object.values(data).filter(r => r.userId === userId);
    }
}

export const db = new HospitalDB();
