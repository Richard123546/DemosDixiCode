# DixiCode · Demos

Sitio de demos comerciales de DixiCode para mostrar a dueños de pequeños negocios en Costa Rica,
desde el celular o la PC. No tiene backend ni login: los datos son de ejemplo y las acciones
(agendar, cobrar, vender) funcionan en memoria mientras la página está abierta.

| Ruta        | Demo                                   |
| ----------- | -------------------------------------- |
| `/`         | Portada con los 3 demos y "Hablemos"   |
| `/salon`    | Studio Valeria – inicio, agenda, caja, clientas y servicios |
| `/soda`     | Soda La Esquina – inicio, mesas, pedidos, cocina y cierre   |
| `/boutique` | Boutique Amara – inicio, inventario, venta, alertas y reportes |

Cada demo abre en **Inicio** (resumen del día con indicadores y mini gráfico) y comparte:

- Estilo visual a elegir en el menú ⋯: Moderno claro, Oscuro elegante o Color de marca (se recuerda en el navegador).
- Buscador rápido con la lupa o Ctrl K.
- Comprobante de venta imprimible y para compartir por WhatsApp, y vista previa de mensajes de WhatsApp simulados.
- "Exportar a Excel" (CSV) en Caja, Cierre y Reportes.
- Tour de bienvenida de 3 pasos la primera vez y "Reiniciar demo" en el menú ⋯.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # compila a dist/
npm run preview  # sirve dist/ para probar el build
npm run lint
```

Requiere Node 20.19 o superior (recomendado 22).

## Dónde cambiar cosas

- Número y mensaje de WhatsApp: `src/data/contact.ts`
- Nombre, color, teléfono y secciones de cada demo: `src/data/demos.ts`
- Temas y colores del modo oscuro: `src/index.css` y `src/components/layout/theme.ts`
- Textos de los mensajes de WhatsApp y comprobantes: `src/demos/*/share.ts`
- Datos de ejemplo: `src/data/salon.ts`, `src/data/soda.ts`, `src/data/boutique.ts`
- Íconos de la app y vista previa al compartir: `public/`

## Publicación

Se publica en Vercel como sitio estático. `vercel.json` redirige todas las rutas a `index.html`
para que funcionen los enlaces directos (por ejemplo `/soda/cocina`).
