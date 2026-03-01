# ProyectoUnidad1 - To-Do List App

Proyecto universitario: Una Single Page Application (SPA) moderna desarrollada con React, Tailwind CSS y Supabase, con sincronización en tiempo real.

## 🚀 Características

- **Autenticación**: Registro e inicio de sesión seguro con Supabase Auth.
- **Gestión de Tareas**: Crear, editar, marcar como completadas y eliminar tareas.
- **Tiempo Real**: Los cambios se sincronizan instantáneamente entre dispositivos usando Supabase Realtime.
- **Dashboard**: Estadísticas en tiempo real (Total, Pendientes, Completadas).
- **Filtros y Búsqueda**: Filtra por estado (Todas, Pendientes, Completadas) y busca por título o descripción.
- **Diseño Premium**: Interfaz responsiva, limpia y moderna con animaciones fluidas (Framer Motion).

## 🛠️ Tecnologías

- **Frontend**: React (Vite)
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Animaciones**: Framer Motion
- **Backend/DB**: Supabase

## ⚙️ Configuración del Proyecto

### 1. Clonar e Instalar
```bash
git clone <url-del-repositorio>
cd ProyectoUnidad1
npm install
```

### 2. Configuración de Supabase
Debes configurar tu propio proyecto en [Supabase](https://supabase.com/):

1. **Crear la tabla `tasks`**:
   Ejecuta el siguiente SQL en el editor de SQL de Supabase:
   ```sql
   create table tasks (
     id bigint primary key generated always as identity,
     user_id uuid references auth.users not null,
     title text not null,
     description text,
     completed boolean default false,
     category text,
     created_at timestamp with time zone default now()
   );

   -- Habilitar RLS
   alter table tasks enable row level security;

   -- Crear políticas
   create policy "Users can only see their own tasks" on tasks
     for select using (auth.uid() = user_id);

   create policy "Users can only insert their own tasks" on tasks
     for insert with check (auth.uid() = user_id);

   create policy "Users can only update their own tasks" on tasks
     for update using (auth.uid() = user_id);

   create policy "Users can only delete their own tasks" on tasks
     for delete using (auth.uid() = user_id);
   ```

2. **Habilitar Realtime**:
   En el panel de Supabase, ve a `Database -> Replication` y asegúrate de que la tabla `tasks` esté seleccionada en la publicación `supabase_realtime` o habilita Realtime para la tabla.

3. **Variables de Entorno**:
   Crea un archivo `.env` basado en `.env.example` y añade tus credenciales:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Ejecutar Localmente
```bash
npm run dev
```

## 📱 Responsividad
La aplicación está optimizada para dispositivos móviles, tablets y escritorio.

## 📄 Notas Adicionales
- Se implementó Row Level Security (RLS) para proteger los datos de los usuarios.
- Se agregaron categorías y filtros para una mejor organización.
