# Yapita — panel de negocios

Dashboard React/Vite para que propietarios y administradores gestionen su
negocio, programas de puntos o sellos, recompensas, promociones, clientes y
usuarios de la app scanner.

## Configuración local

```bash
yarn install
cp .env.example .env
yarn dev
```

La aplicación espera el backend en `http://localhost:3000/api/v1`. El origen
del panel (normalmente `http://localhost:5173`) debe estar incluido en
`CORS_ORIGINS` del backend.

## Autenticación

1. Habilita **Email/Password** en Firebase Authentication del proyecto
   `yapita-964b8`.
2. El correo debe existir previamente como `business_users.email` y tener una
   asignación `invited` o `active` en PostgreSQL. El seed incluye un usuario de
   ejemplo; también se pueden crear invitaciones desde la pantalla Personal.
3. En el login elige **Tengo una invitación y aún no tengo cuenta**, registra
   el mismo correo y abre el email de verificación enviado por Firebase.
4. Al iniciar sesión, el panel envía el ID token a
   `POST /auth/business/link`. El backend vincula la identidad y devuelve los
   comercios permitidos.

No se almacenan PINs ni contraseñas en este proyecto. Firebase administra las
credenciales y el backend aplica los roles por `assignmentId`.

## Integración API

Todas las llamadas envían `Authorization: Bearer <Firebase ID token>` y la
asignación seleccionada. Las pantallas consumen:

- `GET /business/dashboard`
- `GET|PATCH /business/profile`
- CRUD `/business/programs`
- CRUD `/business/rewards`
- CRUD `/business/promotions`
- CRUD `/business/staff`
- `GET /business/customers`

En promociones, un bono queda asociado a un programa concreto; su unidad se
obtiene del programa (`points` o `stamps`) y su modalidad es `fixed` o
`multiplier`.

## Producción

Define las variables `VITE_*` durante el build y usa HTTPS para
`VITE_API_BASE_URL`. No copies el JSON de la cuenta de servicio a este
repositorio: esa credencial pertenece únicamente al backend.
