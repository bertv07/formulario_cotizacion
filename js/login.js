document.getElementById('login-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('error-message');

  errorMessage.textContent = '';

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (result.success) {
      window.location.href = '/admin.html';
    } else {
      errorMessage.textContent = result.message || 'Error al iniciar sesión.';
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    errorMessage.textContent = 'Error de conexión con el servidor.';
  }
});
