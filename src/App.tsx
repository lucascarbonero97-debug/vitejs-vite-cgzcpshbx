import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  Trophy,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Sun,
  Moon,
  Sparkles,
  Calendar,
  Target,
  Activity,
  Brain,
  Briefcase,
  Dumbbell,
  Heart,
  BookOpen,
  Droplets,
  Code,
  Coffee,
  Music,
  Check,
  X,
  RotateCcw,
  Award,
  Zap,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Camera,
  Image as ImageIcon,
  User,
  Users,
  Lock,
  LogOut,
  Scale,
  FileText,
  Upload,
  Columns,
  CalendarDays,
  Grid,
  Layers,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Timer,
  Play,
  Pause,
  ClipboardList,
  Video,
  Wrench,
  CheckSquare,
  Copy,
  Gauge,
  History,
  KeyRound,
  Download,
  ShieldAlert,
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
} from 'firebase/firestore';

// ==========================================
// INICIALIZACIÓN DE FIREBASE (REGLA 1, 2, 3)
// ==========================================
const firebaseConfig =
  typeof __firebase_config !== 'undefined' && __firebase_config
    ? JSON.parse(__firebase_config)
    : { apiKey: 'demo-key', projectId: 'demo-project' };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'nexo-coaching-os';

// ==========================================
// CONSTANTES Y UTILIDADES DE FECHAS
// ==========================================
const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const MONTHS_SHORT_ES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

const DAYS_SHORT_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAYS_FULL_ES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const toDateStr = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateStr = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};

const addDays = (dateStr, days) => {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
};

const getMondayOfWeek = (dateStr) => {
  const d = parseDateStr(dateStr);
  const day = d.getDay(); // 0 domingo, 1 lunes...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toDateStr(d);
};

const formatReadableDate = (dateStr) => {
  const d = parseDateStr(dateStr);
  const jsDay = d.getDay();
  const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
  return `${DAYS_FULL_ES[dayIdx]} ${d.getDate()} de ${
    MONTHS_ES[d.getMonth()]
  }, ${d.getFullYear()}`;
};

// ==========================================
// CATEGORÍAS E ÍCONOS DE NEXO COACHING
// ==========================================
const CATEGORIES = {
  Salud: {
    name: 'Salud',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bgDark: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    accent: '#10b981',
    icon: Heart,
  },
  Productividad: {
    name: 'Productividad',
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    bgDark: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
    accent: '#6366f1',
    icon: Briefcase,
  },
  Mente: {
    name: 'Mente',
    bgLight: 'bg-violet-50 text-violet-700 border-violet-200',
    bgDark: 'bg-violet-950/60 text-violet-300 border-violet-800/60',
    accent: '#8b5cf6',
    icon: Brain,
  },
  Deporte: {
    name: 'Deporte',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    bgDark: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    accent: '#f59e0b',
    icon: Dumbbell,
  },
};

const PHOTO_CATEGORIES = [
  { id: 'Progreso Físico', label: 'Progreso Físico', color: '#6366f1' },
  { id: 'Comida / Nutrición', label: 'Comida / Nutrición', color: '#10b981' },
  { id: 'Entrenamiento', label: 'Entrenamiento', color: '#f59e0b' },
  { id: 'Mentalidad / Rutina', label: 'Mentalidad / Rutina', color: '#8b5cf6' },
];

// ==========================================
// PLANTILLAS DE RUTINAS NEXO TRAINING HUB
// ==========================================
const DEFAULT_WORKOUT_PLAN = [
  {
    id: 'wday-1',
    dayLabel: 'Día 1',
    title: 'Fuerza Tren Superior & Empuje/Tracción',
    focus: 'Hipertrofia Funcional & Control Escapular',
    durationEst: '55 min',
    coachNotes:
      'Calentar manguito rotador 8 min antes de empezar. Priorizar técnica limpia sobre carga bruta.',
    exercises: [
      {
        id: 'ex-101',
        name: 'Press Banca Inclinado con Mancuernas',
        sets: 4,
        reps: '8-10',
        rest: 90,
        targetWeight: '27.5',
        rir: 'RIR 2',
        notes: 'Controlar 2 segundos la bajada (fase excéntrica).',
        videoUrl: '',
      },
      {
        id: 'ex-102',
        name: 'Dominadas Lastradas o Jalón al Pecho Prono',
        sets: 4,
        reps: '8-10',
        rest: 90,
        targetWeight: '70',
        rir: 'RIR 1-2',
        notes: 'Iniciar el movimiento deprimiendo escápulas.',
        videoUrl: '',
      },
      {
        id: 'ex-103',
        name: 'Press Militar de Pie con Barra (Overhead Press)',
        sets: 3,
        reps: '8-10',
        rest: 90,
        targetWeight: '45',
        rir: 'RIR 2',
        notes: 'Abdomen y glúteos firmes para proteger zona lumbar.',
        videoUrl: '',
      },
      {
        id: 'ex-104',
        name: 'Remo con Pecho Apoyado en Banco',
        sets: 3,
        reps: '10-12',
        rest: 60,
        targetWeight: '24',
        rir: 'RIR 1',
        notes: 'Pausa de 1 segundo arriba apretando espalda media.',
        videoUrl: '',
      },
      {
        id: 'ex-105',
        name: 'Superserie: Facepulls + Fondos en Paralelas',
        sets: 3,
        reps: '12-15',
        rest: 60,
        targetWeight: '20',
        rir: 'RIR 1',
        notes: 'Enfoque en salud de hombro y bombeo de tríceps.',
        videoUrl: '',
      },
    ],
  },
  {
    id: 'wday-2',
    dayLabel: 'Día 2',
    title: 'Piernas Dominante Rodilla/Cadera + Core',
    focus: 'Fuerza Base Tren Inferior & Estabilidad',
    durationEst: '60 min',
    coachNotes:
      'Movilidad de tobillo y cadera previa. Mantener presión intraabdominal en sentadilla y peso muerto.',
    exercises: [
      {
        id: 'ex-201',
        name: 'Sentadilla Libre con Barra (Back Squat)',
        sets: 4,
        reps: '6-8',
        rest: 120,
        targetWeight: '95',
        rir: 'RIR 2',
        notes: 'Romper el paralelo manteniendo torso sólido.',
        videoUrl: '',
      },
      {
        id: 'ex-202',
        name: 'Peso Muerto Rumano con Barra o Mancuernas',
        sets: 4,
        reps: '8-10',
        rest: 90,
        targetWeight: '85',
        rir: 'RIR 2',
        notes: 'Llevar cadera atrás sintiendo tensión en isquios.',
        videoUrl: '',
      },
      {
        id: 'ex-203',
        name: 'Sentadilla Búlgara con Mancuernas',
        sets: 3,
        reps: '10 c/pierna',
        rest: 90,
        targetWeight: '20',
        rir: 'RIR 1',
        notes:
          'Inclinación leve del torso hacia adelante para enfatizar glúteo.',
        videoUrl: '',
      },
      {
        id: 'ex-204',
        name: 'Rueda Abdominal (Ab Wheel) o Plancha RKC',
        sets: 3,
        reps: '12 reps / 45s',
        rest: 60,
        targetWeight: 'Peso Corp.',
        rir: 'RIR 1',
        notes: 'Evitar hiperextensión lumbar en todo el recorrido.',
        videoUrl: '',
      },
    ],
  },
  {
    id: 'wday-3',
    dayLabel: 'Día 3',
    title: 'Acondicionamiento Metabólico, Kettlebells & Running',
    focus: 'Capacidad Aeróbica, Potencia & Quema Calórica',
    durationEst: '45 min',
    coachNotes:
      'Mantener cadencia constante. Hidratación con electrolitos durante la sesión.',
    exercises: [
      {
        id: 'ex-301',
        name: 'Kettlebell Swings Rusos (Potencia de Cadera)',
        sets: 4,
        reps: '20 reps',
        rest: 60,
        targetWeight: '24',
        rir: 'RPE 8',
        notes: 'Extensión explosiva de cadera, los brazos solo acompañan.',
        videoUrl: '',
      },
      {
        id: 'ex-302',
        name: 'Bloque Intervalos Running / Remo Ergómetro',
        sets: 5,
        reps: '400m rápido',
        rest: 90,
        targetWeight: 'Ritmo 4:10',
        rir: 'RPE 8.5',
        notes: 'Recuperación activa caminando durante los 90s de pausa.',
        videoUrl: '',
      },
      {
        id: 'ex-303',
        name: 'Paseo del Granjero Pesado (Farmer Walk)',
        sets: 4,
        reps: '40 metros',
        rest: 60,
        targetWeight: '32',
        rir: 'RPE 8',
        notes: 'Postura alta, hombros lejos de las orejas y paso firme.',
        videoUrl: '',
      },
      {
        id: 'ex-304',
        name: 'Burpees Controlados + Salto al Cajón',
        sets: 3,
        reps: '12 reps',
        rest: 60,
        targetWeight: 'Peso Corp.',
        rir: 'RPE 9',
        notes: 'Aterrizar suave sobre el cajón amortiguando con rodillas.',
        videoUrl: '',
      },
    ],
  },
];

const NEXO_WORKOUT_PRESETS = [
  {
    id: 'preset-hybrid',
    name: 'Plan Nexo Híbrido 3 Días (Fuerza + Piernas + Metabólico)',
    description: 'Ideal para recomposición corporal y rendimiento ejecutivo.',
    plan: DEFAULT_WORKOUT_PLAN,
  },
  {
    id: 'preset-upper-lower',
    name: 'Plan Nexo Fuerza 4 Días (Torso / Pierna Élite)',
    description: 'Enfoque máximo en progresión de cargas e hipertrofia.',
    plan: [
      ...DEFAULT_WORKOUT_PLAN.slice(0, 2),
      {
        id: 'wday-u2',
        dayLabel: 'Día 3',
        title: 'Torso Hipertrofia & Brazos / Hombros',
        focus: 'Volumen Muscular y Bombeo',
        durationEst: '55 min',
        coachNotes:
          'Descansos estrictos de 60-75s. Buscar máxima conexión mente-músculo.',
        exercises: [
          {
            id: 'ex-401',
            name: 'Press Plano con Mancuernas',
            sets: 4,
            reps: '10-12',
            rest: 75,
            targetWeight: '30',
            rir: 'RIR 1',
            notes: 'Rango completo de movimiento.',
            videoUrl: '',
          },
          {
            id: 'ex-402',
            name: 'Remo Pendlay o Remo con Barra 45°',
            sets: 4,
            reps: '8-10',
            rest: 90,
            targetWeight: '70',
            rir: 'RIR 2',
            notes: 'Tracción hacia la cadera.',
            videoUrl: '',
          },
          {
            id: 'ex-403',
            name: 'Elevaciones Laterales con Mancuernas o Polea',
            sets: 4,
            reps: '15',
            rest: 60,
            targetWeight: '12.5',
            rir: 'RIR 0-1',
            notes: 'Guiar el movimiento con los codos.',
            videoUrl: '',
          },
        ],
      },
      {
        id: 'wday-l2',
        dayLabel: 'Día 4',
        title: 'Pierna Cadena Posterior, Glúteo & Core',
        focus: 'Potencia de Cadera & Estabilidad',
        durationEst: '55 min',
        coachNotes: 'Enfocarse en empujar el suelo con los talones.',
        exercises: [
          {
            id: 'ex-501',
            name: 'Hip Thrust con Barra Olímpica',
            sets: 4,
            reps: '8-10',
            rest: 90,
            targetWeight: '110',
            rir: 'RIR 1',
            notes: 'Pausa de 2s arriba en máxima contracción.',
            videoUrl: '',
          },
          {
            id: 'ex-502',
            name: 'Prensa de Piernas 45°',
            sets: 4,
            reps: '10-12',
            rest: 90,
            targetWeight: '180',
            rir: 'RIR 2',
            notes: 'Sin despegar la cadera del respaldo.',
            videoUrl: '',
          },
          {
            id: 'ex-503',
            name: 'Curl Femoral Tumbado o Sentado',
            sets: 3,
            reps: '12-15',
            rest: 60,
            targetWeight: '50',
            rir: 'RIR 1',
            notes: 'Controlar el retorno.',
            videoUrl: '',
          },
        ],
      },
    ],
  },
];

const ICON_OPTIONS = [
  { id: 'Dumbbell', label: 'Entrenamiento', component: Dumbbell },
  { id: 'Droplets', label: 'Hidratación', component: Droplets },
  { id: 'Brain', label: 'Meditación', component: Brain },
  { id: 'BookOpen', label: 'Lectura', component: BookOpen },
  { id: 'Briefcase', label: 'Deep Work', component: Briefcase },
  { id: 'Heart', label: 'Bienestar', component: Heart },
  { id: 'Zap', label: 'Energía', component: Zap },
  { id: 'Target', label: 'Enfoque', component: Target },
  { id: 'Coffee', label: 'Nutrición / Dieta', component: Coffee },
  { id: 'Code', label: 'Estudio', component: Code },
  { id: 'Music', label: 'Creatividad', component: Music },
  { id: 'Sparkles', label: 'Hábito Clave', component: Sparkles },
];

const BASE_HABITS_TEMPLATE = [
  {
    id: 'nexo-h1',
    name: 'Entrenamiento de Fuerza & Cardio',
    category: 'Deporte',
    target: '45 min diarios',
    icon: 'Dumbbell',
  },
  {
    id: 'nexo-h2',
    name: 'Bloque de Deep Work (Sin distracciones)',
    category: 'Productividad',
    target: '2 horas enfoque',
    icon: 'Briefcase',
  },
  {
    id: 'nexo-h3',
    name: 'Meditación & Visualización Matutina',
    category: 'Mente',
    target: '15 min al despertar',
    icon: 'Brain',
  },
  {
    id: 'nexo-h4',
    name: 'Hidratación + Nutrición Limpia',
    category: 'Salud',
    target: '3L Agua + Macros',
    icon: 'Droplets',
  },
  {
    id: 'nexo-h5',
    name: 'Lectura de Alto Rendimiento',
    category: 'Mente',
    target: '20 páginas noche',
    icon: 'BookOpen',
  },
  {
    id: 'nexo-h6',
    name: 'Planificación Nexo del Día Siguiente',
    category: 'Productividad',
    target: '3 Objetivos Clave',
    icon: 'Target',
  },
];

// Generador determinista de historial para demostración inicial rica en las 4 vistas
const buildSeedLogsForClient = (habits, todayStr, adherenceBias = 0.78) => {
  const logs = {};
  for (let i = 140; i >= 0; i--) {
    const dStr = addDays(todayStr, -i);
    logs[dStr] = {};
    habits.forEach((h, idx) => {
      // Generador pseudoaleatorio suave pero realista
      const hash = (i * 31 + idx * 17 + dStr.charCodeAt(8)) % 100;
      const threshold = (1 - adherenceBias) * 100;
      // Mayor adherencia en los últimos 10 días para mostrar rachas activas
      if (i <= 5) {
        logs[dStr][h.id] = idx !== 4 || i % 2 === 0;
      } else {
        logs[dStr][h.id] = hash >= threshold;
      }
    });
  }
  return logs;
};

// Generador de SVG en DataURL para fotos iniciales "Antes / Después" de demostración
const createDemoPhotoSvg = (
  title,
  subtitle,
  weightText,
  dateText,
  gradStart,
  gradEnd
) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="720" viewBox="0 0 600 720">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradStart}"/>
        <stop offset="100%" stop-color="${gradEnd}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="720" fill="url(#g)"/>
    <circle cx="300" cy="250" r="140" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" stroke-width="3"/>
    <circle cx="300" cy="195" r="42" fill="rgba(255,255,255,0.85)"/>
    <path d="M235 320 C235 260, 365 260, 365 320 L350 430 L250 430 Z" fill="rgba(255,255,255,0.85)"/>
    <rect x="40" y="480" width="520" height="190" rx="24" fill="rgba(15,23,42,0.78)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
    <text x="75" y="535" fill="#34d399" font-family="sans-serif" font-size="22" font-weight="bold">NEXO COACHING • EVIDENCIA</text>
    <text x="75" y="575" fill="#ffffff" font-family="sans-serif" font-size="30" font-weight="bold">${title}</text>
    <text x="75" y="612" fill="#cbd5e1" font-family="sans-serif" font-size="20">${subtitle}</text>
    <text x="75" y="646" fill="#818cf8" font-family="sans-serif" font-size="18" font-weight="bold">${dateText} — ${weightText}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Compresor de imágenes subidas desde el dispositivo del cliente (Canvas -> JPEG Base64 ligero)
const compressImageFile = (file, maxWidth = 720, quality = 0.72) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ==========================================
// CÁLCULO DE RACHAS BASADO EN CALENDARIO REAL
// ==========================================
const calculateStreakUpToDate = (habitId, logs, refDateStr) => {
  let streak = 0;
  let cursor = refDateStr;
  // Si hoy aún no está marcado pero ayer sí, contamos desde ayer para no mostrar 0 a mitad del día
  if (!logs?.[cursor]?.[habitId]) {
    const yesterday = addDays(refDateStr, -1);
    if (logs?.[yesterday]?.[habitId]) {
      cursor = yesterday;
    } else {
      return 0;
    }
  }
  for (let i = 0; i < 365; i++) {
    const dStr = addDays(cursor, -i);
    if (logs?.[dStr]?.[habitId]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

const calculateBestStreakInLogs = (habitId, logs) => {
  if (!logs) return 0;
  const sortedDates = Object.keys(logs).sort();
  let best = 0;
  let current = 0;
  let prevDate = null;

  sortedDates.forEach((dStr) => {
    const done = !!logs[dStr]?.[habitId];
    if (done) {
      if (prevDate && addDays(prevDate, 1) === dStr) {
        current += 1;
      } else {
        current = 1;
      }
      if (current > best) best = current;
      prevDate = dStr;
    } else {
      current = 0;
      prevDate = null;
    }
  });
  return best;
};

// ==========================================
// COMPONENTE PRINCIPAL NEXO COACHING
// ==========================================
export default function App() {
  const todayDefaultStr = useMemo(() => toDateStr(new Date()), []);

  // Tema visual (Oscuro por defecto con estética Nexo)
  const [darkMode, setDarkMode] = useState(true);

  // Autenticación de Firebase (Regla 3)
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Gestión de Sesiones de Clientes (Perfiles privados en Firestore)
  const [clients, setClients] = useState([]);
  const [activeClientId, setActiveClientId] = useState(null);
  const [clientPhotos, setClientPhotos] = useState([]);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [pinPromptClient, setPinPromptClient] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Formulario para crear nuevo perfil de cliente
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    goal: 'Transformación 90 Días & Alto Rendimiento',
    pin: '',
    startWeight: '78.5',
  });

  // Navegación de los 6 Módulos: 'diario' | 'entrenamiento' | 'semanal' | 'mensual' | 'anual' | 'fotos'
  const [activeTab, setActiveTab] = useState('diario');

  // Estados del Módulo Nexo Training Hub (Coach vs Cliente, Rutinas, Series y Temporizador)
  const [isCoachMode, setIsCoachMode] = useState(false);
  const [coachMasterPin, setCoachMasterPin] = useState('2026');
  const [isCoachPinModalOpen, setIsCoachPinModalOpen] = useState(false);
  const [coachPinInput, setCoachPinInput] = useState('');
  const [coachPinError, setCoachPinError] = useState('');
  const [isChangeCoachPinOpen, setIsChangeCoachPinOpen] = useState(false);
  const [newCoachPinDraft, setNewCoachPinDraft] = useState('');
  const [selectedWorkoutDayId, setSelectedWorkoutDayId] = useState('wday-1');
  const [sessionLiveDraft, setSessionLiveDraft] = useState({});
  const [sessionRpeDraft, setSessionRpeDraft] = useState('8');
  const [sessionCommentDraft, setSessionCommentDraft] = useState('');
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    sets: 4,
    reps: '8-10',
    rest: 90,
    targetWeight: '30',
    rir: 'RIR 2',
    notes: '',
    videoUrl: '',
  });
  const [isWorkoutDayModalOpen, setIsWorkoutDayModalOpen] = useState(false);
  const [workoutDayForm, setWorkoutDayForm] = useState({
    dayLabel: 'Día 4',
    title: '',
    focus: '',
    durationEst: '50 min',
    coachNotes: '',
  });

  // Temporizador de descanso (Rest Timer)
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [restTimerRunning, setRestTimerRunning] = useState(false);

  // Fechas seleccionadas para las vistas
  const [selectedDate, setSelectedDate] = useState(todayDefaultStr);
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => {
    const d = parseDateStr(todayDefaultStr);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedYear, setSelectedYear] = useState(() =>
    parseDateStr(todayDefaultStr).getFullYear()
  );

  // Filtros en vistas de hábitos
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal de Crear / Editar Hábito
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [habitForm, setHabitForm] = useState({
    name: '',
    category: 'Productividad',
    target: '30 min diarios',
    icon: 'Sparkles',
  });

  // Estado para Nota Diaria y Peso del Día
  const [dailyNoteDraft, setDailyNoteDraft] = useState('');
  const [dailyWeightDraft, setDailyWeightDraft] = useState('');

  // Estados de la Galería Fotográfica y Comparador Antes / Después
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoFilterCat, setPhotoFilterCat] = useState('Todas');
  const [compareMode, setCompareMode] = useState(false);
  const [beforePhotoId, setBeforePhotoId] = useState(null);
  const [afterPhotoId, setAfterPhotoId] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [photoForm, setPhotoForm] = useState({
    date: todayDefaultStr,
    category: 'Progreso Físico',
    weight: '',
    note: '',
    imageData: '',
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Notificación Toast y Modal de Confirmación
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  };

  // ==========================================
  // 1. AUTENTICACIÓN INICIAL CON FIREBASE (REGLA 3)
  // ==========================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== 'undefined' &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Error en autenticación inicial:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // ==========================================
  // 2. SUSCRIPCIÓN A PERFILES DE CLIENTES Y FOTOS EN FIRESTORE
  // ==========================================
  useEffect(() => {
    if (!user) return;

    const clientsRef = collection(
      db,
      'artifacts',
      appId,
      'users',
      user.uid,
      'nexo_clients'
    );

    const unsubscribeClients = onSnapshot(
      clientsRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // Crear 2 perfiles de clientes de ejemplo iniciales para que el usuario pueda probar todo al instante
          const seedLogs1 = buildSeedLogsForClient(
            BASE_HABITS_TEMPLATE,
            todayDefaultStr,
            0.84
          );
          const demoClient1 = {
            id: 'client-alex-nexo',
            name: 'Alejandro Vance',
            program: 'Programa Élite 90 Días • Recomposición & Deep Work',
            avatarColor: 'from-indigo-500 to-emerald-400',
            pin: '', // Sin PIN para acceso directo inicial
            startWeight: '82.4',
            currentWeight: '76.8',
            habits: BASE_HABITS_TEMPLATE,
            logsJson: JSON.stringify(seedLogs1),
            dailyNotesJson: JSON.stringify({
              [todayDefaultStr]:
                'Excelente nivel de energía en el entrenamiento de fuerza. Cumplí el bloque de 2h de concentración sin interrupciones.',
            }),
            dailyWeightsJson: JSON.stringify({
              [addDays(todayDefaultStr, -30)]: '80.5',
              [addDays(todayDefaultStr, -15)]: '78.2',
              [todayDefaultStr]: '76.8',
            }),
            workoutPlanJson: JSON.stringify(DEFAULT_WORKOUT_PLAN),
            workoutHistoryJson: JSON.stringify({
              [addDays(todayDefaultStr, -2)]: {
                workoutDayId: 'wday-1',
                workoutTitle: 'Fuerza Tren Superior & Empuje/Tracción',
                rpe: '8.5',
                totalVolume: 6420,
                completedSets: 17,
                comment: 'Excelente bombeo en press inclinado y dominadas.',
                completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                setsData: {},
              },
            }),
            createdAt: new Date().toISOString(),
          };

          const seedLogs2 = buildSeedLogsForClient(
            BASE_HABITS_TEMPLATE.slice(0, 5),
            todayDefaultStr,
            0.74
          );
          const demoClient2 = {
            id: 'client-sofia-nexo',
            name: 'Sofía Mendoza',
            program: 'Nexo Mindfulness & Hábitos Ejecutivos',
            avatarColor: 'from-violet-500 to-fuchsia-500',
            pin: '1234', // Ejemplo con PIN opcional (1234)
            startWeight: '64.0',
            currentWeight: '61.2',
            habits: BASE_HABITS_TEMPLATE.slice(0, 5),
            logsJson: JSON.stringify(seedLogs2),
            dailyNotesJson: JSON.stringify({
              [todayDefaultStr]:
                'Enfocada en hidratación y lectura nocturna sin pantallas.',
            }),
            dailyWeightsJson: JSON.stringify({
              [todayDefaultStr]: '61.2',
            }),
            workoutPlanJson: JSON.stringify(DEFAULT_WORKOUT_PLAN),
            workoutHistoryJson: JSON.stringify({}),
            createdAt: new Date().toISOString(),
          };

          try {
            await setDoc(
              doc(
                db,
                'artifacts',
                appId,
                'users',
                user.uid,
                'nexo_clients',
                demoClient1.id
              ),
              demoClient1
            );
            await setDoc(
              doc(
                db,
                'artifacts',
                appId,
                'users',
                user.uid,
                'nexo_clients',
                demoClient2.id
              ),
              demoClient2
            );

            // Sembrar 2 fotos de demostración ("Antes" y "Después") para el cliente 1
            const photoBefore = {
              id: 'photo-demo-1',
              clientId: demoClient1.id,
              date: addDays(todayDefaultStr, -60),
              category: 'Progreso Físico',
              weight: '82.4 kg',
              note: 'Día 1 del Programa Nexo 90 Días. Punto de partida físico y mental.',
              imageData: createDemoPhotoSvg(
                'DÍA 1 • INICIO PROGRAMA',
                'Evaluación inicial de composición corporal',
                '82.4 kg',
                addDays(todayDefaultStr, -60),
                '#312e81',
                '#1e1b4b'
              ),
              createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
            };

            const photoAfter = {
              id: 'photo-demo-2',
              clientId: demoClient1.id,
              date: todayDefaultStr,
              category: 'Progreso Físico',
              weight: '76.8 kg',
              note: 'Semana 9: -5.6 kg manteniendo masa muscular y energía al máximo.',
              imageData: createDemoPhotoSvg(
                'SEMANA 9 • PROGRESO ACTUAL',
                'Definición visible y adherencia del 84%',
                '76.8 kg',
                todayDefaultStr,
                '#065f46',
                '#312e81'
              ),
              createdAt: new Date().toISOString(),
            };

            await setDoc(
              doc(
                db,
                'artifacts',
                appId,
                'users',
                user.uid,
                'nexo_photos',
                photoBefore.id
              ),
              photoBefore
            );
            await setDoc(
              doc(
                db,
                'artifacts',
                appId,
                'users',
                user.uid,
                'nexo_photos',
                photoAfter.id
              ),
              photoAfter
            );
          } catch (seedErr) {
            console.error('Error sembrando clientes demo:', seedErr);
          }
          return;
        }

        const loadedClients = snapshot.docs.map((d) => {
          const raw = d.data();
          let parsedLogs = {};
          let parsedNotes = {};
          let parsedWeights = {};
          let parsedWorkoutPlan = DEFAULT_WORKOUT_PLAN;
          let parsedWorkoutHistory = {};
          try {
            parsedLogs = raw.logsJson ? JSON.parse(raw.logsJson) : {};
          } catch {
            parsedLogs = {};
          }
          try {
            parsedNotes = raw.dailyNotesJson
              ? JSON.parse(raw.dailyNotesJson)
              : {};
          } catch {
            parsedNotes = {};
          }
          try {
            parsedWeights = raw.dailyWeightsJson
              ? JSON.parse(raw.dailyWeightsJson)
              : {};
          } catch {
            parsedWeights = {};
          }
          try {
            parsedWorkoutPlan = raw.workoutPlanJson
              ? JSON.parse(raw.workoutPlanJson)
              : DEFAULT_WORKOUT_PLAN;
          } catch {
            parsedWorkoutPlan = DEFAULT_WORKOUT_PLAN;
          }
          try {
            parsedWorkoutHistory = raw.workoutHistoryJson
              ? JSON.parse(raw.workoutHistoryJson)
              : {};
          } catch {
            parsedWorkoutHistory = {};
          }
          return {
            ...raw,
            id: d.id,
            habits: Array.isArray(raw.habits)
              ? raw.habits
              : BASE_HABITS_TEMPLATE,
            logs: parsedLogs,
            dailyNotes: parsedNotes,
            dailyWeights: parsedWeights,
            workoutPlan:
              Array.isArray(parsedWorkoutPlan) && parsedWorkoutPlan.length > 0
                ? parsedWorkoutPlan
                : DEFAULT_WORKOUT_PLAN,
            workoutHistory: parsedWorkoutHistory || {},
          };
        });

        setClients(loadedClients);
        setActiveClientId((prevId) => {
          if (prevId && loadedClients.some((c) => c.id === prevId))
            return prevId;
          return loadedClients[0]?.id || null;
        });
      },
      (error) => {
        console.error('Error escuchando perfiles de clientes:', error);
      }
    );

    const photosRef = collection(
      db,
      'artifacts',
      appId,
      'users',
      user.uid,
      'nexo_photos'
    );

    const unsubscribePhotos = onSnapshot(
      photosRef,
      (snapshot) => {
        const loadedPhotos = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        }));
        // Ordenar en memoria por fecha descendente (Regla 2)
        loadedPhotos.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setClientPhotos(loadedPhotos);
      },
      (err) => {
        console.error('Error escuchando galería de fotos:', err);
      }
    );

    return () => {
      unsubscribeClients();
      unsubscribePhotos();
    };
  }, [user, todayDefaultStr]);

  // Suscripción a Configuración Global del Coach (Clave Maestra en Firestore)
  useEffect(() => {
    if (!user) return;
    const coachConfigRef = doc(
      db,
      'artifacts',
      appId,
      'users',
      user.uid,
      'nexo_settings',
      'coach_security'
    );
    const unsubscribeConfig = onSnapshot(
      coachConfigRef,
      (snap) => {
        if (snap.exists() && snap.data()?.masterPin) {
          setCoachMasterPin(snap.data().masterPin);
        }
      },
      (err) => {
        console.error('Error leyendo configuración de coach:', err);
      }
    );
    return () => unsubscribeConfig();
  }, [user]);

  // Función para abrir o salir del Modo Coach con protección por Clave Maestra
  const handleToggleCoachMode = () => {
    if (isCoachMode) {
      setIsCoachMode(false);
      setIsChangeCoachPinOpen(false);
      showToast('🔒 Modo Coach bloqueado. Vista de alumno activa.');
    } else {
      setCoachPinInput('');
      setCoachPinError('');
      setIsCoachPinModalOpen(true);
    }
  };

  const handleVerifyCoachPin = (e) => {
    e.preventDefault();
    const entered = coachPinInput.trim().toUpperCase();
    const validPin = (coachMasterPin || '2026').trim().toUpperCase();
    if (entered === validPin || entered === 'NEXO') {
      setIsCoachMode(true);
      setIsCoachPinModalOpen(false);
      setCoachPinInput('');
      setCoachPinError('');
      showToast('🔓 Modo Coach desbloqueado. Podés editar la rutina.');
    } else {
      setCoachPinError(
        'Clave de Coach incorrecta. (Clave por defecto: 2026 o NEXO)'
      );
    }
  };

  const handleSaveNewCoachPin = async (e) => {
    e.preventDefault();
    const cleanPin = newCoachPinDraft.trim();
    if (cleanPin.length < 3) {
      showToast('La clave debe tener al menos 3 caracteres', 'error');
      return;
    }
    setCoachMasterPin(cleanPin);
    setIsChangeCoachPinOpen(false);
    setNewCoachPinDraft('');
    if (user) {
      try {
        await setDoc(
          doc(
            db,
            'artifacts',
            appId,
            'users',
            user.uid,
            'nexo_settings',
            'coach_security'
          ),
          { masterPin: cleanPin, updatedAt: new Date().toISOString() }
        );
      } catch (err) {
        console.error('Error guardando nueva clave de coach:', err);
      }
    }
    showToast(`🔑 Clave Maestra de Coach actualizada a: ${cleanPin}`);
  };

  // Exportar / Descargar Portal Web Standalone (.html) con los datos del cliente y su rutina
  const handleDownloadStandaloneHtml = () => {
    if (!activeClient) return;
    const exportData = {
      clientName: activeClient.name,
      program: activeClient.program,
      startWeight: activeClient.startWeight,
      currentWeight: activeClient.currentWeight,
      habits: activeClient.habits || [],
      workoutPlan: workoutPlan || [],
    };

    const standaloneHtml = `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NEXO Coaching OS — ${exportData.clientName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans p-4 sm:p-8">
  <div class="max-w-5xl mx-auto space-y-6">
    <header class="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
      <div>
        <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-400">NEXO COACHING • PORTAL WEB PORTABLE</span>
        <h1 class="text-2xl font-extrabold mt-1">${exportData.clientName}</h1>
        <p class="text-xs text-slate-400">${exportData.program}</p>
      </div>
      <div class="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <span class="text-slate-400 block">Progreso de Peso</span>
        <strong class="text-sm text-emerald-400">${
          exportData.startWeight
        } kg → ${exportData.currentWeight} kg</strong>
      </div>
    </header>

    <section class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <h2 class="text-lg font-extrabold text-indigo-400">1. Objetivos y Hábitos Diarios</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="habits-container"></div>
    </section>

    <section class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <h2 class="text-lg font-extrabold text-amber-400">2. Plan de Entrenamiento Asignado por Nexo</h2>
      <div class="space-y-6" id="workouts-container"></div>
    </section>
  </div>

  <script>
    const data = ${JSON.stringify(exportData)};
    const habitsEl = document.getElementById('habits-container');
    data.habits.forEach((h, idx) => {
      const card = document.createElement('label');
      card.className = 'p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 cursor-pointer hover:border-indigo-500';
      card.innerHTML = '<input type="checkbox" class="w-5 h-5 accent-emerald-500 rounded" /> <div><div class="font-bold text-sm">' + h.name + '</div><div class="text-xs text-slate-400">' + h.category + ' • Meta: ' + h.target + '</div></div>';
      habitsEl.appendChild(card);
    });

    const workoutsEl = document.getElementById('workouts-container');
    data.workoutPlan.forEach((day) => {
      const block = document.createElement('div');
      block.className = 'p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3';
      let exHtml = day.exercises.map((ex, i) => 
        '<div class="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap justify-between gap-2">' +
          '<div><strong class="text-sm text-white">' + (i+1) + '. ' + ex.name + '</strong><p class="text-xs text-slate-400">' + (ex.notes || '') + '</p></div>' +
          '<div class="text-xs font-bold text-amber-400">' + ex.sets + ' series × ' + ex.reps + ' • Pausa ' + ex.rest + 's (' + ex.rir + ')</div>' +
        '</div>'
      ).join('');
      block.innerHTML = '<div class="flex justify-between items-center"><h3 class="font-extrabold text-base text-emerald-400">' + day.dayLabel + ': ' + day.title + '</h3><span class="text-xs text-slate-400">' + day.durationEst + '</span></div><p class="text-xs text-slate-400">' + (day.coachNotes || '') + '</p><div class="space-y-2 mt-2">' + exHtml + '</div>';
      workoutsEl.appendChild(block);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([standaloneHtml], {
      type: 'text/html;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nexo-Web-${activeClient.name.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('🌐 Archivo Web (.html) descargado en tu dispositivo');
  };

  // Cliente Activo Actual
  const activeClient = useMemo(() => {
    return clients.find((c) => c.id === activeClientId) || null;
  }, [clients, activeClientId]);

  const habits = activeClient?.habits || [];
  const logs = activeClient?.logs || {};
  const dailyNotes = activeClient?.dailyNotes || {};
  const dailyWeights = activeClient?.dailyWeights || {};
  const workoutPlan = activeClient?.workoutPlan || DEFAULT_WORKOUT_PLAN;
  const workoutHistory = activeClient?.workoutHistory || {};

  // Asegurar que siempre haya un día de rutina válido seleccionado
  useEffect(() => {
    if (!workoutPlan || workoutPlan.length === 0) return;
    if (!workoutPlan.some((d) => d.id === selectedWorkoutDayId)) {
      setSelectedWorkoutDayId(workoutPlan[0].id);
    }
  }, [workoutPlan, selectedWorkoutDayId]);

  const activeWorkoutDay = useMemo(() => {
    return (
      workoutPlan.find((d) => d.id === selectedWorkoutDayId) ||
      workoutPlan[0] ||
      null
    );
  }, [workoutPlan, selectedWorkoutDayId]);

  // Cargar datos previos si ya se entrenó en la fecha seleccionada o inicializar con los pesos sugeridos por el coach
  useEffect(() => {
    if (!activeWorkoutDay) return;
    const savedForDate = workoutHistory?.[selectedDate];
    if (
      savedForDate &&
      savedForDate.workoutDayId === activeWorkoutDay.id &&
      savedForDate.setsData
    ) {
      setSessionLiveDraft(savedForDate.setsData);
      setSessionRpeDraft(savedForDate.rpe || '8');
      setSessionCommentDraft(savedForDate.comment || '');
    } else {
      const initialDraft = {};
      activeWorkoutDay.exercises.forEach((ex) => {
        const setsArr = [];
        const numSets = Number(ex.sets) || 3;
        const defaultReps =
          String(ex.reps || '10')
            .split('-')[0]
            .replace(/\D/g, '') || '10';
        const defaultWeight =
          String(ex.targetWeight || '0').replace(/[^\d.]/g, '') || '0';
        for (let s = 0; s < numSets; s++) {
          setsArr.push({
            weight: defaultWeight,
            reps: defaultReps,
            done: false,
          });
        }
        initialDraft[ex.id] = setsArr;
      });
      setSessionLiveDraft(initialDraft);
      setSessionRpeDraft('8');
      setSessionCommentDraft('');
    }
  }, [activeWorkoutDay, selectedDate, workoutHistory]);

  // Efecto para el Temporizador de Descanso (Rest Timer)
  useEffect(() => {
    if (!restTimerRunning || restTimerSeconds <= 0) {
      if (restTimerSeconds <= 0 && restTimerRunning) {
        setRestTimerRunning(false);
        showToast(
          '⏱️ ¡Tiempo de descanso terminado! A por la siguiente serie.'
        );
      }
      return;
    }
    const timer = setInterval(() => {
      setRestTimerSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [restTimerRunning, restTimerSeconds]);

  const startRestTimer = (secs) => {
    setRestTimerSeconds(secs);
    setRestTimerRunning(true);
  };

  // Sincronizar borradores de nota y peso cuando cambia el día seleccionado o el cliente
  useEffect(() => {
    if (!activeClient) return;
    setDailyNoteDraft(activeClient.dailyNotes?.[selectedDate] || '');
    setDailyWeightDraft(activeClient.dailyWeights?.[selectedDate] || '');
  }, [activeClient, selectedDate]);

  // Fotos filtradas del cliente activo
  const activeClientPhotos = useMemo(() => {
    if (!activeClient) return [];
    return clientPhotos.filter((p) => p.clientId === activeClient.id);
  }, [clientPhotos, activeClient]);

  // Preseleccionar fotos para el comparador Antes / Después
  useEffect(() => {
    if (activeClientPhotos.length >= 2) {
      const oldest = activeClientPhotos[activeClientPhotos.length - 1];
      const newest = activeClientPhotos[0];
      setBeforePhotoId((prev) =>
        activeClientPhotos.some((p) => p.id === prev) ? prev : oldest.id
      );
      setAfterPhotoId((prev) =>
        activeClientPhotos.some((p) => p.id === prev) ? prev : newest.id
      );
    } else if (activeClientPhotos.length === 1) {
      setBeforePhotoId(activeClientPhotos[0].id);
      setAfterPhotoId(activeClientPhotos[0].id);
    }
  }, [activeClientPhotos]);

  // ==========================================
  // FUNCIONES DE PERSISTENCIA EN FIRESTORE
  // ==========================================
  const updateActiveClientInFirestore = async (partialFields) => {
    if (!user || !activeClient) return;
    try {
      const clientDocRef = doc(
        db,
        'artifacts',
        appId,
        'users',
        user.uid,
        'nexo_clients',
        activeClient.id
      );
      const payload = {
        ...activeClient,
        ...partialFields,
      };
      // Serializar objetos anidados (logs, notas, pesos)
      if (partialFields.logs) {
        payload.logsJson = JSON.stringify(partialFields.logs);
      }
      if (partialFields.dailyNotes) {
        payload.dailyNotesJson = JSON.stringify(partialFields.dailyNotes);
      }
      if (partialFields.dailyWeights) {
        payload.dailyWeightsJson = JSON.stringify(partialFields.dailyWeights);
      }
      if (partialFields.workoutPlan) {
        payload.workoutPlanJson = JSON.stringify(partialFields.workoutPlan);
      }
      if (partialFields.workoutHistory) {
        payload.workoutHistoryJson = JSON.stringify(
          partialFields.workoutHistory
        );
      }
      delete payload.logs;
      delete payload.dailyNotes;
      delete payload.dailyWeights;
      delete payload.workoutPlan;
      delete payload.workoutHistory;

      await setDoc(clientDocRef, payload);
    } catch (err) {
      console.error('Error guardando cliente en Firestore:', err);
      showToast('Error al sincronizar con la nube', 'error');
    }
  };

  // ==========================================
  // FUNCIONES DEL MÓDULO DE ENTRENAMIENTO (COACH & CLIENTE)
  // ==========================================

  // Actualizar peso, repeticiones o estado completado de una serie en vivo
  const handleUpdateSetLive = (
    exerciseId,
    setIndex,
    field,
    value,
    autoRestSeconds = 0
  ) => {
    setSessionLiveDraft((prev) => {
      const exSets = [...(prev[exerciseId] || [])];
      if (!exSets[setIndex]) return prev;
      const updatedSet = { ...exSets[setIndex], [field]: value };
      exSets[setIndex] = updatedSet;

      // Si el cliente acaba de marcar la serie como hecha, activar el temporizador de descanso sugerido
      if (field === 'done' && value === true && autoRestSeconds > 0) {
        startRestTimer(Number(autoRestSeconds) || 90);
      }
      return {
        ...prev,
        [exerciseId]: exSets,
      };
    });
  };

  // Calcular métricas de la sesión en vivo (series completadas y tonelaje/volumen total en kg)
  const liveWorkoutMetrics = useMemo(() => {
    if (!activeWorkoutDay)
      return { completedSets: 0, totalSets: 0, totalVolume: 0, pct: 0 };
    let completedSets = 0;
    let totalSets = 0;
    let totalVolume = 0;

    activeWorkoutDay.exercises.forEach((ex) => {
      const setsArr = sessionLiveDraft[ex.id] || [];
      setsArr.forEach((s) => {
        totalSets++;
        if (s.done) {
          completedSets++;
          const w = parseFloat(s.weight) || 0;
          const r = parseFloat(s.reps) || 0;
          totalVolume += Math.round(w * r);
        }
      });
    });

    const pct =
      totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    return { completedSets, totalSets, totalVolume, pct };
  }, [activeWorkoutDay, sessionLiveDraft]);

  // Finalizar Entrenamiento del Día y marcar hábito deportivo automáticamente
  const handleFinishWorkoutSession = async () => {
    if (!activeClient || !activeWorkoutDay) return;

    const sessionRecord = {
      workoutDayId: activeWorkoutDay.id,
      dayLabel: activeWorkoutDay.dayLabel,
      workoutTitle: activeWorkoutDay.title,
      rpe: sessionRpeDraft,
      comment: sessionCommentDraft.trim(),
      totalVolume: liveWorkoutMetrics.totalVolume,
      completedSets: liveWorkoutMetrics.completedSets,
      totalSets: liveWorkoutMetrics.totalSets,
      setsData: sessionLiveDraft,
      completedAt: new Date().toISOString(),
    };

    const updatedWorkoutHistory = {
      ...workoutHistory,
      [selectedDate]: sessionRecord,
    };

    // Marcar automáticamente el hábito de Deporte / Entrenamiento en el registro diario del cliente
    const currentDayLog = { ...(logs[selectedDate] || {}) };
    const sportHabit = habits.find(
      (h) =>
        h.category === 'Deporte' ||
        h.name.toLowerCase().includes('entrenamiento') ||
        h.icon === 'Dumbbell'
    );
    if (sportHabit) {
      currentDayLog[sportHabit.id] = true;
    }

    const updatedLogs = {
      ...logs,
      [selectedDate]: currentDayLog,
    };

    await updateActiveClientInFirestore({
      workoutHistory: updatedWorkoutHistory,
      logs: updatedLogs,
    });

    showToast(
      `💪 ¡Entrenamiento registrado! Volumen: ${liveWorkoutMetrics.totalVolume} kg y hábito deportivo completado.`
    );
  };

  // Funciones Modo Coach: Agregar o Editar Ejercicio dentro del Día de Rutina activo
  const handleSaveExerciseCoach = async (e) => {
    e.preventDefault();
    if (!activeClient || !activeWorkoutDay || !exerciseForm.name.trim()) return;

    const updatedPlan = workoutPlan.map((dayObj) => {
      if (dayObj.id !== activeWorkoutDay.id) return dayObj;
      let newExercises;
      if (editingExercise) {
        newExercises = dayObj.exercises.map((ex) =>
          ex.id === editingExercise.id
            ? {
                ...ex,
                name: exerciseForm.name.trim(),
                sets: Number(exerciseForm.sets) || 3,
                reps: exerciseForm.reps.trim() || '10',
                rest: Number(exerciseForm.rest) || 60,
                targetWeight: exerciseForm.targetWeight.trim(),
                rir: exerciseForm.rir.trim() || 'RIR 2',
                notes: exerciseForm.notes.trim(),
                videoUrl: exerciseForm.videoUrl.trim(),
              }
            : ex
        );
      } else {
        const createdEx = {
          id: `ex-${Date.now()}`,
          name: exerciseForm.name.trim(),
          sets: Number(exerciseForm.sets) || 3,
          reps: exerciseForm.reps.trim() || '10',
          rest: Number(exerciseForm.rest) || 60,
          targetWeight: exerciseForm.targetWeight.trim(),
          rir: exerciseForm.rir.trim() || 'RIR 2',
          notes: exerciseForm.notes.trim(),
          videoUrl: exerciseForm.videoUrl.trim(),
        };
        newExercises = [...dayObj.exercises, createdEx];
      }
      return { ...dayObj, exercises: newExercises };
    });

    await updateActiveClientInFirestore({ workoutPlan: updatedPlan });
    setIsExerciseModalOpen(false);
    setEditingExercise(null);
    showToast(
      editingExercise
        ? 'Ejercicio actualizado en la rutina del cliente'
        : 'Ejercicio añadido a la sesión del cliente'
    );
  };

  const handleDeleteExerciseCoach = async (exerciseId) => {
    if (!activeClient || !activeWorkoutDay) return;
    const updatedPlan = workoutPlan.map((dayObj) => {
      if (dayObj.id !== activeWorkoutDay.id) return dayObj;
      return {
        ...dayObj,
        exercises: dayObj.exercises.filter((ex) => ex.id !== exerciseId),
      };
    });
    await updateActiveClientInFirestore({ workoutPlan: updatedPlan });
    showToast('Ejercicio eliminado del bloque');
  };

  // Funciones Modo Coach: Crear nuevo Día/Bloque de entrenamiento
  const handleAddWorkoutDayCoach = async (e) => {
    e.preventDefault();
    if (!activeClient || !workoutDayForm.title.trim()) return;
    const newDayId = `wday-${Date.now()}`;
    const newDayObj = {
      id: newDayId,
      dayLabel:
        workoutDayForm.dayLabel.trim() || `Día ${workoutPlan.length + 1}`,
      title: workoutDayForm.title.trim(),
      focus: workoutDayForm.focus.trim() || 'Fuerza & Acondicionamiento',
      durationEst: workoutDayForm.durationEst.trim() || '50 min',
      coachNotes: workoutDayForm.coachNotes.trim(),
      exercises: [],
    };
    const updatedPlan = [...workoutPlan, newDayObj];
    await updateActiveClientInFirestore({ workoutPlan: updatedPlan });
    setSelectedWorkoutDayId(newDayId);
    setIsWorkoutDayModalOpen(false);
    showToast(
      `Bloque "${newDayObj.dayLabel}" creado para ${activeClient.name}`
    );
  };

  const handleDeleteWorkoutDayCoach = async (dayId) => {
    if (!activeClient || workoutPlan.length <= 1) {
      showToast('El plan debe tener al menos 1 día de entrenamiento', 'error');
      return;
    }
    const updatedPlan = workoutPlan.filter((d) => d.id !== dayId);
    await updateActiveClientInFirestore({ workoutPlan: updatedPlan });
    setSelectedWorkoutDayId(updatedPlan[0].id);
    showToast('Día de entrenamiento eliminado del plan');
  };

  // Asignar plantilla completa de Nexo con un clic
  const handleAssignPresetPlan = async (preset) => {
    if (!activeClient) return;
    await updateActiveClientInFirestore({ workoutPlan: preset.plan });
    setSelectedWorkoutDayId(preset.plan[0].id);
    showToast(`Plantilla "${preset.name}" asignada a ${activeClient.name}`);
  };

  // Alternar check de un hábito en una fecha específica (YYYY-MM-DD)
  const toggleHabitOnDate = async (habitId, dateStr) => {
    if (!activeClient) return;
    const currentDayObj = { ...(logs[dateStr] || {}) };
    currentDayObj[habitId] = !currentDayObj[habitId];
    const updatedLogs = {
      ...logs,
      [dateStr]: currentDayObj,
    };
    await updateActiveClientInFirestore({ logs: updatedLogs });
  };

  const markAllHabitsOnDate = async (dateStr) => {
    if (!activeClient) return;
    const newDayMap = {};
    habits.forEach((h) => {
      newDayMap[h.id] = true;
    });
    const updatedLogs = {
      ...logs,
      [dateStr]: newDayMap,
    };
    await updateActiveClientInFirestore({ logs: updatedLogs });
    showToast(`¡Objetivos del ${formatReadableDate(dateStr)} completados!`);
  };

  const saveDailyJournal = async () => {
    if (!activeClient) return;
    const updatedNotes = {
      ...dailyNotes,
      [selectedDate]: dailyNoteDraft.trim(),
    };
    const updatedWeights = {
      ...dailyWeights,
      [selectedDate]: dailyWeightDraft.trim(),
    };
    const extraUpdate = {
      dailyNotes: updatedNotes,
      dailyWeights: updatedWeights,
    };
    if (dailyWeightDraft.trim()) {
      extraUpdate.currentWeight = dailyWeightDraft.trim();
    }
    await updateActiveClientInFirestore(extraUpdate);
    showToast('Bitácora y métricas del día guardadas en tu perfil');
  };

  // Crear nuevo cliente personal
  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!user || !newClientForm.name.trim()) return;

    const newId = `client-${Date.now()}`;
    const seedLogs = buildSeedLogsForClient(
      BASE_HABITS_TEMPLATE,
      todayDefaultStr,
      0.5
    );
    const newClientDoc = {
      id: newId,
      name: newClientForm.name.trim(),
      program: newClientForm.goal.trim() || 'Programa Personalizado Nexo',
      avatarColor: 'from-indigo-500 to-violet-500',
      pin: newClientForm.pin.trim(),
      startWeight: newClientForm.startWeight.trim() || '75.0',
      currentWeight: newClientForm.startWeight.trim() || '75.0',
      habits: BASE_HABITS_TEMPLATE,
      logsJson: JSON.stringify(seedLogs),
      dailyNotesJson: JSON.stringify({}),
      dailyWeightsJson: JSON.stringify({
        [todayDefaultStr]: newClientForm.startWeight.trim() || '75.0',
      }),
      workoutPlanJson: JSON.stringify(DEFAULT_WORKOUT_PLAN),
      workoutHistoryJson: JSON.stringify({}),
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(
        doc(db, 'artifacts', appId, 'users', user.uid, 'nexo_clients', newId),
        newClientDoc
      );
      setActiveClientId(newId);
      setNewClientForm({
        name: '',
        goal: 'Transformación 90 Días & Alto Rendimiento',
        pin: '',
        startWeight: '75.0',
      });
      setIsSessionModalOpen(false);
      showToast(`Sesión iniciada para ${newClientDoc.name}`);
    } catch (err) {
      console.error('Error creando perfil de cliente:', err);
    }
  };

  // Cambiar de sesión de cliente (verifica PIN si tiene configurado uno)
  const handleSelectClientSession = (clientObj) => {
    if (clientObj.id === activeClientId) {
      setIsSessionModalOpen(false);
      return;
    }
    if (clientObj.pin && clientObj.pin.trim() !== '') {
      setPinPromptClient(clientObj);
      setPinInput('');
      setPinError('');
    } else {
      setActiveClientId(clientObj.id);
      setIsSessionModalOpen(false);
      showToast(`Sesión activa: ${clientObj.name}`);
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (!pinPromptClient) return;
    if (pinInput.trim() === pinPromptClient.pin.trim()) {
      setActiveClientId(pinPromptClient.id);
      setPinPromptClient(null);
      setIsSessionModalOpen(false);
      showToast(`Sesión desbloqueada: ${pinPromptClient.name}`);
    } else {
      setPinError('PIN incorrecto. Para la cuenta demo de Sofía usa 1234.');
    }
  };

  // Guardar / Editar Hábito
  const handleSaveHabit = async (e) => {
    e.preventDefault();
    if (!habitForm.name.trim() || !activeClient) return;

    let updatedHabits;
    if (editingHabit) {
      updatedHabits = habits.map((h) =>
        h.id === editingHabit.id
          ? {
              ...h,
              name: habitForm.name.trim(),
              category: habitForm.category,
              target: habitForm.target.trim() || 'Meta diaria',
              icon: habitForm.icon,
            }
          : h
      );
      showToast('Hábito actualizado en tu cuenta');
    } else {
      const newH = {
        id: `nexo-h-${Date.now()}`,
        name: habitForm.name.trim(),
        category: habitForm.category,
        target: habitForm.target.trim() || 'Meta diaria',
        icon: habitForm.icon,
      };
      updatedHabits = [newH, ...habits];
      showToast('Nuevo hábito añadido al plan del cliente');
    }

    await updateActiveClientInFirestore({ habits: updatedHabits });
    setIsHabitModalOpen(false);
  };

  const requestDeleteHabit = (habit) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar hábito del programa',
      message: `¿Confirmas eliminar "${habit.name}" del perfil de ${activeClient?.name}?`,
      onConfirm: async () => {
        const updatedHabits = habits.filter((h) => h.id !== habit.id);
        await updateActiveClientInFirestore({ habits: updatedHabits });
        setConfirmDialog({
          isOpen: false,
          title: '',
          message: '',
          onConfirm: null,
        });
        showToast('Hábito eliminado');
      },
    });
  };

  // Subida y compresión de foto
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const compressed = await compressImageFile(file, 720, 0.72);
      setPhotoForm((prev) => ({ ...prev, imageData: compressed }));
    } catch (err) {
      console.error('Error comprimiendo imagen:', err);
      showToast('No se pudo procesar la imagen seleccionada', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSavePhoto = async (e) => {
    e.preventDefault();
    if (!user || !activeClient || !photoForm.imageData) return;

    const newPhotoId = `photo-${Date.now()}`;
    const photoDoc = {
      id: newPhotoId,
      clientId: activeClient.id,
      date: photoForm.date || todayDefaultStr,
      category: photoForm.category,
      weight: photoForm.weight.trim() ? `${photoForm.weight.trim()} kg` : '',
      note: photoForm.note.trim(),
      imageData: photoForm.imageData,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(
        doc(
          db,
          'artifacts',
          appId,
          'users',
          user.uid,
          'nexo_photos',
          newPhotoId
        ),
        photoDoc
      );
      setIsPhotoModalOpen(false);
      setPhotoForm({
        date: todayDefaultStr,
        category: 'Progreso Físico',
        weight: '',
        note: '',
        imageData: '',
      });
      showToast('Fotografía guardada en el expediente del cliente');
    } catch (err) {
      console.error('Error guardando foto en Firestore:', err);
      showToast('Error al subir la fotografía', 'error');
    }
  };

  const requestDeletePhoto = (photo) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar fotografía de progreso',
      message: `¿Deseas eliminar la fotografía del ${photo.date} (${photo.category})?`,
      onConfirm: async () => {
        if (!user) return;
        await deleteDoc(
          doc(
            db,
            'artifacts',
            appId,
            'users',
            user.uid,
            'nexo_photos',
            photo.id
          )
        );
        setConfirmDialog({
          isOpen: false,
          title: '',
          message: '',
          onConfirm: null,
        });
        showToast('Fotografía eliminada');
      },
    });
  };

  // ==========================================
  // CÁLCULO DE ANALÍTICAS (DIARIO, SEMANAL, MENSUAL, ANUAL)
  // ==========================================

  // 1. Semana de la fecha seleccionada (Lunes a Domingo)
  const currentWeekDays = useMemo(() => {
    const mondayStr = getMondayOfWeek(selectedDate);
    return DAYS_SHORT_ES.map((label, idx) => {
      const dStr = addDays(mondayStr, idx);
      const dObj = parseDateStr(dStr);
      return {
        label,
        fullName: DAYS_FULL_ES[idx],
        dateStr: dStr,
        dayNumber: dObj.getDate(),
        monthShort: MONTHS_SHORT_ES[dObj.getMonth()],
      };
    });
  }, [selectedDate]);

  // 2. KPIs Globales del Cliente
  const kpis = useMemo(() => {
    const totalHabits = habits.length;
    if (totalHabits === 0) {
      return {
        dailyDone: 0,
        totalHabits: 0,
        dailyPct: 0,
        weeklyPct: 0,
        weeklyChecks: 0,
        maxActiveStreak: 0,
        bestEverStreak: 0,
      };
    }

    const dayLog = logs[selectedDate] || {};
    const dailyDone = habits.filter((h) => !!dayLog[h.id]).length;
    const dailyPct = Math.round((dailyDone / totalHabits) * 100);

    let weeklyChecks = 0;
    currentWeekDays.forEach((d) => {
      const l = logs[d.dateStr] || {};
      habits.forEach((h) => {
        if (l[h.id]) weeklyChecks++;
      });
    });
    const weeklyPct = Math.round((weeklyChecks / (totalHabits * 7)) * 100);

    const activeStreaks = habits.map((h) =>
      calculateStreakUpToDate(h.id, logs, selectedDate)
    );
    const bestStreaks = habits.map((h) =>
      calculateBestStreakInLogs(h.id, logs)
    );

    return {
      dailyDone,
      totalHabits,
      dailyPct,
      weeklyPct,
      weeklyChecks,
      maxActiveStreak: Math.max(...activeStreaks, 0),
      bestEverStreak: Math.max(...bestStreaks, 0),
    };
  }, [habits, logs, selectedDate, currentWeekDays]);

  // 3. Datos Gráfico Semanal
  const weeklyChartData = useMemo(() => {
    const total = habits.length || 1;
    return currentWeekDays.map((d) => {
      const l = logs[d.dateStr] || {};
      const done = habits.filter((h) => !!l[h.id]).length;
      const pct = habits.length > 0 ? Math.round((done / total) * 100) : 0;
      return {
        name: `${d.label} ${d.dayNumber}`,
        fullName: `${d.fullName} ${d.dayNumber} ${d.monthShort}`,
        dateStr: d.dateStr,
        porcentaje: pct,
        completados: done,
        total: habits.length,
      };
    });
  }, [currentWeekDays, habits, logs]);

  // 4. Datos Comparativa de Rachas por Hábito
  const streakChartData = useMemo(() => {
    return habits
      .map((h) => {
        const current = calculateStreakUpToDate(h.id, logs, selectedDate);
        const best = Math.max(calculateBestStreakInLogs(h.id, logs), current);
        return {
          id: h.id,
          name: h.name.length > 20 ? h.name.substring(0, 18) + '…' : h.name,
          fullName: h.name,
          rachaActual: current,
          mejorRacha: best,
          color: CATEGORIES[h.category]?.accent || '#6366f1',
        };
      })
      .sort((a, b) => b.rachaActual - a.rachaActual);
  }, [habits, logs, selectedDate]);

  // 5. Datos Vista Mensual (Calendario + Estadísticas del mes)
  const monthlyData = useMemo(() => {
    const { year, month } = selectedMonthDate;
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Offset para que la semana empiece en Lunes (0 = Lun ... 6 = Dom)
    const jsFirstDay = firstDayOfMonth.getDay();
    const startOffset = jsFirstDay === 0 ? 6 : jsFirstDay - 1;

    const daysArray = [];
    let totalChecksInMonth = 0;
    let perfectDaysCount = 0;
    const totalHabits = habits.length || 1;

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
        dayNum
      ).padStart(2, '0')}`;
      const l = logs[dStr] || {};
      const doneCount = habits.filter((h) => !!l[h.id]).length;
      const pct =
        habits.length > 0 ? Math.round((doneCount / totalHabits) * 100) : 0;
      totalChecksInMonth += doneCount;
      if (pct === 100 && habits.length > 0) perfectDaysCount++;

      daysArray.push({
        dayNum,
        dateStr: dStr,
        doneCount,
        totalHabits: habits.length,
        pct,
        hasNote: !!dailyNotes[dStr],
        weight: dailyWeights[dStr] || null,
      });
    }

    const monthlyAdherencePct =
      habits.length > 0
        ? Math.round((totalChecksInMonth / (daysInMonth * habits.length)) * 100)
        : 0;

    return {
      year,
      month,
      monthName: MONTHS_ES[month],
      startOffset,
      daysInMonth,
      daysArray,
      totalChecksInMonth,
      perfectDaysCount,
      monthlyAdherencePct,
    };
  }, [selectedMonthDate, habits, logs, dailyNotes, dailyWeights]);

  // 6. Datos Vista Anual (12 Meses + Mapa de Calor de 365 días)
  const annualData = useMemo(() => {
    const year = selectedYear;
    const totalHabits = habits.length || 1;
    let yearTotalChecks = 0;
    let yearActiveDays = 0;
    let yearPerfectDays = 0;

    const monthsBreakdown = MONTHS_ES.map((mName, mIdx) => {
      const daysInM = new Date(year, mIdx + 1, 0).getDate();
      let mChecks = 0;
      const dayCells = [];

      for (let d = 1; d <= daysInM; d++) {
        const dStr = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(
          d
        ).padStart(2, '0')}`;
        const l = logs[dStr] || {};
        const done = habits.filter((h) => !!l[h.id]).length;
        const pct =
          habits.length > 0 ? Math.round((done / totalHabits) * 100) : 0;

        mChecks += done;
        yearTotalChecks += done;
        if (done > 0) yearActiveDays++;
        if (pct === 100 && habits.length > 0) yearPerfectDays++;

        dayCells.push({
          day: d,
          dateStr: dStr,
          done,
          pct,
        });
      }

      const adherence =
        habits.length > 0
          ? Math.round((mChecks / (daysInM * totalHabits)) * 100)
          : 0;

      return {
        monthIndex: mIdx,
        name: MONTHS_SHORT_ES[mIdx],
        fullName: mName,
        adherencia: adherence,
        checks: mChecks,
        dayCells,
      };
    });

    const overallAnnualPct =
      habits.length > 0
        ? Math.round((yearTotalChecks / (365 * totalHabits)) * 100)
        : 0;

    return {
      year,
      monthsBreakdown,
      yearTotalChecks,
      yearActiveDays,
      yearPerfectDays,
      overallAnnualPct,
    };
  }, [selectedYear, habits, logs]);

  // Hábitos filtrados por búsqueda y categoría
  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      const matchesCat =
        categoryFilter === 'Todas' || h.category === categoryFilter;
      const matchesQuery =
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.target &&
          h.target.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesQuery;
    });
  }, [habits, categoryFilter, searchQuery]);

  const renderHabitIcon = (iconName, className = 'w-5 h-5') => {
    const found = ICON_OPTIONS.find((item) => item.id === iconName);
    const IconComponent = found ? found.component : Sparkles;
    return <IconComponent className={className} />;
  };

  // ==========================================
  // RENDERIZADO PRINCIPAL
  // ==========================================
  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${
        darkMode
          ? 'bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white'
          : 'bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white'
      }`}
    >
      {/* Luces ambientales Nexo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            darkMode ? 'bg-indigo-600' : 'bg-indigo-300'
          }`}
        />
        <div
          className={`absolute top-20 right-0 w-96 h-96 rounded-full blur-3xl opacity-15 ${
            darkMode ? 'bg-violet-600' : 'bg-violet-300'
          }`}
        />
        <div
          className={`absolute bottom-0 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-10 ${
            darkMode ? 'bg-emerald-500' : 'bg-emerald-200'
          }`}
        />
      </div>

      {/* Toast Flotante */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md bg-indigo-600/95 text-white border-indigo-400/40 animate-bounce">
          <Sparkles className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ==========================================
          CABECERA SUPERIOR Y SESIÓN PERSONAL DE CLIENTE
         ========================================== */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors ${
          darkMode
            ? 'bg-slate-950/85 border-slate-800/80'
            : 'bg-white/85 border-slate-200/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo Nexo Coaching */}
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 via-violet-500 to-emerald-400 rounded-2xl blur opacity-75"></div>
              <div className="relative w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                  NEXO
                </span>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    darkMode
                      ? 'bg-indigo-950/90 text-indigo-300 border-indigo-800/60'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}
                >
                  Coaching Suite
                </span>
              </div>
              <p
                className={`text-xs hidden sm:block ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Seguimiento Diario, Semanal, Mensual, Anual & Evidencia
                Fotográfica
              </p>
            </div>
          </div>

          {/* Selector de Sesión Personal del Cliente + Acciones */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Botón de Sesión Activa del Cliente */}
            <button
              onClick={() => setIsSessionModalOpen(true)}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl border transition-all cursor-pointer ${
                darkMode
                  ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/60'
                  : 'bg-slate-100 border-slate-200 hover:border-indigo-400'
              }`}
              title="Cambiar o gestionar sesión personal del cliente"
            >
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${
                  activeClient?.avatarColor || 'from-indigo-500 to-emerald-400'
                } flex items-center justify-center text-white font-bold text-xs shadow`}
              >
                {activeClient?.name
                  ? activeClient.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                  : 'NX'}
              </div>
              <div className="text-left hidden md:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold leading-none">
                    {activeClient ? activeClient.name : 'Cargando sesión...'}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[10px] text-indigo-400 font-medium block mt-0.5">
                  Cambiar cuenta / Cliente
                </span>
              </div>
              <Users className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {/* Interruptor Modo Oscuro / Claro */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:border-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Botón Nuevo Hábito */}
            <button
              onClick={() => {
                setEditingHabit(null);
                setHabitForm({
                  name: '',
                  category: 'Productividad',
                  target: '30 min diarios',
                  icon: 'Sparkles',
                });
                setIsHabitModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Nuevo Hábito</span>
            </button>
          </div>
        </div>
        {/* BARRA DE NAVEGACIÓN DE LOS 6 NIVELES (DIARIO, ENTRENAMIENTO, SEMANAL, MENSUAL, ANUAL, FOTOS) */}
        <div
          className={`border-t ${
            darkMode
              ? 'border-slate-800/70 bg-slate-950/60'
              : 'border-slate-200/70 bg-slate-50/70'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-2 gap-2">
            <div className="flex items-center gap-1.5">
              {[
                {
                  id: 'diario',
                  label: '1. Registro Diario',
                  icon: CheckCircle2,
                },
                {
                  id: 'entrenamiento',
                  label: '2. Entrenamiento & Rutina',
                  icon: Dumbbell,
                },
                { id: 'semanal', label: '3. Vista Semanal', icon: Columns },
                {
                  id: 'mensual',
                  label: '4. Calendario Mensual',
                  icon: CalendarDays,
                },
                { id: 'anual', label: '5. Heatmap Anual (365d)', icon: Grid },
                {
                  id: 'fotos',
                  label: `6. Fotos & Progreso (${activeClientPhotos.length})`,
                  icon: Camera,
                },
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                        : darkMode
                        ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Indicador de Fecha Seleccionada Global */}
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                Fecha activa:
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  e.target.value && setSelectedDate(e.target.value)
                }
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold outline-none ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800 text-indigo-300'
                    : 'bg-white border-slate-200 text-indigo-700'
                }`}
              />
              {selectedDate !== todayDefaultStr && (
                <button
                  onClick={() => setSelectedDate(todayDefaultStr)}
                  className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  Ir a Hoy
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================
          CONTENIDO PRINCIPAL DEL PANEL
         ========================================== */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* BANNER DE PERFIL DEL CLIENTE ACTIVO */}
        {activeClient && (
          <div
            className={`rounded-2xl p-4 sm:p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              darkMode
                ? 'bg-gradient-to-r from-slate-900/95 via-indigo-950/30 to-slate-900/95 border-slate-800'
                : 'bg-gradient-to-r from-white via-indigo-50/40 to-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${
                  activeClient.avatarColor || 'from-indigo-500 to-emerald-400'
                } flex items-center justify-center text-white font-extrabold text-lg shadow-lg shrink-0`}
              >
                {activeClient.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
                    {activeClient.name}
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Sesión Privada Activa
                  </span>
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {activeClient.program}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  ID Nube: {user?.uid || 'sincronizando'} • Perfil:{' '}
                  {activeClient.id}
                </p>
              </div>
            </div>

            {/* Resumen de Peso y Progreso Fotográfico Rápido */}
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`px-3.5 py-2 rounded-xl border text-xs ${
                  darkMode
                    ? 'bg-slate-950/70 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Peso Inicial → Actual
                </span>
                <div className="font-extrabold text-sm mt-0.5 flex items-center gap-1.5">
                  <span>{activeClient.startWeight || '--'} kg</span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-emerald-400">
                    {activeClient.currentWeight || '--'} kg
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setPhotoForm({
                    date: selectedDate,
                    category: 'Progreso Físico',
                    weight: activeClient.currentWeight || '',
                    note: '',
                    imageData: '',
                  });
                  setIsPhotoModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Subir Foto de Hoy</span>
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            TARJETAS DE MÉTRICAS CLAVE (KPIs)
           ========================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Cumplimiento del Día Seleccionado */}
          <div
            className={`rounded-2xl p-5 border ${
              darkMode
                ? 'bg-slate-900/70 border-slate-800/90'
                : 'bg-white border-slate-200/90 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cumplimiento Diario
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">
                    {kpis.dailyPct}%
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    ({kpis.dailyDone}/{kpis.totalHabits} hoy)
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400 truncate">
              Fecha: <strong className="text-indigo-400">{selectedDate}</strong>
            </p>
          </div>

          {/* KPI 2: Adherencia Semanal */}
          <div
            className={`rounded-2xl p-5 border ${
              darkMode
                ? 'bg-slate-900/70 border-slate-800/90'
                : 'bg-white border-slate-200/90 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Efectividad Semanal
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">
                    {kpis.weeklyPct}%
                  </span>
                  <span className="text-xs font-semibold text-indigo-400">
                    ({kpis.weeklyChecks}/{kpis.totalHabits * 7} checks)
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${kpis.weeklyPct}%` }}
              />
            </div>
          </div>

          {/* KPI 3: Racha Activa Actual */}
          <div
            className={`rounded-2xl p-5 border ${
              darkMode
                ? 'bg-slate-900/70 border-slate-800/90'
                : 'bg-white border-slate-200/90 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Racha Activa Líder
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">
                    {kpis.maxActiveStreak}
                  </span>
                  <span className="text-xs font-semibold text-amber-400">
                    días seguidos
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Flame className="w-6 h-6 fill-amber-400/20" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Récord histórico del cliente:{' '}
              <strong>{kpis.bestEverStreak} días</strong>
            </p>
          </div>

          {/* KPI 4: Adherencia Mensual / Evidencias */}
          <div
            className={`rounded-2xl p-5 border ${
              darkMode
                ? 'bg-slate-900/70 border-slate-800/90'
                : 'bg-white border-slate-200/90 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Constancia Mensual
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">
                    {monthlyData.monthlyAdherencePct}%
                  </span>
                  <span className="text-xs font-semibold text-violet-400">
                    ({monthlyData.perfectDaysCount} días 100%)
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Fotos registradas:{' '}
              <strong>{activeClientPhotos.length} evidencias</strong>
            </p>
          </div>
        </section>

        {/* ==========================================================
            NIVEL 1: VISTA DE REGISTRO DIARIO (CHECKLIST + BITÁCORA)
           ========================================================== */}
        {activeTab === 'diario' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Columna Izquierda: Checklist Diario del Día Seleccionado */}
            <div
              className={`lg:col-span-8 rounded-2xl border p-5 sm:p-6 ${
                darkMode
                  ? 'bg-slate-900/70 border-slate-800/90'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              {/* Controles de Navegación de Fecha */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/60">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    Registro Diario de Hábitos
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">
                    {formatReadableDate(selectedDate)}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                    className={`p-2 rounded-xl border cursor-pointer ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Día anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) =>
                      e.target.value && setSelectedDate(e.target.value)
                    }
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-slate-100'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                    className={`p-2 rounded-xl border cursor-pointer ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Día siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => markAllHabitsOnDate(selectedDate)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 cursor-pointer"
                  >
                    Completar Todo
                  </button>
                </div>
              </div>

              {/* Lista de Hábitos del Día */}
              <div className="mt-5 space-y-3">
                {filteredHabits.map((habit) => {
                  const isDone = !!logs[selectedDate]?.[habit.id];
                  const catInfo =
                    CATEGORIES[habit.category] || CATEGORIES.Productividad;
                  const streak = calculateStreakUpToDate(
                    habit.id,
                    logs,
                    selectedDate
                  );

                  return (
                    <div
                      key={habit.id}
                      onClick={() => toggleHabitOnDate(habit.id, selectedDate)}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                        isDone
                          ? darkMode
                            ? 'bg-emerald-950/25 border-emerald-500/40'
                            : 'bg-emerald-50/70 border-emerald-300'
                          : darkMode
                          ? 'bg-slate-950/60 border-slate-800/80 hover:border-indigo-500/40'
                          : 'bg-slate-50/70 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <button
                          type="button"
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                            isDone
                              ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : darkMode
                              ? 'bg-slate-900 border border-slate-700 text-transparent'
                              : 'bg-white border border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                        </button>

                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: `${catInfo.accent}15`,
                            borderColor: `${catInfo.accent}35`,
                            color: catInfo.accent,
                          }}
                        >
                          {renderHabitIcon(habit.icon, 'w-5 h-5')}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-bold text-sm ${
                                isDone ? 'line-through opacity-80' : ''
                              }`}
                            >
                              {habit.name}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                darkMode ? catInfo.bgDark : catInfo.bgLight
                              }`}
                            >
                              {habit.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Meta: {habit.target}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-amber-400/20" />
                          <span>{streak}d</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingHabit(habit);
                            setHabitForm({
                              name: habit.name,
                              category: habit.category,
                              target: habit.target,
                              icon: habit.icon,
                            });
                            setIsHabitModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-400"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Columna Derecha: Bitácora Diaria del Cliente, Peso y Evidencia */}
            <div className="lg:col-span-4 space-y-6">
              {/* Tarjeta de Acceso Rápido a la Rutina del Día */}
              <div
                className={`rounded-2xl border p-5 sm:p-6 ${
                  darkMode
                    ? 'bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border-amber-500/30'
                    : 'bg-gradient-to-br from-amber-50/60 via-white to-white border-amber-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4" />
                    Nexo Training Hub
                  </span>
                  {workoutHistory?.[selectedDate] ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ✓ Entrenado ({workoutHistory[selectedDate].totalVolume}{' '}
                      kg)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                      Sesión Pendiente
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-extrabold">
                  {workoutHistory?.[selectedDate]
                    ? workoutHistory[selectedDate].workoutTitle
                    : activeWorkoutDay?.title || 'Rutina Personalizada Nexo'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {workoutHistory?.[selectedDate]
                    ? `RPE ${workoutHistory[selectedDate].rpe} • ${workoutHistory[selectedDate].completedSets} series completadas`
                    : `${
                        activeWorkoutDay?.exercises?.length || 0
                      } ejercicios pautados por tu coach`}
                </p>

                <button
                  onClick={() => setActiveTab('entrenamiento')}
                  className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Dumbbell className="w-4 h-4" />
                  <span>Abrir Rutina y Registrar Cargas</span>
                </button>
              </div>

              <div
                className={`rounded-2xl border p-5 sm:p-6 ${
                  darkMode
                    ? 'bg-slate-900/70 border-slate-800/90'
                    : 'bg-white border-slate-200/90 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold">
                    Bitácora & Métricas del Día
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Peso Corporal Registrado (kg)
                    </label>
                    <div className="relative">
                      <Scale className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={dailyWeightDraft}
                        onChange={(e) => setDailyWeightDraft(e.target.value)}
                        placeholder="Ej. 76.5"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none ${
                          darkMode
                            ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Notas de Energía, Entrenamiento y Reflexión
                    </label>
                    <textarea
                      rows={4}
                      value={dailyNoteDraft}
                      onChange={(e) => setDailyNoteDraft(e.target.value)}
                      placeholder="¿Cómo estuvo tu nivel de enfoque, adherencia nutricional y descanso hoy?"
                      className={`w-full p-3.5 rounded-xl text-sm border outline-none resize-none ${
                        darkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <button
                    onClick={saveDailyJournal}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20 cursor-pointer"
                  >
                    Guardar Registro del Día
                  </button>
                </div>
              </div>

              {/* Resumen de Fotos Subidas en esta Fecha */}
              <div
                className={`rounded-2xl border p-5 sm:p-6 ${
                  darkMode
                    ? 'bg-slate-900/70 border-slate-800/90'
                    : 'bg-white border-slate-200/90 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold">Evidencia Fotográfica</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('fotos')}
                    className="text-xs text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Ver galería completa
                  </button>
                </div>

                <p className="text-xs text-slate-400 mb-4">
                  Sube fotos de tu físico, comidas o entrenamiento para
                  documentar tu cambio.
                </p>

                <button
                  onClick={() => {
                    setPhotoForm({
                      date: selectedDate,
                      category: 'Progreso Físico',
                      weight:
                        dailyWeightDraft || activeClient?.currentWeight || '',
                      note: '',
                      imageData: '',
                    });
                    setIsPhotoModalOpen(true);
                  }}
                  className={`w-full py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    darkMode
                      ? 'border-slate-700 hover:border-emerald-400 text-slate-300 bg-slate-950/50'
                      : 'border-slate-300 hover:border-indigo-500 text-slate-700 bg-slate-50'
                  }`}
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Añadir Foto de Evidencia ({selectedDate})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            NIVEL 2: MÓDULO DE ENTRENAMIENTO Y RUTINAS (NEXO TRAINING HUB)
           ========================================================== */}
        {activeTab === 'entrenamiento' && (
          <div className="space-y-6">
            {/* Barra Superior del Training Hub: Selector Modo Coach vs Modo Cliente + Temporizador */}
            <div
              className={`rounded-2xl border p-5 sm:p-6 ${
                darkMode
                  ? 'bg-slate-900/80 border-slate-800/90'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4" />
                      Nexo Training Hub
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isCoachMode
                          ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {isCoachMode
                        ? 'Modo Coach: Editor de Rutina'
                        : 'Modo Cliente: Entrenamiento en Vivo'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
                    Plan de Entrenamiento — {activeClient?.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isCoachMode
                      ? 'Configura los días, ejercicios, series, RIR y notas técnicas que verá el cliente en su sesión.'
                      : `Registra tus cargas reales del ${formatReadableDate(
                          selectedDate
                        )} y usa el cronómetro de descanso entre series.`}
                  </p>
                </div>

                {/* Controles: Cronómetro de Descanso + Botón Modo Coach */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Temporizador de Descanso Interactivo */}
                  <div
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border ${
                      restTimerSeconds > 0
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : darkMode
                        ? 'bg-slate-950 border-slate-800 text-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Timer className="w-4 h-4 text-amber-400" />
                    <span className="font-mono font-extrabold text-sm min-w-[46px]">
                      {String(Math.floor(restTimerSeconds / 60)).padStart(
                        2,
                        '0'
                      )}
                      :{String(restTimerSeconds % 60).padStart(2, '0')}
                    </span>
                    {[60, 90, 120].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => startRestTimer(sec)}
                        className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-800/80 text-slate-200 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        {sec}s
                      </button>
                    ))}
                    {restTimerSeconds > 0 && (
                      <button
                        onClick={() => {
                          setRestTimerRunning(false);
                          setRestTimerSeconds(0);
                        }}
                        className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Reiniciar cronómetro"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Interruptor Modo Coach Protegido por Clave Maestra */}
                  <button
                    onClick={handleToggleCoachMode}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isCoachMode
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-400 shadow-lg shadow-violet-500/25'
                        : darkMode
                        ? 'bg-slate-950 border-slate-700 text-indigo-300 hover:border-indigo-500'
                        : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    {isCoachMode ? (
                      <Lock className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <KeyRound className="w-4 h-4 text-amber-400" />
                    )}
                    <span>
                      {isCoachMode
                        ? 'Cerrar Modo Coach (Bloquear)'
                        : '🔒 Modo Coach: Subir / Editar Rutina'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Panel exclusivo Modo Coach: Plantillas rápidas de Nexo + Cambio de Clave + Exportar HTML */}
              {isCoachMode && (
                <div
                  className={`mt-5 p-4 rounded-2xl border space-y-4 ${
                    darkMode
                      ? 'bg-violet-950/20 border-violet-500/30'
                      : 'bg-violet-50/70 border-violet-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400">
                          🔓 Panel de Entrenador Desbloqueado
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                          Clave actual: {coachMasterPin}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Asigná una plantilla base con un clic, agregá ejercicios
                        a medida para {activeClient?.name} o descargá su rutina
                        en formato página web.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {NEXO_WORKOUT_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleAssignPresetPlan(preset)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-violet-600/25 hover:bg-violet-600/40 text-violet-200 border border-violet-500/30 cursor-pointer"
                        >
                          ⚡ Cargar: {preset.name}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setWorkoutDayForm({
                            dayLabel: `Día ${workoutPlan.length + 1}`,
                            title: '',
                            focus: '',
                            durationEst: '55 min',
                            coachNotes: '',
                          });
                          setIsWorkoutDayModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer"
                      >
                        + Añadir Día de Rutina
                      </button>
                    </div>
                  </div>

                  {/* Barra de Seguridad del Coach y Descarga Web */}
                  <div className="pt-3 border-t border-violet-500/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setIsChangeCoachPinOpen(!isChangeCoachPinOpen)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/90 text-amber-300 border border-amber-500/30 hover:bg-slate-800 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Cambiar Clave Maestra Coach</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadStandaloneHtml}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-600/50 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Página Web del Alumno (.html)</span>
                      </button>
                    </div>

                    {isChangeCoachPinOpen && (
                      <form
                        onSubmit={handleSaveNewCoachPin}
                        className="flex items-center gap-2 w-full sm:w-auto"
                      >
                        <input
                          type="text"
                          value={newCoachPinDraft}
                          onChange={(e) => setNewCoachPinDraft(e.target.value)}
                          placeholder="Nueva clave (ej. 9988)"
                          className="px-3 py-1.5 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white outline-none"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 cursor-pointer"
                        >
                          Guardar Clave
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Selector de Días/Bloques de la Rutina del Cliente */}
              <div className="flex items-center gap-2.5 mt-5 overflow-x-auto pb-1">
                {workoutPlan.map((wDay) => {
                  const isSelected = activeWorkoutDay?.id === wDay.id;
                  return (
                    <div
                      key={wDay.id}
                      className="flex items-center gap-1 shrink-0"
                    >
                      <button
                        onClick={() => setSelectedWorkoutDayId(wDay.id)}
                        className={`px-4 py-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 font-extrabold shadow-md shadow-amber-500/20'
                            : darkMode
                            ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold">
                          {wDay.dayLabel} • {wDay.durationEst}
                        </div>
                        <div className="text-xs font-extrabold truncate max-w-[200px]">
                          {wDay.title}
                        </div>
                      </button>
                      {isCoachMode && workoutPlan.length > 1 && (
                        <button
                          onClick={() => handleDeleteWorkoutDayCoach(wDay.id)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                          title="Eliminar este día"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contenido del Día de Entrenamiento Activo */}
            {activeWorkoutDay && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Columna Izquierda (8 cols): Lista de Ejercicios y Series */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Cabecera del Bloque */}
                  <div
                    className={`rounded-2xl border p-5 ${
                      darkMode
                        ? 'bg-slate-900/70 border-slate-800/90'
                        : 'bg-white border-slate-200/90 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-amber-500/20 text-amber-400">
                            {activeWorkoutDay.dayLabel}
                          </span>
                          <span className="text-xs font-semibold text-indigo-400">
                            Enfoque: {activeWorkoutDay.focus}
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold mt-1">
                          {activeWorkoutDay.title}
                        </h3>
                        {activeWorkoutDay.coachNotes && (
                          <p className="text-xs text-slate-400 mt-1 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
                            📋{' '}
                            <strong className="text-slate-200">
                              Indicaciones del Coach:
                            </strong>{' '}
                            {activeWorkoutDay.coachNotes}
                          </p>
                        )}
                      </div>

                      {isCoachMode && (
                        <button
                          onClick={() => {
                            setEditingExercise(null);
                            setExerciseForm({
                              name: '',
                              sets: 4,
                              reps: '8-10',
                              rest: 90,
                              targetWeight: '30',
                              rir: 'RIR 2',
                              notes: '',
                              videoUrl: '',
                            });
                            setIsExerciseModalOpen(true);
                          }}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shrink-0 cursor-pointer"
                        >
                          + Agregar Ejercicio
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tarjetas de Ejercicios con sus Series Interactivas */}
                  {activeWorkoutDay.exercises.map((ex, exIdx) => {
                    const setsForEx = sessionLiveDraft[ex.id] || [];
                    const doneSetsCount = setsForEx.filter(
                      (s) => s.done
                    ).length;

                    return (
                      <div
                        key={ex.id}
                        className={`rounded-2xl border p-5 transition-all ${
                          darkMode
                            ? 'bg-slate-900/70 border-slate-800/90'
                            : 'bg-white border-slate-200/90 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-800/60">
                          <div className="flex items-start gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                              {exIdx + 1}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-base">
                                {ex.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                                <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 font-semibold">
                                  {ex.sets} series × {ex.reps}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-semibold">
                                  Intensidad: {ex.rir}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-semibold">
                                  Pausa: {ex.rest}s
                                </span>
                                {ex.targetWeight && (
                                  <span className="text-slate-400">
                                    Sugerido:{' '}
                                    <strong>{ex.targetWeight} kg</strong>
                                  </span>
                                )}
                              </div>
                              {ex.notes && (
                                <p className="text-xs text-slate-400 mt-1.5 italic">
                                  💡 Nota técnica: {ex.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-emerald-400">
                              {doneSetsCount}/{setsForEx.length} series
                            </span>
                            {isCoachMode && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingExercise(ex);
                                    setExerciseForm({
                                      name: ex.name,
                                      sets: ex.sets,
                                      reps: ex.reps,
                                      rest: ex.rest,
                                      targetWeight: ex.targetWeight || '',
                                      rir: ex.rir || 'RIR 2',
                                      notes: ex.notes || '',
                                      videoUrl: ex.videoUrl || '',
                                    });
                                    setIsExerciseModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 cursor-pointer"
                                  title="Editar ejercicio"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteExerciseCoach(ex.id)
                                  }
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer"
                                  title="Eliminar ejercicio"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Tabla de Series en Vivo (Peso kg, Reps, Check) */}
                        <div className="mt-4 space-y-2">
                          <div className="grid grid-cols-12 gap-2 text-[11px] font-bold uppercase text-slate-400 px-2">
                            <div className="col-span-2">Serie</div>
                            <div className="col-span-4">Peso Usado (kg)</div>
                            <div className="col-span-4">Reps Logradas</div>
                            <div className="col-span-2 text-right">Hecho</div>
                          </div>

                          {setsForEx.map((setItem, sIdx) => (
                            <div
                              key={sIdx}
                              className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-all ${
                                setItem.done
                                  ? darkMode
                                    ? 'bg-emerald-950/30 border-emerald-500/40'
                                    : 'bg-emerald-50 border-emerald-300'
                                  : darkMode
                                  ? 'bg-slate-950/70 border-slate-800'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="col-span-2 font-bold text-xs pl-1">
                                #{sIdx + 1}
                              </div>
                              <div className="col-span-4">
                                <input
                                  type="text"
                                  value={setItem.weight}
                                  onChange={(e) =>
                                    handleUpdateSetLive(
                                      ex.id,
                                      sIdx,
                                      'weight',
                                      e.target.value
                                    )
                                  }
                                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold border outline-none ${
                                    darkMode
                                      ? 'bg-slate-900 border-slate-700 text-white'
                                      : 'bg-white border-slate-300 text-slate-900'
                                  }`}
                                  placeholder="kg"
                                />
                              </div>
                              <div className="col-span-4">
                                <input
                                  type="text"
                                  value={setItem.reps}
                                  onChange={(e) =>
                                    handleUpdateSetLive(
                                      ex.id,
                                      sIdx,
                                      'reps',
                                      e.target.value
                                    )
                                  }
                                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold border outline-none ${
                                    darkMode
                                      ? 'bg-slate-900 border-slate-700 text-white'
                                      : 'bg-white border-slate-300 text-slate-900'
                                  }`}
                                  placeholder="reps"
                                />
                              </div>
                              <div className="col-span-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSetLive(
                                      ex.id,
                                      sIdx,
                                      'done',
                                      !setItem.done,
                                      ex.rest
                                    )
                                  }
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                    setItem.done
                                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                      : darkMode
                                      ? 'bg-slate-900 border border-slate-700 text-slate-500 hover:border-emerald-400'
                                      : 'bg-white border border-slate-300 text-slate-400'
                                  }`}
                                  title="Marcar serie y activar descanso"
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Columna Derecha (4 cols): Resumen de Sesión en Vivo e Historial de Entrenamientos */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Tarjeta de Cierre de Entrenamiento */}
                  <div
                    className={`rounded-2xl border p-5 sm:p-6 ${
                      darkMode
                        ? 'bg-slate-900/70 border-slate-800/90'
                        : 'bg-white border-slate-200/90 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-extrabold flex items-center gap-2">
                        <Gauge className="w-5 h-5 text-emerald-400" />
                        <span>Resumen de Sesión</span>
                      </h3>
                      <span className="text-xs font-bold text-indigo-400">
                        {selectedDate}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div
                        className={`p-3 rounded-xl border ${
                          darkMode
                            ? 'bg-slate-950 border-slate-800'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Series Completadas
                        </span>
                        <span className="text-xl font-extrabold text-emerald-400">
                          {liveWorkoutMetrics.completedSets}/
                          {liveWorkoutMetrics.totalSets}
                        </span>
                      </div>
                      <div
                        className={`p-3 rounded-xl border ${
                          darkMode
                            ? 'bg-slate-950 border-slate-800'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Tonelaje Movido
                        </span>
                        <span className="text-xl font-extrabold text-amber-400">
                          {liveWorkoutMetrics.totalVolume} kg
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">
                          Esfuerzo Percibido de la Sesión (RPE 1 a 10)
                        </label>
                        <select
                          value={sessionRpeDraft}
                          onChange={(e) => setSessionRpeDraft(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-bold border outline-none ${
                            darkMode
                              ? 'bg-slate-950 border-slate-800 text-white'
                              : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="6">
                            RPE 6 — Moderado / Recuperación
                          </option>
                          <option value="7">RPE 7 — Sólido y controlado</option>
                          <option value="8">
                            RPE 8 — Intenso (2 reps en recámara)
                          </option>
                          <option value="8.5">RPE 8.5 — Muy exigente</option>
                          <option value="9">
                            RPE 9 — Al límite técnico (1 rep en recámara)
                          </option>
                          <option value="10">
                            RPE 10 — Esfuerzo Máximo / Récord Personal
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">
                          Feedback para el Coach (Sensaciones, cargas,
                          molestias)
                        </label>
                        <textarea
                          rows={3}
                          value={sessionCommentDraft}
                          onChange={(e) =>
                            setSessionCommentDraft(e.target.value)
                          }
                          placeholder="Ej. Subí 2.5kg en Press Inclinado manteniendo buena técnica..."
                          className={`w-full p-3 rounded-xl text-xs border outline-none resize-none ${
                            darkMode
                              ? 'bg-slate-950 border-slate-800 text-white'
                              : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <button
                        onClick={handleFinishWorkoutSession}
                        className="w-full py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        ✓ Finalizar Entrenamiento y Marcar Hábito
                      </button>
                    </div>
                  </div>

                  {/* Historial Reciente de Sesiones del Cliente */}
                  <div
                    className={`rounded-2xl border p-5 sm:p-6 ${
                      darkMode
                        ? 'bg-slate-900/70 border-slate-800/90'
                        : 'bg-white border-slate-200/90 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <History className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-sm font-extrabold">
                        Historial de Entrenamientos
                      </h3>
                    </div>

                    {Object.keys(workoutHistory).length === 0 ? (
                      <p className="text-xs text-slate-400">
                        Aún no hay sesiones registradas. Al finalizar tu primer
                        entrenamiento aparecerá aquí.
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        {Object.entries(workoutHistory)
                          .sort((a, b) => b[0].localeCompare(a[0]))
                          .map(([dateKey, item]) => (
                            <div
                              key={dateKey}
                              onClick={() => setSelectedDate(dateKey)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                dateKey === selectedDate
                                  ? 'border-indigo-500 bg-indigo-500/10'
                                  : darkMode
                                  ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-amber-400">
                                  {dateKey}
                                </span>
                                <span className="text-emerald-400">
                                  {item.totalVolume} kg • RPE {item.rpe}
                                </span>
                              </div>
                              <div className="text-xs font-bold mt-1">
                                {item.workoutTitle}
                              </div>
                              {item.comment && (
                                <p className="text-[11px] text-slate-400 mt-1 truncate">
                                  "{item.comment}"
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================================
            NIVEL 3: VISTA SEMANAL (MATRIZ LUN-DOM & GRÁFICOS DE RACHAS)
           ========================================================== */}
        {activeTab === 'semanal' && (
          <div className="space-y-6">
            {/* Gráficos Semanales */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div
                className={`lg:col-span-7 rounded-2xl p-6 border ${
                  darkMode
                    ? 'bg-slate-900/70 border-slate-800/90'
                    : 'bg-white border-slate-200/90 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                      <span>Evolución Semanal de Cumplimiento</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Semana del {currentWeekDays[0]?.dateStr} al{' '}
                      {currentWeekDays[6]?.dateStr}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                      className="px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                    >
                      ← Sem. Ant.
                    </button>
                    <button
                      onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                      className="px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                    >
                      Sem. Sig. →
                    </button>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyChartData}>
                      <defs>
                        <linearGradient
                          id="weekGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.45}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={darkMode ? '#1e293b' : '#e2e8f0'}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: darkMode ? '#94a3b8' : '#64748b',
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: darkMode ? '#64748b' : '#94a3b8',
                          fontSize: 11,
                        }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="p-3 rounded-xl border bg-slate-900/95 border-slate-700 text-slate-100 text-xs shadow-xl">
                                <p className="font-bold text-indigo-400">
                                  {d.fullName}
                                </p>
                                <p className="font-semibold mt-1">
                                  Efectividad:{' '}
                                  <span className="text-emerald-400">
                                    {d.porcentaje}%
                                  </span>
                                </p>
                                <p className="text-slate-400">
                                  {d.completados} de {d.total} hábitos
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="porcentaje"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fill="url(#weekGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comparativa de Rachas */}
              <div
                className={`lg:col-span-5 rounded-2xl p-6 border ${
                  darkMode
                    ? 'bg-slate-900/70 border-slate-800/90'
                    : 'bg-white border-slate-200/90 shadow-sm'
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <span>Ranking de Rachas del Cliente</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Días consecutivos sostenidos hasta {selectedDate}
                  </p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={streakChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke={darkMode ? '#1e293b' : '#e2e8f0'}
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={125}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: darkMode ? '#cbd5e1' : '#334155',
                          fontSize: 11,
                        }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="rachaActual"
                        radius={[0, 6, 6, 0]}
                        barSize={16}
                      >
                        {streakChartData.map((entry, index) => (
                          <Cell key={`c-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Matriz Interactiva Lunes a Domingo */}
            <div
              className={`rounded-2xl border overflow-hidden ${
                darkMode
                  ? 'bg-slate-900/70 border-slate-800/90'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              <div className="p-5 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold">
                    Matriz Semanal Interactiva (Lunes a Domingo)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Marca o desmarca cualquier día de la semana directamente en
                    la cuadrícula
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {['Todas', ...Object.keys(CATEGORIES)].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : darkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-400'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      className={`border-b text-[11px] font-bold uppercase ${
                        darkMode
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <th className="py-3.5 px-5 min-w-[240px]">Hábito</th>
                      {currentWeekDays.map((d) => (
                        <th
                          key={d.dateStr}
                          className={`py-3 px-2 text-center min-w-[56px] ${
                            d.dateStr === selectedDate
                              ? 'bg-indigo-600/15 text-indigo-400'
                              : ''
                          }`}
                        >
                          <button
                            onClick={() => setSelectedDate(d.dateStr)}
                            className="cursor-pointer hover:underline"
                          >
                            <div>{d.label}</div>
                            <div className="text-[10px] font-normal opacity-80">
                              {d.dayNumber} {d.monthShort}
                            </div>
                          </button>
                        </th>
                      ))}
                      <th className="py-3.5 px-4 text-center">Racha</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredHabits.map((habit) => {
                      const catInfo =
                        CATEGORIES[habit.category] || CATEGORIES.Productividad;
                      const streak = calculateStreakUpToDate(
                        habit.id,
                        logs,
                        selectedDate
                      );
                      return (
                        <tr key={habit.id}>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                                style={{
                                  backgroundColor: `${catInfo.accent}15`,
                                  borderColor: `${catInfo.accent}35`,
                                  color: catInfo.accent,
                                }}
                              >
                                {renderHabitIcon(habit.icon, 'w-4 h-4')}
                              </div>
                              <div>
                                <div className="font-bold text-sm">
                                  {habit.name}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {habit.target}
                                </div>
                              </div>
                            </div>
                          </td>
                          {currentWeekDays.map((d) => {
                            const checked = !!logs[d.dateStr]?.[habit.id];
                            return (
                              <td
                                key={d.dateStr}
                                className="py-3.5 px-2 text-center"
                              >
                                <button
                                  onClick={() =>
                                    toggleHabitOnDate(habit.id, d.dateStr)
                                  }
                                  className={`w-8 h-8 rounded-xl inline-flex items-center justify-center transition-all cursor-pointer ${
                                    checked
                                      ? 'bg-gradient-to-br from-indigo-500 to-emerald-500 text-white shadow-sm'
                                      : darkMode
                                      ? 'bg-slate-950 border border-slate-800 text-transparent hover:border-indigo-500'
                                      : 'bg-slate-100 border border-slate-200 text-transparent hover:border-indigo-400'
                                  }`}
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>
                              </td>
                            );
                          })}
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold">
                              🔥 {streak}d
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => requestDeleteHabit(habit)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            NIVEL 3: VISTA MENSUAL (CALENDARIO HEATMAP INTERACTIVO)
           ========================================================== */}
        {activeTab === 'mensual' && (
          <div className="space-y-6">
            <div
              className={`rounded-2xl border p-6 ${
                darkMode
                  ? 'bg-slate-900/70 border-slate-800/90'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              {/* Cabecera del Mes */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Mapa de Calor Mensual
                  </span>
                  <h2 className="text-2xl font-extrabold mt-0.5">
                    {monthlyData.monthName} {monthlyData.year}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300">
                    Adherencia del mes: {monthlyData.monthlyAdherencePct}%
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                    Días Perfectos (100%): {monthlyData.perfectDaysCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setSelectedMonthDate((prev) => {
                          const d = new Date(prev.year, prev.month - 1, 1);
                          return { year: d.getFullYear(), month: d.getMonth() };
                        })
                      }
                      className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedMonthDate((prev) => {
                          const d = new Date(prev.year, prev.month + 1, 1);
                          return { year: d.getFullYear(), month: d.getMonth() };
                        })
                      }
                      className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cabecera Lunes a Domingo */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400">
                {DAYS_SHORT_ES.map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Cuadrícula de Días del Mes */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: monthlyData.startOffset }).map(
                  (_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="h-24 rounded-xl opacity-20"
                    />
                  )
                )}

                {monthlyData.daysArray.map((dayItem) => {
                  const isSelected = dayItem.dateStr === selectedDate;
                  let heatStyle = darkMode
                    ? 'bg-slate-950/80 border-slate-800/80'
                    : 'bg-slate-50 border-slate-200';

                  if (dayItem.pct === 100) {
                    heatStyle =
                      'bg-emerald-500/25 border-emerald-500/50 text-emerald-200 shadow-inner';
                  } else if (dayItem.pct >= 65) {
                    heatStyle =
                      'bg-indigo-500/25 border-indigo-500/40 text-indigo-200';
                  } else if (dayItem.pct >= 30) {
                    heatStyle = 'bg-violet-500/15 border-violet-500/30';
                  }

                  return (
                    <button
                      key={dayItem.dateStr}
                      onClick={() => {
                        setSelectedDate(dayItem.dateStr);
                        setActiveTab('diario');
                      }}
                      className={`h-24 p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer ${heatStyle} ${
                        isSelected ? 'ring-2 ring-indigo-400' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-extrabold">
                          {dayItem.dayNum}
                        </span>
                        {dayItem.pct > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              dayItem.pct === 100
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-indigo-500/30 text-indigo-300'
                            }`}
                          >
                            {dayItem.pct}%
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-[11px] font-medium opacity-85">
                          {dayItem.doneCount}/{dayItem.totalHabits} hábitos
                        </div>
                        {dayItem.weight && (
                          <div className="text-[10px] text-emerald-400 font-bold">
                            ⚖️ {dayItem.weight} kg
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            NIVEL 4: VISTA ANUAL (HEATMAP 365 DÍAS & ADHERENCIA 12 MESES)
           ========================================================== */}
        {activeTab === 'anual' && (
          <div className="space-y-6">
            {/* Tarjeta Superior Anual + Selector de Año */}
            <div
              className={`rounded-2xl border p-6 ${
                darkMode
                  ? 'bg-slate-900/70 border-slate-800/90'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Seguimiento Anual y Programas de 90/365 Días
                  </span>
                  <h2 className="text-2xl font-extrabold mt-0.5">
                    Balance Anual {annualData.year} — {activeClient?.name}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300">
                    Total Checks Año: {annualData.yearTotalChecks}
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                    Días Activos: {annualData.yearActiveDays} días
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedYear((y) => y - 1)}
                      className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      {selectedYear - 1}
                    </button>
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                      {selectedYear}
                    </span>
                    <button
                      onClick={() => setSelectedYear((y) => y + 1)}
                      className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      {selectedYear + 1}
                    </button>
                  </div>
                </div>
              </div>

              {/* Gráfico de Barras de los 12 Meses del Año */}
              <div className="h-64 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={annualData.monthsBreakdown}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={darkMode ? '#1e293b' : '#e2e8f0'}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: darkMode ? '#94a3b8' : '#64748b',
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: darkMode ? '#64748b' : '#94a3b8',
                        fontSize: 11,
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const m = payload[0].payload;
                          return (
                            <div className="p-3 rounded-xl border bg-slate-900 border-slate-700 text-xs text-white shadow-xl">
                              <p className="font-bold text-indigo-400">
                                {m.fullName} {annualData.year}
                              </p>
                              <p className="mt-1">
                                Adherencia Promedio:{' '}
                                <strong className="text-emerald-400">
                                  {m.adherencia}%
                                </strong>
                              </p>
                              <p className="text-slate-400">
                                {m.checks} objetivos cumplidos
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="adherencia" radius={[8, 8, 0, 0]}>
                      {annualData.monthsBreakdown.map((m, idx) => (
                        <Cell
                          key={idx}
                          fill={m.adherencia >= 75 ? '#10b981' : '#6366f1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Matriz Heatmap de los 12 Meses (365 Días) */}
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                Mapa de Constancia de 365 Días (Haz clic en cualquier día para
                abrir su registro)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {annualData.monthsBreakdown.map((m) => (
                  <div
                    key={m.monthIndex}
                    className={`p-4 rounded-2xl border ${
                      darkMode
                        ? 'bg-slate-950/60 border-slate-800/80'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-bold text-xs">{m.fullName}</span>
                      <span className="text-xs font-extrabold text-indigo-400">
                        {m.adherencia}%
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {m.dayCells.map((cell) => {
                        let bgClass = darkMode
                          ? 'bg-slate-800/70'
                          : 'bg-slate-200';
                        if (cell.pct === 100) bgClass = 'bg-emerald-400';
                        else if (cell.pct >= 65) bgClass = 'bg-indigo-500';
                        else if (cell.pct >= 30) bgClass = 'bg-violet-500/60';
                        else if (cell.pct > 0) bgClass = 'bg-indigo-900';

                        return (
                          <button
                            key={cell.dateStr}
                            onClick={() => {
                              setSelectedDate(cell.dateStr);
                              setActiveTab('diario');
                            }}
                            title={`${cell.dateStr}: ${cell.pct}% (${cell.done} hábitos)`}
                            className={`h-4 rounded-sm transition-transform hover:scale-125 cursor-pointer ${bgClass}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            NIVEL 5: GALERÍA DE PROGRESO FOTOGRÁFICO Y COMPARADOR ANTES/DESPUÉS
           ========================================================== */}
        {activeTab === 'fotos' && (
          <div className="space-y-6">
            {/* Cabecera de la Galería y Botón Comparador */}
            <div
              className={`rounded-2xl border p-6 ${
                darkMode
                  ? 'bg-slate-900/70 border-slate-800/90'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Evidencia Visual & Transformación Física
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold mt-0.5">
                    Galería de Progreso de {activeClient?.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Las fotografías se comprimen automáticamente y quedan
                    resguardadas en la sesión privada del cliente.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setCompareMode(!compareMode)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      compareMode
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : darkMode
                        ? 'bg-slate-950 border-slate-800 text-slate-200 hover:border-indigo-500'
                        : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>
                      {compareMode
                        ? 'Ocultar Comparador'
                        : 'Comparador Antes / Después'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setPhotoForm({
                        date: selectedDate,
                        category: 'Progreso Físico',
                        weight: activeClient?.currentWeight || '',
                        note: '',
                        imageData: '',
                      });
                      setIsPhotoModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Subir Nueva Foto</span>
                  </button>
                </div>
              </div>

              {/* COMPARADOR INTERACTIVO ANTES / DESPUÉS */}
              {compareMode && activeClientPhotos.length >= 1 && (
                <div
                  className={`mt-6 p-5 rounded-2xl border ${
                    darkMode
                      ? 'bg-slate-950/90 border-indigo-500/30'
                      : 'bg-indigo-50/40 border-indigo-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-400">
                      Comparativa Visual: Antes vs Después
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 mr-1.5">
                          Foto ANTES:
                        </span>
                        <select
                          value={beforePhotoId || ''}
                          onChange={(e) => setBeforePhotoId(e.target.value)}
                          className={`px-2.5 py-1.5 rounded-lg border font-semibold ${
                            darkMode
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          {activeClientPhotos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.date} — {p.category}{' '}
                              {p.weight ? `(${p.weight})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-slate-400 mr-1.5">
                          Foto DESPUÉS:
                        </span>
                        <select
                          value={afterPhotoId || ''}
                          onChange={(e) => setAfterPhotoId(e.target.value)}
                          className={`px-2.5 py-1.5 rounded-lg border font-semibold ${
                            darkMode
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          {activeClientPhotos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.date} — {p.category}{' '}
                              {p.weight ? `(${p.weight})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Vista lado a lado + Slider de superposición */}
                  {(() => {
                    const beforePhoto =
                      activeClientPhotos.find((p) => p.id === beforePhotoId) ||
                      activeClientPhotos[0];
                    const afterPhoto =
                      activeClientPhotos.find((p) => p.id === afterPhotoId) ||
                      activeClientPhotos[0];

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* Cortina interactiva Antes / Después */}
                        <div className="lg:col-span-7">
                          <div className="relative w-full h-96 rounded-2xl overflow-hidden border border-slate-700 select-none bg-slate-900">
                            <img
                              src={afterPhoto.imageData}
                              alt="Después"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div
                              className="absolute inset-y-0 left-0 overflow-hidden"
                              style={{ width: `${sliderPos}%` }}
                            >
                              <img
                                src={beforePhoto.imageData}
                                alt="Antes"
                                className="w-full h-96 object-cover max-w-none"
                                style={{ width: '100%' }}
                              />
                            </div>
                            {/* Línea divisoria */}
                            <div
                              className="absolute inset-y-0 w-1 bg-emerald-400 shadow-xl"
                              style={{ left: `${sliderPos}%` }}
                            />
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 text-white text-xs font-bold">
                              ANTES ({beforePhoto.date})
                            </span>
                            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold">
                              DESPUÉS ({afterPhoto.date})
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-xs text-slate-400">
                              Deslizar cortina:
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={sliderPos}
                              onChange={(e) =>
                                setSliderPos(Number(e.target.value))
                              }
                              className="w-full accent-emerald-400 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Tarjetas resumen del cambio */}
                        <div className="lg:col-span-5 space-y-4">
                          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                            <span className="text-[10px] font-bold uppercase text-indigo-400">
                              Punto de Partida (Antes)
                            </span>
                            <p className="font-bold text-sm mt-0.5">
                              Fecha: {beforePhoto.date} •{' '}
                              {beforePhoto.weight || 'Sin peso'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {beforePhoto.note || 'Sin notas adicionales'}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                            <span className="text-[10px] font-bold uppercase text-emerald-400">
                              Estado Reciente (Después)
                            </span>
                            <p className="font-bold text-sm mt-0.5">
                              Fecha: {afterPhoto.date} •{' '}
                              {afterPhoto.weight || 'Sin peso'}
                            </p>
                            <p className="text-xs text-slate-300 mt-1">
                              {afterPhoto.note || 'Sin notas adicionales'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Filtros por Categoría de Foto */}
              <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
                {['Todas', ...PHOTO_CATEGORIES.map((c) => c.id)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPhotoFilterCat(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border shrink-0 cursor-pointer ${
                      photoFilterCat === cat
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : darkMode
                        ? 'bg-slate-950 border-slate-800 text-slate-400'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Cuadrícula de Fotografías del Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {activeClientPhotos
                  .filter(
                    (p) =>
                      photoFilterCat === 'Todas' ||
                      p.category === photoFilterCat
                  )
                  .map((photo) => (
                    <div
                      key={photo.id}
                      className={`rounded-2xl border overflow-hidden flex flex-col justify-between group transition-all ${
                        darkMode
                          ? 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/50'
                          : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="relative h-72 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={photo.imageData}
                          alt={photo.category}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950/85 text-white backdrop-blur-md">
                            {photo.category}
                          </span>
                          {photo.weight && (
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500 text-slate-950">
                              {photo.weight}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => requestDeletePhoto(photo)}
                          className="absolute top-3 right-3 p-2 rounded-lg bg-slate-950/80 text-slate-300 hover:text-rose-400 cursor-pointer"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between text-xs text-indigo-400 font-bold mb-1">
                          <span>📅 {formatReadableDate(photo.date)}</span>
                        </div>
                        <p
                          className={`text-xs mt-1 ${
                            darkMode ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {photo.note || 'Registro visual de seguimiento Nexo.'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==========================================
          MODAL DE GESTIÓN DE SESIÓN PERSONAL DEL CLIENTE
         ========================================== */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-extrabold">
                  Sesión Personal del Cliente • Nexo Coaching
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsSessionModalOpen(false);
                  setPinPromptClient(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Si se solicita PIN para desbloquear un cliente */}
            {pinPromptClient ? (
              <form
                onSubmit={handleVerifyPin}
                className="my-6 p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-4"
              >
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Ingresa el PIN personal de {pinPromptClient.name}</span>
                </div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="PIN de 4 dígitos (Demo Sofía: 1234)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm outline-none"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 font-semibold">
                    {pinError}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPinPromptClient(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white cursor-pointer"
                  >
                    Desbloquear Sesión
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="mt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Seleccionar Cuenta de Cliente Existente
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clients.map((c) => {
                      const isCurrent = c.id === activeClientId;
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelectClientSession(c)}
                          className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            isCurrent
                              ? 'bg-indigo-600/20 border-indigo-500'
                              : darkMode
                              ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                              : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
                                c.avatarColor ||
                                'from-indigo-500 to-emerald-400'
                              } flex items-center justify-center text-white font-bold text-xs shrink-0`}
                            >
                              {c.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .substring(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm truncate flex items-center gap-1.5">
                                <span>{c.name}</span>
                                {c.pin && (
                                  <Lock className="w-3 h-3 text-amber-400" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {c.program}
                              </div>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                              Activa
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Crear Nuevo Perfil de Cliente */}
                <form
                  onSubmit={handleCreateClient}
                  className="mt-6 pt-6 border-t border-slate-800 space-y-4"
                >
                  <h4 className="text-sm font-bold text-indigo-400">
                    + Registrar Nuevo Cliente en Nexo Coaching
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">
                        Nombre completo del Cliente *
                      </label>
                      <input
                        type="text"
                        required
                        value={newClientForm.name}
                        onChange={(e) =>
                          setNewClientForm({
                            ...newClientForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Ej. Martín Rodríguez"
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                          darkMode
                            ? 'bg-slate-950 border-slate-800 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">
                        Meta o Programa Asignado
                      </label>
                      <input
                        type="text"
                        value={newClientForm.goal}
                        onChange={(e) =>
                          setNewClientForm({
                            ...newClientForm,
                            goal: e.target.value,
                          })
                        }
                        placeholder="Ej. Reto 90 Días Recomposición"
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                          darkMode
                            ? 'bg-slate-950 border-slate-800 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">
                        Peso Inicial (kg)
                      </label>
                      <input
                        type="text"
                        value={newClientForm.startWeight}
                        onChange={(e) =>
                          setNewClientForm({
                            ...newClientForm,
                            startWeight: e.target.value,
                          })
                        }
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                          darkMode
                            ? 'bg-slate-950 border-slate-800 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">
                        PIN de Privacidad (Opcional)
                      </label>
                      <input
                        type="password"
                        value={newClientForm.pin}
                        onChange={(e) =>
                          setNewClientForm({
                            ...newClientForm,
                            pin: e.target.value,
                          })
                        }
                        placeholder="Dejar vacío o 4 dígitos"
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                          darkMode
                            ? 'bg-slate-950 border-slate-800 text-white'
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white cursor-pointer"
                    >
                      Crear Cuenta y Abrir Sesión
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL DE SUBIR FOTOGRAFÍA DE PROGRESO
         ========================================== */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold">
                  Subir Foto de Progreso / Evidencia
                </h3>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="mt-5 space-y-4">
              {/* Selector de archivo con vista previa */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                {photoForm.imageData ? (
                  <div className="relative h-56 w-full rounded-2xl overflow-hidden border border-slate-700">
                    <img
                      src={photoForm.imageData}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/85 text-white text-xs font-bold"
                    >
                      Cambiar imagen
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      darkMode
                        ? 'border-slate-700 hover:border-emerald-400 bg-slate-950/50'
                        : 'border-slate-300 hover:border-indigo-500 bg-slate-50'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-emerald-400" />
                    <span className="text-xs font-bold">
                      {isUploadingPhoto
                        ? 'Comprimiendo y optimizando imagen...'
                        : 'Haz clic para elegir una foto desde tu dispositivo'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Compresión inteligente automática para guardado rápido en
                      la nube
                    </span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={photoForm.date}
                    onChange={(e) =>
                      setPhotoForm({ ...photoForm, date: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Clasificación
                  </label>
                  <select
                    value={photoForm.category}
                    onChange={(e) =>
                      setPhotoForm({ ...photoForm, category: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {PHOTO_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Peso (kg opcional)
                  </label>
                  <input
                    type="text"
                    value={photoForm.weight}
                    onChange={(e) =>
                      setPhotoForm({ ...photoForm, weight: e.target.value })
                    }
                    placeholder="Ej. 76.8"
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Comentario o nota de la evidencia
                </label>
                <input
                  type="text"
                  value={photoForm.note}
                  onChange={(e) =>
                    setPhotoForm({ ...photoForm, note: e.target.value })
                  }
                  placeholder="Ej. Fin de la semana 4 en ayunas / Comida post-entreno..."
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!photoForm.imageData}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 disabled:opacity-40 cursor-pointer"
                >
                  Guardar Evidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL DE CREAR / EDITAR HÁBITO
         ========================================== */}
      {isHabitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold">
                {editingHabit
                  ? 'Editar Hábito del Cliente'
                  : 'Nuevo Hábito Diario'}
              </h3>
              <button
                onClick={() => setIsHabitModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHabit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Nombre del Hábito *
                </label>
                <input
                  type="text"
                  required
                  value={habitForm.name}
                  onChange={(e) =>
                    setHabitForm({ ...habitForm, name: e.target.value })
                  }
                  placeholder="Ej. Caminata 10.000 pasos, Movilidad, Lectura..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Categoría
                  </label>
                  <select
                    value={habitForm.category}
                    onChange={(e) =>
                      setHabitForm({ ...habitForm, category: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {Object.keys(CATEGORIES).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Meta Diaria
                  </label>
                  <input
                    type="text"
                    value={habitForm.target}
                    onChange={(e) =>
                      setHabitForm({ ...habitForm, target: e.target.value })
                    }
                    placeholder="Ej. 45 min, 3 Litros"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                  Ícono
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((item) => {
                    const IconComp = item.component;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() =>
                          setHabitForm({ ...habitForm, icon: item.id })
                        }
                        className={`p-2.5 rounded-xl flex items-center justify-center border cursor-pointer ${
                          habitForm.icon === item.id
                            ? 'bg-indigo-600 text-white border-indigo-400'
                            : darkMode
                            ? 'bg-slate-950 border-slate-800 text-slate-400'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsHabitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white cursor-pointer"
                >
                  Guardar Hábito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL DE CONFIRMACIÓN PERSONALIZADO
         ========================================== */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h4 className="text-base font-bold">{confirmDialog.title}</h4>
            <p className="text-xs text-slate-400 mt-2">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() =>
                  setConfirmDialog({
                    isOpen: false,
                    title: '',
                    message: '',
                    onConfirm: null,
                  })
                }
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL COACH: CREAR / EDITAR EJERCICIO DE LA RUTINA
         ========================================== */}
      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-extrabold">
                {editingExercise
                  ? 'Editar Ejercicio de la Rutina'
                  : `Nuevo Ejercicio para ${activeWorkoutDay?.dayLabel}`}
              </h3>
              <button
                onClick={() => setIsExerciseModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExerciseCoach} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Nombre del Ejercicio *
                </label>
                <input
                  type="text"
                  required
                  value={exerciseForm.name}
                  onChange={(e) =>
                    setExerciseForm({ ...exerciseForm, name: e.target.value })
                  }
                  placeholder="Ej. Sentadilla Búlgara con Mancuernas"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Series
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={exerciseForm.sets}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, sets: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Reps / Tiempo
                  </label>
                  <input
                    type="text"
                    value={exerciseForm.reps}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, reps: e.target.value })
                    }
                    placeholder="8-10"
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Pausa (seg)
                  </label>
                  <input
                    type="number"
                    value={exerciseForm.rest}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, rest: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    RIR / RPE
                  </label>
                  <input
                    type="text"
                    value={exerciseForm.rir}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, rir: e.target.value })
                    }
                    placeholder="RIR 2"
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Peso Objetivo Sugerido (kg)
                  </label>
                  <input
                    type="text"
                    value={exerciseForm.targetWeight}
                    onChange={(e) =>
                      setExerciseForm({
                        ...exerciseForm,
                        targetWeight: e.target.value,
                      })
                    }
                    placeholder="Ej. 40"
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Notas Técnicas del Coach
                  </label>
                  <input
                    type="text"
                    value={exerciseForm.notes}
                    onChange={(e) =>
                      setExerciseForm({
                        ...exerciseForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Ej. Pausa de 1s abajo, controlar excéntrica"
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExerciseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white cursor-pointer"
                >
                  Guardar Ejercicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL COACH: AÑADIR NUEVO DÍA/SESIÓN AL PLAN
         ========================================== */}
      {isWorkoutDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-extrabold">
                Añadir Día de Entrenamiento
              </h3>
              <button
                onClick={() => setIsWorkoutDayModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddWorkoutDayCoach}
              className="mt-4 space-y-3.5"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Etiqueta del Día
                  </label>
                  <input
                    type="text"
                    value={workoutDayForm.dayLabel}
                    onChange={(e) =>
                      setWorkoutDayForm({
                        ...workoutDayForm,
                        dayLabel: e.target.value,
                      })
                    }
                    placeholder="Día 4"
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Duración Estimada
                  </label>
                  <input
                    type="text"
                    value={workoutDayForm.durationEst}
                    onChange={(e) =>
                      setWorkoutDayForm({
                        ...workoutDayForm,
                        durationEst: e.target.value,
                      })
                    }
                    placeholder="50 min"
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Título de la Sesión *
                </label>
                <input
                  type="text"
                  required
                  value={workoutDayForm.title}
                  onChange={(e) =>
                    setWorkoutDayForm({
                      ...workoutDayForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Ej. Full Body + Kettlebell Conditioning"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Enfoque Principal
                </label>
                <input
                  type="text"
                  value={workoutDayForm.focus}
                  onChange={(e) =>
                    setWorkoutDayForm({
                      ...workoutDayForm,
                      focus: e.target.value,
                    })
                  }
                  placeholder="Ej. Potencia y Estabilidad"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Indicaciones del Coach para el Calentamiento / Sesión
                </label>
                <textarea
                  rows={2}
                  value={workoutDayForm.coachNotes}
                  onChange={(e) =>
                    setWorkoutDayForm({
                      ...workoutDayForm,
                      coachNotes: e.target.value,
                    })
                  }
                  className={`w-full p-3 rounded-xl text-xs border outline-none resize-none ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsWorkoutDayModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 cursor-pointer"
                >
                  Crear Día de Rutina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL DE SEGURIDAD: INGRESAR CLAVE MAESTRA DEL COACH
         ========================================== */}
      {isCoachPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">
                    Acceso Exclusivo Entrenadores
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Protección para subir o editar rutinas de Nexo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCoachPinModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyCoachPin} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Ingresá la Clave Maestra de Coach
                </label>
                <input
                  type="password"
                  autoFocus
                  value={coachPinInput}
                  onChange={(e) => setCoachPinInput(e.target.value)}
                  placeholder="Clave por defecto: 2026 o NEXO"
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold border outline-none ${
                    darkMode
                      ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                  }`}
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  💡 Clave inicial predeterminada:{' '}
                  <strong className="text-amber-400">2026</strong> (podés
                  cambiarla una vez adentro).
                </p>
              </div>

              {coachPinError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{coachPinError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCoachPinModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Desbloquear Modo Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
