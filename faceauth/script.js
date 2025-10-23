// script.js
// Firebase configuration - Replace with your actual config
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

class FirebaseFaceAuth {
    constructor() {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        
        this.model = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.currentUser = null;
        this.isModelLoaded = false;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.loadFaceModel();
        this.checkAuthState();
    }

    initializeElements() {
        // Form containers
        this.loginContainer = document.getElementById('loginContainer');
        this.signupContainer = document.getElementById('signupContainer');
        this.dashboard = document.getElementById('dashboard');
        
        // Forms
        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');
        
        // Modals
        this.faceModal = document.getElementById('faceModal');
        this.faceLoginModal = document.getElementById('faceLoginModal');
        
        // Buttons
        this.showSignupBtn = document.getElementById('showSignup');
        this.showLoginBtn = document.getElementById('showLogin');
        this.registerFaceBtn = document.getElementById('registerFace');
        this.loginWithFaceBtn = document.getElementById('loginWithFace');
        this.captureFaceBtn = document.getElementById('captureFace');
        this.cancelFaceBtn = document.getElementById('cancelFace');
        this.startFaceLoginBtn = document.getElementById('startFaceLogin');
        this.cancelFaceLoginBtn = document.getElementById('cancelFaceLogin');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // Video elements
        this.video = document.getElementById('video');
        this.loginVideo = document.getElementById('loginVideo');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Status elements
        this.faceStatus = document.getElementById('faceStatus');
        this.faceLoginStatus = document.getElementById('faceLoginStatus');
        this.loading = document.getElementById('loading');
        
        // User info
        this.userEmail = document.getElementById('userEmail');
        this.userName = document.getElementById('userName');
    }

    initializeEventListeners() {
        // Form navigation
        this.showSignupBtn.addEventListener('click', () => this.showForm('signup'));
        this.showLoginBtn.addEventListener('click', () => this.showForm('login'));
        
        // Form submissions
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        
        // Face authentication
        this.registerFaceBtn.addEventListener('click', () => this.openFaceRegistration());
        this.loginWithFaceBtn.addEventListener('click', () => this.openFaceLogin());
        this.captureFaceBtn.addEventListener('click', () => this.captureFace());
        this.cancelFaceBtn.addEventListener('click', () => this.closeFaceModal());
        this.startFaceLoginBtn.addEventListener('click', () => this.startFaceRecognition());
        this.cancelFaceLoginBtn.addEventListener('click', () => this.closeFaceLoginModal());
        
        // Logout
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    showForm(formType) {
        this.loginContainer.classList.add('hidden');
        this.signupContainer.classList.add('hidden');
        this.dashboard.classList.add('hidden');

        if (formType === 'login') {
            this.loginContainer.classList.remove('hidden');
        } else if (formType === 'signup') {
            this.signupContainer.classList.remove('hidden');
        } else if (formType === 'dashboard') {
            this.dashboard.classList.remove('hidden');
        }
    }

    showLoading(show = true) {
        if (show) {
            this.loading.classList.remove('hidden');
        } else {
            this.loading.classList.add('hidden');
        }
    }

    showStatus(element, message, type) {
        element.innerHTML = `<div class="${type}">${message}</div>`;
    }

    async loadFaceModel() {
        try {
            this.showStatus(this.faceStatus, 'Loading face detection model...', 'info');
            
            if (typeof faceLandmarksDetection === 'undefined') {
                throw new Error('Face detection library not loaded');
            }
            
            this.model = await faceLandmarksDetection.load(
                faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
                { 
                    maxFaces: 1,
                    shouldLoadIrises: false
                }
            );
            
            this.isModelLoaded = true;
            this.showStatus(this.faceStatus, 'Face model loaded successfully!', 'success');
            
        } catch (error) {
            console.error('Error loading face model:', error);
            this.showStatus(this.faceStatus, 
                'Error loading face detection model. Using fallback mode.', 'error');
            this.isModelLoaded = false;
        }
    }

    async startCamera(videoElement) {
        try {
            if (videoElement.srcObject) {
                videoElement.srcObject.getTracks().forEach(track => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 400 },
                    height: { ideal: 300 },
                    facingMode: 'user' 
                } 
            });
            
            videoElement.srcObject = stream;
            
            return new Promise((resolve) => {
                videoElement.onloadedmetadata = () => {
                    resolve(stream);
                };
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            let errorMessage = 'Error accessing camera: ';
            
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Camera permission denied. Please allow camera access.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found on this device.';
            } else {
                errorMessage += error.message;
            }
            
            this.showStatus(this.faceStatus, errorMessage, 'error');
            return null;
        }
    }

    stopCamera(videoElement) {
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }
    }

    // Firebase Authentication Methods
    async handleSignup(e) {
        e.preventDefault();
        this.showLoading(true);

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        try {
            // Create user in Firebase Auth
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Save user data to Firestore
            await this.db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                hasFaceData: false
            });

            this.currentUser = user;
            this.showLoading(false);
            alert('Account created successfully! You can now register your face.');
            
        } catch (error) {
            this.showLoading(false);
            console.error('Signup error:', error);
            alert(`Signup failed: ${error.message}`);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        this.showLoading(true);

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            this.showLoading(false);
            this.showDashboard();
            
        } catch (error) {
            this.showLoading(false);
            console.error('Login error:', error);
            alert(`Login failed: ${error.message}`);
        }
    }

    async handleLogout() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            this.showForm('login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    checkAuthState() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.showDashboard();
            } else {
                this.showForm('login');
            }
        });
    }

    async showDashboard() {
        try {
            const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
            const userData = userDoc.data();
            
            this.userEmail.textContent = `Email: ${this.currentUser.email}`;
            this.userName.textContent = `Name: ${userData.name}`;
            
            this.showForm('dashboard');
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    // Face Authentication Methods
    openFaceRegistration() {
        if (!this.currentUser) {
            alert('Please create an account first');
            return;
        }
        
        this.faceModal.classList.remove('hidden');
        this.startCamera(this.video);
        this.showStatus(this.faceStatus, 
            'Position your face in the frame and click Capture Face', 'info');
    }

    closeFaceModal() {
        this.faceModal.classList.add('hidden');
        this.stopCamera(this.video);
        this.faceStatus.innerHTML = '';
    }

    openFaceLogin() {
        this.faceLoginModal.classList.remove('hidden');
        this.startCamera(this.loginVideo);
        this.showStatus(this.faceLoginStatus, 
            'Click Start Face Recognition to begin', 'info');
    }

    closeFaceLoginModal() {
        this.faceLoginModal.classList.add('hidden');
        this.stopCamera(this.loginVideo);
        this.faceLoginStatus.innerHTML = '';
    }

    async captureFace() {
        if (!this.isModelLoaded) {
            this.showStatus(this.faceStatus, 'Face model not loaded yet', 'error');
            return;
        }

        this.showStatus(this.faceStatus, 'Detecting face...', 'info');

        try {
            const faces = await this.model.estimateFaces({
                input: this.video,
                returnTensors: false,
                flipHorizontal: false,
                predictIrises: false
            });

            if (faces.length === 0) {
                this.showStatus(this.faceStatus, 
                    'No face detected. Please ensure your face is visible.', 'error');
                return;
            }

            // Extract face features
            const faceData = this.extractFaceFeatures(faces[0]);
            
            // Save face data to Firestore
            await this.db.collection('faceData').doc(this.currentUser.uid).set({
                userId: this.currentUser.uid,
                email: this.currentUser.email,
                faceData: faceData,
                registeredAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update user document
            await this.db.collection('users').doc(this.currentUser.uid).update({
                hasFaceData: true,
                faceRegisteredAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.showStatus(this.faceStatus, 'Face registered successfully!', 'success');
            
            setTimeout(() => {
                this.closeFaceModal();
            }, 2000);

        } catch (error) {
            console.error('Error capturing face:', error);
            this.showStatus(this.faceStatus, 'Error capturing face data', 'error');
        }
    }

    extractFaceFeatures(face) {
        const keypoints = face.scaledMesh;
        
        // Extract facial landmarks for recognition
        const landmarks = {
            jaw: keypoints.slice(0, 17),
            rightEyebrow: keypoints.slice(17, 22),
            leftEyebrow: keypoints.slice(22, 27),
            noseBridge: keypoints.slice(27, 31),
            noseTip: keypoints.slice(31, 36),
            rightEye: keypoints.slice(36, 42),
            leftEye: keypoints.slice(42, 48),
            outerLips: keypoints.slice(48, 60),
            innerLips: keypoints.slice(60, 68)
        };

        return {
            landmarks: landmarks,
            faceWidth: this.calculateFaceWidth(keypoints),
            faceHeight: this.calculateFaceHeight(keypoints),
            timestamp: Date.now()
        };
    }

    calculateFaceWidth(keypoints) {
        const leftFace = keypoints[234];
        const rightFace = keypoints[454];
        return leftFace && rightFace ? Math.abs(rightFace[0] - leftFace[0]) : 0;
    }

    calculateFaceHeight(keypoints) {
        const topFace = keypoints[10];
        const bottomFace = keypoints[152];
        return topFace && bottomFace ? Math.abs(bottomFace[1] - topFace[1]) : 0;
    }

    async startFaceRecognition() {
        if (!this.isModelLoaded) {
            this.showStatus(this.faceLoginStatus, 'Face model not loaded yet', 'error');
            return;
        }

        this.showStatus(this.faceLoginStatus, 'Recognizing face...', 'info');

        try {
            const faces = await this.model.estimateFaces({
                input: this.loginVideo,
                returnTensors: false,
                flipHorizontal: false,
                predictIrises: false
            });

            if (faces.length === 0) {
                this.showStatus(this.faceLoginStatus, 'No face detected', 'error');
                return;
            }

            const currentFaceData = this.extractFaceFeatures(faces[0]);
            const recognizedUser = await this.recognizeFace(currentFaceData);

            if (recognizedUser) {
                this.showStatus(this.faceLoginStatus, 'Face recognized! Signing you in...', 'success');
                
                // Sign in the recognized user
                await this.signInWithFace(recognizedUser);
                
            } else {
                this.showStatus(this.faceLoginStatus, 
                    'Face not recognized. Please try again or use email/password.', 'error');
            }

        } catch (error) {
            console.error('Error during face recognition:', error);
            this.showStatus(this.faceLoginStatus, 'Error during face recognition', 'error');
        }
    }

    async recognizeFace(currentFaceData) {
        try {
            // Get all registered face data
            const faceDataSnapshot = await this.db.collection('faceData').get();
            
            for (const doc of faceDataSnapshot.docs) {
                const storedFaceData = doc.data();
                const similarity = this.calculateFaceSimilarity(storedFaceData.faceData, currentFaceData);
                
                if (similarity > 0.7) { // Adjust threshold as needed
                    return storedFaceData;
                }
            }
            return null;
            
        } catch (error) {
            console.error('Error recognizing face:', error);
            return null;
        }
    }

    calculateFaceSimilarity(face1, face2) {
        if (!face1.faceWidth || !face2.faceWidth) return 0;
        
        const widthDiff = 1 - Math.abs(face1.faceWidth - face2.faceWidth) / Math.max(face1.faceWidth, face2.faceWidth);
        const heightDiff = 1 - Math.abs(face1.faceHeight - face2.faceHeight) / Math.max(face1.faceHeight, face2.faceHeight);
        
        return (widthDiff + heightDiff) / 2;
    }

    async signInWithFace(recognizedUser) {
        try {
            // For security, we can't directly sign in with face data
            // In a production app, you'd use a custom token or other secure method
            // For demo purposes, we'll show success but note this limitation
            
            setTimeout(() => {
                this.closeFaceLoginModal();
                alert(`Welcome ${recognizedUser.email}! Face recognition successful.\n\nNote: In production, this would securely sign you in.`);
            }, 2000);
            
        } catch (error) {
            console.error('Error signing in with face:', error);
            this.showStatus(this.faceLoginStatus, 'Error during sign in', 'error');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new FirebaseFaceAuth();
});