# Componentes UI

Esta carpeta contiene componentes de interfaz de usuario reutilizables para la aplicación Cubusfera.

## StatusMessage

Componente reutilizable para mostrar mensajes de estado, errores, advertencias e información al usuario.

### Características

- ✅ **Múltiples tipos**: error, offline, info, warning
- ✅ **Detección automática**: Detecta automáticamente si es un error de servidor offline
- ✅ **Colores adaptativos**: Esquemas de color diferentes para modo claro y oscuro
- ✅ **Iconos contextuales**: Icono diferente según el tipo de mensaje
- ✅ **Texto de ayuda**: Mensaje adicional configurable
- ✅ **Totalmente personalizable**: Props para personalizar título, mensaje y estilos

### Versiones Disponibles

- **StatusMessage.astro**: Para componentes Astro
- **StatusMessage.tsx**: Para componentes React

### Props

```typescript
interface StatusMessageProps {
  type?: 'error' | 'offline' | 'info' | 'warning';  // Tipo de mensaje (default: 'error')
  title?: string;                                    // Título personalizado (opcional)
  message: string;                                   // Mensaje principal (requerido)
  showHelpText?: boolean;                           // Mostrar texto de ayuda (default: false)
  helpText?: string;                                // Texto de ayuda personalizado (opcional)
  className?: string;                               // Clases CSS adicionales (opcional)
}
```

### Uso en Componentes Astro

```astro
---
import StatusMessage from './ui/StatusMessage.astro';
---

<!-- Error genérico -->
<StatusMessage
  type="error"
  title="Error al cargar datos"
  message="No se pudo conectar con el servidor"
/>

<!-- Servidor offline (detectado automáticamente) -->
<StatusMessage
  type="offline"
  message="El servidor de Minecraft está temporalmente desconectado. Intenta de nuevo más tarde."
/>

<!-- Con detección automática basada en el mensaje -->
<StatusMessage
  message="El servidor está temporalmente desconectado"
/>

<!-- Advertencia -->
<StatusMessage
  type="warning"
  title="Atención"
  message="Los datos pueden estar desactualizados"
/>

<!-- Información -->
<StatusMessage
  type="info"
  message="La actualización se completó correctamente"
/>
```

### Uso en Componentes React/TSX

```tsx
import StatusMessage from './ui/StatusMessage';

// Error genérico
<StatusMessage
  type="error"
  title="Error al cargar datos"
  message="No se pudo conectar con el servidor"
/>

// Servidor offline
<StatusMessage
  type="offline"
  message="El servidor de Minecraft está temporalmente desconectado. Intenta de nuevo más tarde."
/>

// Con detección automática
<StatusMessage
  message={error.includes("servidor") ? error : `Error: ${error}`}
/>
```

### Esquema de Colores

#### Servidor Offline (Azul)
- **Modo Claro**: Fondo azul suave con texto azul oscuro
- **Modo Oscuro**: Fondo azul oscuro con texto azul claro
- **Icono**: Rayo/conexión

#### Error (Rojo)
- **Modo Claro**: Fondo rojo suave con texto rojo oscuro
- **Modo Oscuro**: Fondo rojo oscuro con texto rojo claro
- **Icono**: Círculo con exclamación

#### Warning (Amarillo)
- **Modo Claro**: Fondo amarillo suave con texto amarillo oscuro
- **Modo Oscuro**: Fondo amarillo oscuro con texto amarillo claro
- **Icono**: Triángulo con exclamación

#### Info (Azul)
- **Modo Claro**: Fondo azul suave con texto azul oscuro
- **Modo Oscuro**: Fondo azul oscuro con texto azul claro
- **Icono**: Círculo con "i"

### Detección Automática

El componente detecta automáticamente si un error es de servidor offline basándose en:

1. El tipo explícito: `type="offline"`
2. El contenido del mensaje: si incluye las palabras "servidor" o "desconectado"

Cuando se detecta como offline:
- Usa el esquema de colores azul
- Título por defecto: "Servidor desconectado"
- Añade automáticamente el texto de ayuda: "💡 Esto es normal cuando el servidor está apagado. La web funciona correctamente."

### Personalización

```astro
<!-- Con clases CSS personalizadas -->
<StatusMessage
  type="info"
  message="Mensaje importante"
  className="max-w-2xl mx-auto"
/>

<!-- Con texto de ayuda personalizado -->
<StatusMessage
  type="warning"
  message="Los datos pueden estar desactualizados"
  showHelpText={true}
  helpText="Por favor, recarga la página en unos minutos"
/>
```

### Ejemplos de Uso en el Proyecto

#### DynamicTopsSelector.tsx
```tsx
<StatusMessage
  type={error.includes("servidor") ? "offline" : "error"}
  message={error}
  title={error.includes("servidor") ? undefined : "Error al cargar ranking"}
/>
```

#### PlayerStats.astro
```astro
<StatusMessage
  type={error.includes('servidor') || error.includes('desconectado') ? 'offline' : 'error'}
  message={error}
  title={error.includes('servidor') || error.includes('desconectado') ? undefined : 'Error al cargar estadísticas'}
/>
```

#### MembersList.astro
```astro
<StatusMessage
  type={isServerOffline ? 'offline' : 'error'}
  message={error}
  title={isServerOffline ? undefined : 'Error al cargar miembros'}
/>
```

### Ventajas

1. **DRY (Don't Repeat Yourself)**: Código reutilizable en toda la aplicación
2. **Consistencia**: Todos los mensajes de error se ven y funcionan igual
3. **Mantenibilidad**: Cambios en un solo lugar afectan a toda la app
4. **Accesibilidad**: Colores optimizados para legibilidad en ambos modos
5. **UX Mejorada**: Mensajes claros y amigables para el usuario

### Notas

- El componente usa Tailwind CSS para los estilos
- Los colores están optimizados para modo claro y oscuro
- El texto de ayuda para servidor offline se añade automáticamente
- Compatible con SSR (Server-Side Rendering) de Astro