const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Permite Netlify en producción o todo por ahora
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Test Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState
    });
});

// Schemas
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // En producción: hashear contraseña
    role: { type: String, enum: ['admin', 'entrenador'], default: 'entrenador' },
    nombre: { type: String }
});

const RutinaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    contenido: { type: String, required: true }, // Texto plano
    entrenador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const MembresiaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    diasPorSemana: { type: Number }
});

const PagoSchema = new mongoose.Schema({
    fecha: { type: Date, required: true },
    tipo: { type: String, required: true }, // 'efectivo', 'transferencia', 'otros'
    membresia: {
        nombre: { type: String },
        precio: { type: Number }
    },
    monto: { type: Number }
});

const AlumnoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    fechaRegistro: { type: Date, default: Date.now },
    estado: { type: String, default: 'activo' },
    historialPagos: [PagoSchema],
    entrenador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Link al entrenador
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Alumno = mongoose.model('Alumno', AlumnoSchema);
const Rutina = mongoose.model('Rutina', RutinaSchema);
const Membresia = mongoose.model('Membresia', MembresiaSchema);

// --- API Routes ---

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Buscamos usuario por nombre y contraseña (texto plano por ahora)
        const user = await User.findOne({ username, password });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // Retornamos el usuario (sin password idealmente, pero para simpleza lo enviamos todo o filtramos)
        res.json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                nombre: user.nombre
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE USER
app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET ALL USERS
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Excluir password
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE USER
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Si no se envía password, no lo actualizamos
        if (!updateData.password) {
            delete updateData.password;
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET Entrenadores con sus Alumnos (Vista Admin)
app.get('/api/entrenadores', async (req, res) => {
    try {
        const entrenadores = await User.find({ role: 'entrenador' });

        // Para simplificar, hacemos un "join" manual o usamos aggregate
        // Aquí recuperamos los alumnos de cada entrenador
        const reporte = await Promise.all(entrenadores.map(async (entrenador) => {
            const alumnos = await Alumno.find({ entrenador: entrenador._id });
            return {
                ...entrenador.toObject(),
                alumnos: alumnos
            };
        }));

        res.json(reporte);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Alumnos (Filtrado por entrenador si se pasa ?entrenadorId=...)
app.get('/api/alumnos', async (req, res) => {
    try {
        const filter = {};
        if (req.query.entrenadorId) {
            filter.entrenador = req.query.entrenadorId;
        }
        const alumnos = await Alumno.find(filter).sort({ createdAt: -1 });
        res.json(alumnos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE Alumno (Asignado a un entrenador)
app.post('/api/alumnos', async (req, res) => {
    try {
        // req.body debe incluir 'entrenador' (ID)
        const nuevoAlumno = new Alumno(req.body);
        const savedAlumno = await nuevoAlumno.save();
        res.status(201).json(savedAlumno);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE Alumno
app.delete('/api/alumnos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Alumno.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Alumno no encontrado' });
        res.json({ message: 'Alumno eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- MEMBERSHIP ROUTES ---
app.get('/api/membresias', async (req, res) => {
    try {
        const memberships = await Membresia.find();
        res.json(memberships);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/membresias', async (req, res) => {
    try {
        const newMembresia = new Membresia(req.body);
        const saved = await newMembresia.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/membresias/:id', async (req, res) => {
    try {
        const updated = await Membresia.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/membresias/:id', async (req, res) => {
    try {
        await Membresia.findByIdAndDelete(req.params.id);
        res.json({ message: 'Membresia eliminada' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// CREATE Rutina

// ADD Payment
app.post('/api/alumnos/:id/pagos', async (req, res) => {
    try {
        const { id } = req.params;
        const pago = req.body;

        const alumno = await Alumno.findByIdAndUpdate(
            id,
            { $push: { historialPagos: pago } },
            { new: true }
        );

        if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });

        res.json(alumno);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
