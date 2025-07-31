import { defineCollection, z } from 'astro:content';

const proyectosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    imagen: z.string(),
    etiquetas: z.array(z.string()),
    dimension: z.enum(['Overworld', 'Nether', 'End']),
    coordenadas: z.object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    }),
    constructores: z.array(z.object({
      nombre: z.string(),
    })),
    granja: z.object({
      bots: z.array(z.object({
        nombre: z.string(),
        comando: z.string(),
      })),
      instrucciones: z.string(),
    }).optional(),
    video: z.string().optional(),
    mapa: z.string().optional(),
  }),
});

export const collections = {
  proyectos: proyectosCollection,
};