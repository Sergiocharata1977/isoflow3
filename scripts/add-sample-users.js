// Script para agregar usuarios de ejemplo a la base de datos
const { createClient } = require('@libsql/client');

// Configuración de la base de datos Turso
const client = createClient({
  url: 'libsql://iso-muestra-104-sergiocharata1977.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDY3OTgzMTUsImlkIjoiYjM2Y2MxYzYtY2I0NC00NzFkLWEyYjYtNGI5MTI0NjQ2MmE4IiwicmlkIjoiZDIyMDRlMGQtMTcxYy00NjhkLTliODUtYzNhYTYzNDlhZmI0In0.6FSA-ozXSMWU5XtSgul4oNQ6nzhA42IyX9emolZusfrO4aGP6xvn0p7cHmBHRtpwlTSxX4Tq-UVWaX5QUtdzAw'
});

// Usuarios de ejemplo para insertar
const sampleUsers = [
  {
    nombre: 'Juan Pérez',
    email: 'juan@isoflow.com',
    password_hash: 'isoflow123',
    role: 'user'
  },
  {
    nombre: 'María Gómez',
    email: 'maria@isoflow.com',
    password_hash: 'isoflow123',
    role: 'supervisor'
  }
];

async function addSampleUsers() {
  console.log('Agregando usuarios de ejemplo...');

  try {
    // Verificar si los usuarios ya existen
    for (const user of sampleUsers) {
      const checkResult = await client.execute({
        sql: 'SELECT id FROM usuarios WHERE email = ?',
        args: [user.email]
      });

      if (checkResult.rows.length === 0) {
        // Si el usuario no existe, lo insertamos
        await client.execute({
          sql: `
            INSERT INTO usuarios (nombre, email, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
          `,
          args: [user.nombre, user.email, user.password_hash, user.role]
        });
        
        console.log(`✅ Usuario ${user.nombre} (${user.email}) creado correctamente`);
      } else {
        console.log(`ℹ️ El usuario ${user.email} ya existe en la base de datos`);
      }
    }

    console.log('\n📝 Usuarios disponibles en el sistema:');
    console.log('----------------------------------------');
    
    // Listar todos los usuarios en la base de datos
    const { rows } = await client.execute('SELECT nombre, email, role, password_hash FROM usuarios');
    
    rows.forEach((user, index) => {
      console.log(`Usuario #${index + 1}:`);
      console.log(`- Nombre: ${user.nombre}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Contraseña: ${user.password_hash}`);
      console.log(`- Rol: ${user.role}`);
      console.log('----------------------------------------');
    });
    
    console.log('✅ Operación completada exitosamente');
  } catch (error) {
    console.error('❌ Error al agregar usuarios:', error);
  }
}

// Ejecutar la función
addSampleUsers();
