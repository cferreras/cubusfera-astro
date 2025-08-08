import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Configurar Resend
const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verificar que tenemos las variables de entorno necesarias
    if (!import.meta.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY no está configurada');
      return new Response(JSON.stringify({
        success: false,
        error: 'Configuración del servidor incompleta'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    if (!import.meta.env.RESEND_AUDIENCE_ID) {
      console.error('RESEND_AUDIENCE_ID no está configurada');
      return new Response(JSON.stringify({
        success: false,
        error: 'Configuración del servidor incompleta'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Obtener datos del formulario
    const formData = await request.formData();
    const email = formData.get('email');

    // Validar que el email sea un string y no esté vacío
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email es requerido'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Formato de email inválido'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Añadir contacto al audience de Resend
    try {
      const result = await resend.contacts.create({
        email: email.trim(),
        audienceId: import.meta.env.RESEND_AUDIENCE_ID,
        // Puedes añadir campos adicionales si los necesitas
        firstName: '', // Opcional
        lastName: '',  // Opcional
        unsubscribed: false
      });

      console.log('Contacto añadido a Resend:', result);

      return new Response(JSON.stringify({
        success: true,
        message: '¡Te has suscrito exitosamente al newsletter!'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });

    } catch (resendError: any) {
      console.error('Error de Resend:', resendError);
      
      // Manejar errores específicos de Resend
      if (resendError.message?.includes('Contact already exists')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Este email ya está suscrito al newsletter'
        }), {
          status: 409,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      return new Response(JSON.stringify({
        success: false,
        error: 'Error al procesar la suscripción. Inténtalo de nuevo.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('Error general en /api/subscribe:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Error interno del servidor'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
