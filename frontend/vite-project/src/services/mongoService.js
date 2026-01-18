const API_URL = 'http://localhost:3000/api';

export const MongoService = {
    async login(username, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await response.json();
        } catch (error) {
            console.error("Login API Error:", error);
            throw error;
        }
    },

    async getEntrenadores() {
        try {
            const response = await fetch(`${API_URL}/entrenadores`);
            if (!response.ok) throw new Error('Error al obtener entrenadores');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    async createEntrenador(entrenadorData) {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entrenadorData)
            });
            if (!response.ok) throw new Error('Error al crear entrenador');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    async getUsuarios() {
        try {
            const response = await fetch(`${API_URL}/users`);
            if (!response.ok) throw new Error('Error al obtener usuarios');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    async updateUsuario(userId, updateData) {
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            if (!response.ok) throw new Error('Error al actualizar usuario');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    async getMembresias() {
        try {
            const response = await fetch(`${API_URL}/membresias`);
            if (!response.ok) throw new Error('Error al obtener membresías');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    async createMembresia(data) {
        try {
            const response = await fetch(`${API_URL}/membresias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al crear membresía');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    async updateMembresia(id, data) {
        try {
            const response = await fetch(`${API_URL}/membresias/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al actualizar membresía');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    async deleteMembresia(id) {
        try {
            const response = await fetch(`${API_URL}/membresias/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar membresía');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    async getAlumnos(entrenadorId = null) {
        try {
            let url = `${API_URL}/alumnos`;
            if (entrenadorId) {
                url += `?entrenadorId=${entrenadorId}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al obtener alumnos');
            // Normalize _id to id for frontend compatibility if needed, though Vue handles _id fine usually
            const data = await response.json();
            return data.map(alumno => ({
                ...alumno,
                id: alumno._id // Ensure we have an id property for existing components
            }));
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    },

    async createAlumno(alumno) {
        try {
            const response = await fetch(`${API_URL}/alumnos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alumno)
            });
            if (!response.ok) throw new Error('Error al crear alumno');
            const saved = await response.json();
            return { ...saved, id: saved._id };
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    async addPago(alumnoId, pago) {
        try {
            // Backend expects :id in URL
            const response = await fetch(`${API_URL}/alumnos/${alumnoId}/pagos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pago)
            });
            if (!response.ok) throw new Error('Error al registrar pago');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    async deleteAlumno(id) {
        try {
            const response = await fetch(`${API_URL}/alumnos/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar alumno');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }
};
