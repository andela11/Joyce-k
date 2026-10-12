import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Upload,
  Camera,
  ShieldAlert,
  Globe2,
  Briefcase,
  Heart,
  Phone,
} from 'lucide-react';
import { AuthUser, UserProfile, RelationshipGoal } from '../types';
import { JoyceKLogo } from './JoyceKLogo';
import { PRESET_CITIES } from '../utils/geoUtils';
import { detectCountryFromPhoneNumber, COUNTRY_PHONE_DATABASE } from '../utils/phoneCountryUtils';
import { getApiUrl } from '../utils/api';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  updateProfile,
  sendPasswordResetEmail,
  doc,
  setDoc,
  getDoc,
  signOut,
} from '../lib/firebase';
import {
  createDedicatedUserProfile,
  fetchUserProfile,
  persistUserProfile,
  clearGuestCachedData,
  generateUniqueUidFromEmail,
  getScopedKey,
  GENDER_DEFAULT_AVATARS,
  checkIsAdmin,
} from '../utils/userUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, fullProfile?: UserProfile) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const sanitizeMode = (m?: any): 'login' | 'signup' | 'forgot' => {
    if (m === 'signup' || m === 'forgot' || m === 'login') return m;
    return 'login';
  };

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(() => sanitizeMode(initialMode));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'femme' | 'homme' | 'non-binaire'>('homme');
  const [interestedIn, setInterestedIn] = useState<'femme' | 'homme' | 'tous'>('femme');
  const [occupation, setOccupation] = useState('');
  const [relationshipGoal, setRelationshipGoal] = useState<RelationshipGoal>('Relation sérieuse');
  const [selectedCityName, setSelectedCityName] = useState('Paris');
  const [phoneNumber, setPhoneNumber] = useState('+237 6 99 88 77 66');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Photo Upload & AI Verification State
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [isVerifyingPhoto, setIsVerifyingPhoto] = useState(false);
  const [photoStatus, setPhotoStatus] = useState<'idle' | 'verifying' | 'valid' | 'ai_rejected'>('idle');
  const [photoRejectionReason, setPhotoRejectionReason] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setMode(sanitizeMode(initialMode));
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleVerifyImage = async (base64String: string, fileName: string) => {
    setIsVerifyingPhoto(true);
    setPhotoStatus('verifying');
    setPhotoRejectionReason(null);
    setError(null);

    try {
      const res = await fetch(getApiUrl('/api/images/verify-authenticity'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64String,
          fileName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isAiGenerated === true || data.allowed === false) {
          // AI DETECTED -> ACCESS REFUSED
          setPhotoStatus('ai_rejected');
          const reason =
            data.reason ||
            "Ce genre d'image générée par intelligence artificielle n'est pas autorisée sur Joyce-K. Nous exigeons des photos réelles et authentiques.";
          setPhotoRejectionReason(reason);
          setError(`Accès refusé : ${reason}`);
          return;
        }
      } else {
        setPhotoStatus('ai_rejected');
        const reason = "Impossible de vérifier la conformité de la photo (erreur serveur). Veuillez réessayer.";
        setPhotoRejectionReason(reason);
        setError(reason);
        return;
      }

      // Valid real human photo
      setPhotoStatus('valid');
      setPhotoDataUrl(base64String);
      setPhotoFileName(fileName);
    } catch (err) {
      console.warn('Image verification error:', err);
      setPhotoStatus('ai_rejected');
      const reason = "Impossible de vérifier l'authenticité de la photo (erreur de connexion). Veuillez réessayer.";
      setPhotoRejectionReason(reason);
      setError(reason);
    } finally {
      setIsVerifyingPhoto(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleVerifyImage(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez déposer un fichier image valide.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleVerifyImage(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    clearGuestCachedData();
    try {
      // 1. Authenticate with real Firebase Auth Popup
      let fbUser;
      try {
        const result = await signInWithPopup(auth, googleProvider);
        fbUser = result.user;
      } catch (authErr: any) {
        console.warn('Firebase popup error:', authErr);
        if (authErr.code === 'auth/popup-closed-by-user') {
          setError('Connexion Google annulée par l’utilisateur.');
          setIsLoading(false);
          return;
        }
        if (authErr.code === 'auth/unauthorized-domain') {
          setError(
            'Ce domaine (Vercel) doit être ajouté dans Firebase Console > Authentification > Domaines autorisés. Vous pouvez vous connecter immédiatement avec votre e-mail ci-dessous.'
          );
          setIsLoading(false);
          return;
        }
        if (authErr.code === 'auth/popup-blocked') {
          setError(
            'La fenêtre popup a été bloquée par votre navigateur. Autorisez les popups ou utilisez votre e-mail.'
          );
          setIsLoading(false);
          return;
        }
        setError('Connexion Google indisponible sur ce domaine. Veuillez vous connecter avec votre adresse e-mail ci-dessous.');
        setIsLoading(false);
        return;
      }

      if (!fbUser) {
        setError('Aucun compte Google détecté.');
        setIsLoading(false);
        return;
      }

      const uid = fbUser.uid;
      const userEmail = fbUser.email || '';
      const rawName = fbUser.displayName || userEmail.split('@')[0] || 'Membre Joyce-K';
      const userPhoto = fbUser.photoURL || photoDataUrl || GENDER_DEFAULT_AVATARS[gender] || GENDER_DEFAULT_AVATARS.homme;

      const isAdmin = checkIsAdmin(userEmail);

      const authData: AuthUser = {
        id: uid,
        email: userEmail,
        name: isAdmin ? `${rawName} (Admin)` : rawName,
        photoUrl: userPhoto,
        provider: 'google',
        isLoggedIn: true,
        isAdmin,
        createdAt: new Date().toISOString(),
      };

      // Load existing profile or create a fresh dedicated one
      let fullProfile = await fetchUserProfile(uid);
      if (!fullProfile) {
        const selectedCityObj = PRESET_CITIES.find((c) => c.name === selectedCityName) || PRESET_CITIES[0];
        fullProfile = createDedicatedUserProfile(authData, {
          name: rawName,
          gender,
          age,
          city: `${selectedCityObj.name}, ${selectedCityObj.country}`,
          lat: selectedCityObj.lat,
          lng: selectedCityObj.lng,
          photos: [userPhoto],
        });
        await persistUserProfile(fullProfile);
      }

      onLoginSuccess(authData, fullProfile);
      onClose();
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Erreur lors de la connexion Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Veuillez entrer une adresse e-mail valide.');
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        setSuccessMsg(`Un lien de réinitialisation sécurisé a été envoyé à ${cleanEmail}. Vérifiez votre boîte mail.`);
      } catch (resetErr: any) {
        console.warn('Firebase reset password notice:', resetErr);
        if (resetErr.code === 'auth/user-not-found') {
          setError('Aucun compte enregistré avec cette adresse e-mail.');
        } else if (resetErr.code === 'auth/invalid-email') {
          setError('Format d’adresse e-mail invalide.');
        } else {
          setSuccessMsg(`Un e-mail de réinitialisation a été préparé pour ${cleanEmail}. Vous pouvez également définir un nouveau mot de passe lors de votre prochaine connexion.`);
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Veuillez renseigner votre prénom.');
        return;
      }

      // Check photo verification status
      if (photoStatus === 'ai_rejected') {
        setError("Accès refusé : Ce genre d'image générée par intelligence artificielle n'est pas autorisée sur Joyce-K. Veuillez téléverser une photo réelle.");
        return;
      }
    }

    setIsLoading(true);
    clearGuestCachedData();
    try {
      const selectedCityObj = PRESET_CITIES.find((c) => c.name === selectedCityName) || PRESET_CITIES[0];
      const parsedInterestedIn: ('femme' | 'homme' | 'non-binaire')[] =
        interestedIn === 'tous'
          ? ['femme', 'homme', 'non-binaire']
          : [interestedIn];

      let uid = '';
      let userName = name.trim() || cleanEmail.split('@')[0];
      let userPhoto = photoDataUrl || GENDER_DEFAULT_AVATARS[gender] || GENDER_DEFAULT_AVATARS.homme;

      let fullProfile: UserProfile | null = null;

      if (mode === 'signup') {
        // Sign out any active session before creating a fresh user
        if (auth.currentUser) {
          try {
            await signOut(auth);
          } catch {
            // ignore
          }
        }

        // Real Firebase User Registration
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          uid = userCredential.user.uid;

          // Update Firebase Auth internal profile display name and photo
          try {
            await updateProfile(userCredential.user, {
              displayName: userName,
              photoURL: userPhoto,
            });
          } catch (pErr) {
            console.warn('Firebase profile update warning:', pErr);
          }
        } catch (fbAuthErr: any) {
          console.error('Firebase signup error:', fbAuthErr);
          if (fbAuthErr.code === 'auth/email-already-in-use') {
            setError('Cette adresse e-mail est déjà inscrite. Cliquez sur "Se connecter" pour accéder à votre compte.');
          } else if (fbAuthErr.code === 'auth/weak-password') {
            setError('Mot de passe trop faible. Utilisez au moins 6 caractères.');
          } else if (fbAuthErr.code === 'auth/invalid-email') {
            setError("Format d'adresse e-mail invalide. Exemple : prenom.nom@gmail.com");
          } else if (fbAuthErr.code === 'auth/operation-not-allowed') {
            setError("L'inscription par e-mail n'est pas activée sur le projet Firebase.");
          } else {
            setError(fbAuthErr.message || "Erreur lors de la création du compte.");
          }
          setIsLoading(false);
          return;
        }

        const isAdmin = checkIsAdmin(cleanEmail);

        const authUser: AuthUser = {
          id: uid,
          email: cleanEmail,
          name: isAdmin ? `${userName} (Admin)` : userName,
          photoUrl: userPhoto,
          provider: 'email',
          isLoggedIn: true,
          isAdmin,
          createdAt: new Date().toISOString(),
        };

        const detectedSignupCountry = detectCountryFromPhoneNumber(phoneNumber);

        // Create dedicated user profile with their exact personal data
        fullProfile = createDedicatedUserProfile(authUser, {
          name: userName,
          age,
          gender,
          interestedIn: parsedInterestedIn,
          occupation: occupation.trim() || 'Membre Joyce-K',
          relationshipGoal,
          city: `${selectedCityObj.name}, ${selectedCityObj.country}`,
          lat: selectedCityObj.lat,
          lng: selectedCityObj.lng,
          phoneNumber: phoneNumber.trim() || '+237 6 99 88 77 66',
          country: detectedSignupCountry.name,
          photos: [userPhoto],
          bio: `Bonjour, je m'appelle ${userName} et je réside à ${selectedCityObj.name}. Heureux(se) d'être sur Joyce-K pour faire de belles rencontres authentiques.`,
        });

        // Initialize fresh empty scoped storage for this brand new user
        localStorage.setItem(getScopedKey(uid, 'profile'), JSON.stringify(fullProfile));
        localStorage.setItem('amour_affinites_auth', JSON.stringify(authUser));
        localStorage.removeItem(getScopedKey(uid, 'convs'));
        localStorage.removeItem(getScopedKey(uid, 'messages'));
        localStorage.removeItem(getScopedKey(uid, 'favorites'));
        localStorage.removeItem(getScopedKey(uid, 'liked'));
        localStorage.removeItem(getScopedKey(uid, 'passed'));

        await persistUserProfile(fullProfile);

        onLoginSuccess(authUser, fullProfile);
        onClose();
      } else {
        // Strict Real Firebase Sign In with Password Verification
        try {
          const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
          uid = userCredential.user.uid;
        } catch (fbSignInErr: any) {
          console.error('Firebase signin error:', fbSignInErr);
          if (
            fbSignInErr.code === 'auth/wrong-password' ||
            fbSignInErr.code === 'auth/invalid-credential' ||
            fbSignInErr.code === 'auth/invalid-login-credentials'
          ) {
            setError('Mot de passe incorrect ou identifiants invalides. Veuillez vérifier vos accès.');
          } else if (fbSignInErr.code === 'auth/user-not-found') {
            setError("Aucun compte n'existe avec cette adresse e-mail. Veuillez d'abord vous inscrire.");
          } else if (fbSignInErr.code === 'auth/user-disabled') {
            setError('Ce compte utilisateur a été suspendu.');
          } else if (fbSignInErr.code === 'auth/too-many-requests') {
            setError('Trop de tentatives échouées. Veuillez patienter ou réinitialiser votre mot de passe.');
          } else if (fbSignInErr.code === 'auth/invalid-email') {
            setError("Format d'adresse e-mail invalide.");
          } else {
            setError(fbSignInErr.message || 'Identifiants incorrects. Connexion impossible.');
          }
          setIsLoading(false);
          return;
        }

        // Fetch their profile from Firestore / LocalStorage
        fullProfile = await fetchUserProfile(uid);

        const isAdmin = checkIsAdmin(cleanEmail);
        const resolvedName = fullProfile?.name || cleanEmail.split('@')[0];
        const resolvedPhoto = fullProfile?.photos?.[0] || userPhoto;

        const authUser: AuthUser = {
          id: uid,
          email: cleanEmail,
          name: isAdmin ? `${resolvedName} (Admin)` : resolvedName,
          photoUrl: resolvedPhoto,
          provider: 'email',
          isLoggedIn: true,
          isAdmin,
          createdAt: new Date().toISOString(),
        };

        if (!fullProfile) {
          fullProfile = createDedicatedUserProfile(authUser, {
            name: resolvedName,
            age: 28,
            gender: 'homme',
            photos: [resolvedPhoto],
            city: `${selectedCityObj.name}, ${selectedCityObj.country}`,
            lat: selectedCityObj.lat,
            lng: selectedCityObj.lng,
          });
          await persistUserProfile(fullProfile);
        }

        onLoginSuccess(authUser, fullProfile);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err?.message || "Une erreur inattendue est survenue lors de l'authentification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 bg-slate-950/60 backdrop-blur-xs animate-fade-in flex flex-col justify-start sm:justify-center items-center"
    >
      <div
        id="auth-modal-container"
        className={`relative w-full ${
          mode === 'signup' ? 'max-w-4xl lg:max-w-5xl' : 'max-w-md'
        } bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl text-slate-800 my-auto max-h-[94vh] overflow-y-auto transition-all duration-300`}
      >
        {/* Top Header Controls: Back & Close */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <button
            id="auth-modal-back-btn"
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Revenir à l'accueil"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Retour à l'accueil</span>
          </button>

          <button
            id="close-auth-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Logo & Title */}
        <div className="text-center relative z-10 space-y-1.5 mb-5 pt-1">
          <div className="flex justify-center mb-1">
            <JoyceKLogo size={mode === 'signup' ? 'md' : 'lg'} variant="light-bg" showTagline={true} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
            {mode === 'login' && 'Connexion à votre compte'}
            {mode === 'signup' && 'Créer votre compte'}
            {mode === 'forgot' && 'Réinitialiser votre mot de passe'}
          </h2>
          <p className="text-xs text-slate-500 font-normal font-sans max-w-lg mx-auto">
            {mode === 'login' && 'Retrouvez vos affinités réelles, vos messages et votre radar.'}
            {mode === 'signup' && 'Rejoignez une communauté de célibataires réels et certifiés sans faux profils.'}
            {mode === 'forgot' && 'Entrez votre adresse e-mail pour recevoir les instructions.'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        {mode !== 'forgot' && (
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 relative z-10 max-w-xs mx-auto">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Se Connecter
            </button>
            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              S'inscrire
            </button>
          </div>
        )}

        {/* AI Photo Rejection Banner */}
        {photoStatus === 'ai_rejected' && (
          <div
            id="ai-photo-rejection-banner"
            className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-rose-50 text-rose-800 text-xs font-semibold flex items-start gap-2.5 shadow-xs"
          >
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-700 text-sm">Accès Refusé : Image IA Détectée</p>
              <p className="mt-0.5 text-slate-700">
                {photoRejectionReason || "Ce genre d'image générée par intelligence artificielle n'est pas autorisée sur Joyce-K. Nous exigeons des photos réelles et authentiques."}
              </p>
            </div>
          </div>
        )}

        {/* Generic Error / Success Alert */}
        {error && photoStatus !== 'ai_rejected' && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 flex flex-col gap-2 text-xs font-semibold text-rose-700 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            {mode === 'signup' && (error.includes('déjà inscrite') || error.includes('connecter')) && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="self-start mt-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-100 hover:bg-rose-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                👉 Se connecter avec cet e-mail
              </button>
            )}
            {mode === 'login' && (error.includes('Aucun compte') || error.includes("S'inscrire")) && (
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="self-start mt-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-100 hover:bg-rose-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                👉 Créer mon compte maintenant
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 flex items-center gap-2 text-xs font-semibold text-emerald-700 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleEmailAuth} className="relative z-10">
          {mode === 'signup' ? (
            /* MODE PAYSAGE : 2 BALANCED HORIZONTAL COLUMNS */
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* COLONNE GAUCHE (Photo & Identité) */}
                <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-3xl shadow-xs">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <Camera className="w-4 h-4" /> 1. Photo & Identité
                    </span>
                    <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      Anti-IA Garanti
                    </span>
                  </div>

                  {/* Photo Dropzone */}
                  <div
                    id="signup-photo-dropzone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      photoStatus === 'ai_rejected'
                        ? 'bg-rose-100/70'
                        : photoStatus === 'valid'
                        ? 'bg-emerald-50 shadow-xs'
                        : 'bg-white hover:bg-rose-50/40 shadow-xs'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {isVerifyingPhoto ? (
                      <div className="py-3 flex flex-col items-center gap-2 text-slate-700">
                        <RefreshCw className="w-6 h-6 text-rose-600 animate-spin" />
                        <p className="text-xs font-bold text-rose-700">
                          Analyse de l'image & détection IA en cours...
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Vérification de l'authenticité de votre photo
                        </p>
                      </div>
                    ) : photoDataUrl && photoStatus === 'valid' ? (
                      <div className="flex items-center gap-3 text-left">
                        <img
                          src={photoDataUrl}
                          alt="Aperçu"
                          className="w-14 h-14 rounded-2xl object-cover shadow-sm shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>Photo réelle validée ✓</span>
                          </div>
                          <p className="text-[11px] text-slate-600 truncate mt-0.5">
                            {photoFileName || 'Image certifiée authentique'}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="text-[11px] text-rose-600 hover:underline mt-1 font-semibold block cursor-pointer"
                          >
                            Changer la photo
                          </button>
                        </div>
                      </div>
                    ) : photoStatus === 'ai_rejected' ? (
                      <div className="py-2 flex flex-col items-center gap-1 text-rose-700">
                        <ShieldAlert className="w-8 h-8 text-rose-600" />
                        <p className="text-xs font-bold text-rose-700">
                          Image non autorisée (IA Détectée)
                        </p>
                        <p className="text-[11px] text-slate-600">
                          Cliquez ici pour sélectionner une vraie photo
                        </p>
                      </div>
                    ) : (
                      <div className="py-2.5 flex flex-col items-center gap-1.5 text-slate-500">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shadow-2xs">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Photo de profil réelle (Obligatoire)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Glissez-déposez ou cliquez pour parcourir
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Prénom */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Votre Prénom
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="signup-name-input"
                        type="text"
                        required
                        placeholder="Ex: Alexandre, Sarah, Aïcha..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition-colors"
                      />
                    </div>
                  </div>

                  {/* Âge & Genre */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Âge
                      </label>
                      <input
                        id="signup-age-input"
                        type="number"
                        min={18}
                        max={99}
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Genre
                      </label>
                      <select
                        id="signup-gender-select"
                        value={gender}
                        onChange={(e) => {
                          const g = e.target.value as 'homme' | 'femme' | 'non-binaire';
                          setGender(g);
                          if (g === 'homme') {
                            setInterestedIn('femme');
                          } else if (g === 'femme') {
                            setInterestedIn('homme');
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition-colors"
                      >
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                        <option value="non-binaire">Non-binaire</option>
                      </select>
                    </div>
                  </div>

                  {/* Téléphone & Pays */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Numéro de Téléphone</span>
                      </label>
                      {(() => {
                        const c = detectCountryFromPhoneNumber(phoneNumber);
                        return (
                          <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </span>
                        );
                      })()}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rose-600 font-bold text-xs">
                        <span>{detectCountryFromPhoneNumber(phoneNumber).flag}</span>
                      </div>
                      <input
                        id="signup-phone-input"
                        type="text"
                        placeholder="Ex: +237 6 99 88 77 66 ou +33 6..."
                        value={phoneNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhoneNumber(val);
                          const c = detectCountryFromPhoneNumber(val);
                          const matchedCity = PRESET_CITIES.find(
                            (city) => city.country.toLowerCase() === c.name.toLowerCase()
                          );
                          if (matchedCity) {
                            setSelectedCityName(matchedCity.name);
                          }
                        }}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* COLONNE DROITE (Localisation, Préférences & Identifiants) */}
                <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-3xl shadow-xs">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <Globe2 className="w-4 h-4" /> 2. Préférences & Compte
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-2xs">
                      Radar Mondial
                    </span>
                  </div>

                  {/* Ville Mondiale */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Ville & Région</span>
                    </label>
                    <select
                      id="signup-city-select"
                      value={selectedCityName}
                      onChange={(e) => setSelectedCityName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition-colors"
                    >
                      {PRESET_CITIES.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.flag} {city.name}, {city.country} ({city.region})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Recherche & Profession */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Je cherche</span>
                      </label>
                      <select
                        id="signup-interested-select"
                        value={interestedIn}
                        onChange={(e) => setInterestedIn(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition-colors"
                      >
                        <option value="femme">Femmes</option>
                        <option value="homme">Hommes</option>
                        <option value="tous">Tous</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Métier</span>
                      </label>
                      <input
                        id="signup-occupation-input"
                        type="text"
                        placeholder="Ex: Architecte, Ingénieur..."
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition-colors"
                      />
                    </div>
                  </div>

                  {/* Objectif */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Objectif relationnel
                    </label>
                    <select
                      id="signup-goal-select"
                      value={relationshipGoal}
                      onChange={(e) => setRelationshipGoal(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition-colors"
                    >
                      <option value="Relation sérieuse">Relation sérieuse</option>
                      <option value="Rencontres & Découverte">Rencontres & Découverte</option>
                      <option value="Coup de foudre">Coup de foudre</option>
                      <option value="Amitié & Plus si affinités">Amitié & Plus si affinités</option>
                    </select>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Adresse e-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="auth-email-input"
                        type="email"
                        required
                        placeholder="nom@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition-colors"
                      />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="auth-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Au moins 6 caractères"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar in Landscape */}
              <div className="pt-2 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    id="auth-submit-btn"
                    type="submit"
                    disabled={isLoading || isVerifyingPhoto || photoStatus === 'ai_rejected'}
                    className="flex-1 w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-300/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Création de votre compte...</span>
                      </>
                    ) : (
                      <>
                        <span>Créer mon profil certifié</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    id="google-signup-landscape-btn"
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full sm:w-auto min-h-[48px] py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Annuler et revenir à l'accueil
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* MODE CONNEXION / OUBLI : COMPACT CARD */
            <div className="space-y-3.5">
              {/* Google Button */}
              {mode === 'login' && (
                <div className="space-y-3 mb-2">
                  <button
                    id="google-login-btn"
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full min-h-[44px] py-2.5 sm:py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/70 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuer avec Google</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      ou par e-mail
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                </div>
              )}

              {/* Email input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition-colors"
                  />
                </div>
              </div>

              {/* Password input */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="auth-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Au moins 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember me (login mode) */}
              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-100"
                    />
                    <span className="text-slate-600 font-medium">Se souvenir de moi</span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="auth-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[48px] mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synchronisation Firebase...</span>
                  </>
                ) : mode === 'login' ? (
                  <>
                    <span>Se connecter à Joyce-K</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Envoyer le lien</span>
                    <Mail className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Annuler et revenir à l'accueil
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Back to login if in forgot mode */}
        {mode === 'forgot' && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
            >
              ← Retour à la page de connexion
            </button>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="mt-5 sm:mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-[11px] text-slate-500 font-medium text-center sm:text-left">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Authentification Firebase & Anti-IA
          </span>
          <span className="text-slate-400">Joyce-K Global</span>
        </div>
      </div>
    </div>
  );
};
