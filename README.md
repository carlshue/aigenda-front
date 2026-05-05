# Genda Frontend

Interfaz moderna de usuario para **AiGenda** — sistema de memoria personal estructurada impulsado por LLM.

El usuario interactúa con el sistema escribiendo en lenguaje natural. El frontend captura, formatea y visualiza la información; el backend (AiGenda) la estructura, almacena y consulta automáticamente.

## Qué es Genda

Genda es tu **asistente de memoria**. Escribe cualquier cosa:
- **Ingest**: "Le debo 50€ a Juan" → el sistema guarda la deuda, detecta entidades (Juan, Amount) y relaciones (OWES)
- **Query**: "¿Cuánto le debo?" → el LLM planifica búsquedas, recupera datos y sintetiza una respuesta
- **Generate**: "Dame los pronombres en alemán" → el LLM genera contenido estructurado y lo almacena

## Stack

- **Next.js 16** — framework React con SSR y API routes
- **React 19** — UI componentes
- **TypeScript** — type safety
- **Tailwind CSS 4** — utilidades de estilos
- **Recharts** — gráficos y visualización de datos
- **FastAPI Backend** — inteligencia y persistencia

## Setup

### Requisitos previos
- Node.js 20+ y npm
- Backend AiGenda corriendo en `http://localhost:8000`

### Instalación

```bash
# 1. Clonar/navegar a carpeta
cd genda_front

# 2. Instalar dependencias
npm install

# 3. Variables de entorno (crear .env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000

# 4. Ejecutar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del proyecto

```
genda_front/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout root con estilos globales
│   ├── globals.css              # Temas (light/dark) y variables CSS
│   └── (protected)/
│       └── chat/
│           ├── page.tsx         # Página principal del chat
│           └── layout.tsx       # Layout protegido
├── components/
│   ├── ChatWindow.tsx           # Componente principal: chat bidireccional
│   └── ...
├── lib/
│   ├── api.ts                   # Cliente HTTP para comunicar con backend
│   ├── chat-context.tsx         # Context API: estado de mensajes y contexto
│   ├── useIsMobile.tsx          # Hook para detectar dispositivo
│   └── ...
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Componentes clave

### ChatWindow.tsx
Centro neurálgico de la interfaz. Gestiona:
- **Entrada de usuario** (textarea con auto-expand, speech-to-text vía Web Speech API)
- **Renderizado de mensajes** (user bubbles, assistant responses, error states)
- **Tres tipos de respuestas**:
  - **Ingest**: muestra entidades creadas/actualizadas y relaciones
  - **Query**: respuesta sintetizada + confianza + datos relacionados
  - **Error**: muestra errores del backend
- **Auto-scroll** al último mensaje
- **Loading states** con typing indicator

### Context (chat-context.tsx)
- Mantiene historial de mensajes
- Construye "context window" (últimos N caracteres del chat) para enviar al backend
- Maneja serialización de respuestas para contexto futuro

### API Client (api.ts)
- Funciones tipadas para comunicar con backend
- Manejo de errores y tokens
- Tipos TypeScript de todas las respuestas

## Características

### 1. Chat natural
Escribe en lenguaje natural. El sistema entiende si es:
- **Información para guardar** (ingest) → estructura automáticamente
- **Pregunta** (query) → busca y sintetiza respuesta
- **Solicitud de contenido** (generate) → crea basado en su conocimiento

### 2. Formato de texto
- `**texto**` para **negrita**
- Saltos de línea se preservan automáticamente

### 3. Responsivo
- Interfaz adaptada a móvil
- Botón de habla integrado
- Teclados y tamaños optimizados

### 4. Speech-to-text
Botón micrófono para dictar (Web Speech API, Chrome/Edge).

### 5. Visualización de datos
- Entidades creadas/actualizadas con esquema
- Relaciones (facts) con confianza
- Datos en formato JSON formateado

## Flujo de uso

```
Usuario escribe texto
        ↓
ChatWindow captura
        ↓
POST /chat → Backend
        ↓
Backend retorna (intent + data)
        ↓
Frontend renderiza respuesta
        ↓
Mensaje se agrega al contexto
```

## Configuración

### Temas (Light/Dark)
Soportados automáticamente. Variables CSS en `globals.css`.

### Responsive breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Desarrollo

### Scripts

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build producción
npm start         # Ejecutar build
npm run lint      # ESLint
```

### Debugging

- **Network**: DevTools → Network tab, filtra por `localhost:8000`
- **Context**: Revisa `lib/chat-context.tsx` para ver qué contexto se envía
- **Tipos**: Todos en `lib/api.ts`

## Troubleshooting

**"Connection refused"**
- Backend no está corriendo en `http://localhost:8000`

**"Speech recognition not available"**
- Solo funciona en navegadores que soportan Web Speech API (Chrome, Edge)

**Mensajes sin saltos de línea**
- Verifica que `whiteSpace: "pre-wrap"` está en los estilos

## Licencia

Parte del proyecto AiGenda.