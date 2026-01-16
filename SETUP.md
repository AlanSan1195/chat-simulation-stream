# Configuración necesaria

⚠️  **IMPORTANTE**: Para ejecutar el proyecto necesitas configurar las API keys de Clerk.

## Pasos:

1. Ve a https://dashboard.clerk.com
2. Crea una aplicación o selecciona una existente
3. Ve a "API Keys" en el sidebar
4. Copia tus keys y pégalas en el archivo `.env`:

```env
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxx
```

5. Luego ejecuta:
```bash
pnpm dev
```

## Enlaces útiles
- Dashboard de Clerk: https://dashboard.clerk.com
- Documentación: https://clerk.com/docs
