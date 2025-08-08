# Configuración del Newsletter con Resend

## Configuración Inicial

### 1. Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las siguientes variables:

```bash
# Resend Configuration
RESEND_API_KEY=your_resend_api_key_here
RESEND_AUDIENCE_ID=your_audience_id_here
```

### 2. Obtener API Key de Resend

1. Ve a [Resend](https://resend.com) y regístrate/inicia sesión
2. Ve a [API Keys](https://resend.com/api-keys) 
3. Crea una nueva API key
4. Copia la API key y pégala en `RESEND_API_KEY`

### 3. Crear un Audience

1. Ve a [Audiences](https://resend.com/audiences)
2. Crea un nuevo audience para tu newsletter
3. Copia el ID del audience y pégalo en `RESEND_AUDIENCE_ID`

## Funcionalidad Implementada

### API Route
- **Endpoint**: `/api/subscribe`
- **Método**: POST
- **Body**: FormData con campo `email`
- **Respuestas**:
  - 200: Suscripción exitosa
  - 400: Email inválido o faltante
  - 409: Email ya suscrito
  - 500: Error del servidor

### Formulario
- Validación del lado del cliente
- Estados de carga
- Manejo de errores
- Mensajes de confirmación
- Estilo consistente con el tema

## Despliegue

### Vercel
El proyecto está configurado para funcionar automáticamente en Vercel. Solo asegúrate de configurar las variables de entorno en el dashboard de Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade `RESEND_API_KEY` y `RESEND_AUDIENCE_ID`

### Netlify
Para Netlify, las variables de entorno se configuran de manera similar:

1. Ve a tu sitio en Netlify
2. Site settings → Environment variables
3. Añade `RESEND_API_KEY` y `RESEND_AUDIENCE_ID`

## Desarrollo Local

Para probar localmente:

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

# El formulario estará disponible en la página principal
# y enviará datos a http://localhost:3000/api/subscribe
```

## Estructura de Archivos

```
src/
├── pages/
│   ├── api/
│   │   └── subscribe.ts          # API route para newsletter
│   └── index.astro               # Página principal con formulario
└── ...
```

## Funcionalidades del Newsletter

- ✅ Validación de email del lado del cliente
- ✅ Validación de email del lado del servidor
- ✅ Integración con Resend
- ✅ Manejo de duplicados
- ✅ Estados de carga y error
- ✅ Mensajes de confirmación
- ✅ Compatible con modo servidor de Astro
- ✅ Listo para producción (Vercel/Netlify)

## Próximos Pasos

Para enviar newsletters, puedes:

1. Usar la interfaz web de Resend
2. Crear API routes adicionales para enviar emails
3. Integrar con herramientas de automatización

## Troubleshooting

### Error "Configuración del servidor incompleta"
- Verifica que `RESEND_API_KEY` y `RESEND_AUDIENCE_ID` estén configuradas
- Asegúrate de que las variables no tengan espacios extra

### Error "Contact already exists"
- El email ya está suscrito al newsletter
- Es un comportamiento esperado y manejado correctamente

### Error de conexión
- Verifica tu conexión a internet
- Confirma que la API key de Resend sea válida
