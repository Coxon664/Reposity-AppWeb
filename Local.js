// Función para guardar el puntaje en Local Storage
function guardarPuntajeEnLocal(puntaje) {
    localStorage.setItem('puntaje', puntaje);
}

// Función que se llama cuando el juego termina
function terminarJuego(puntaje) {
    // Guardar el puntaje en Local Storage
    guardarPuntajeEnLocal(puntaje);

    // Mostrar mensaje de finalización
    alert("Juego terminado. Tu puntaje es: " + puntaje);
}

// Función para recuperar el puntaje de Local Storage
function obtenerPuntajeDeLocal() {
    return localStorage.getItem('puntaje');
}

// Función para mostrar el puntaje guardado al inicio del juego
function mostrarPuntajeGuardado() {
    const puntaje = obtenerPuntajeDeLocal();
    if (puntaje) {
        alert("Tu último puntaje fue: " + puntaje);
    } else {
        alert("No hay puntajes guardados.");
    }
}

// Llamar a esta función al cargar la página
window.onload = function() {
    mostrarPuntajeGuardado();
};

// Función para eliminar el puntaje guardado en Local Storage
function eliminarPuntajeGuardado() {
    localStorage.removeItem('puntaje');
    alert("Puntaje eliminado.");
}

// Función para limpiar todo Local Storage
function limpiarLocalStorage() {
    localStorage.clear();
    alert("Todos los datos de Local Storage han sido eliminados.");
}
