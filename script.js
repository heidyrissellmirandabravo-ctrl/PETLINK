const btnRegistrar = document.getElementById("btnRegistrar");
const formulario = document.getElementById("formulario");
const guardarMascota = document.getElementById("guardarMascota");

// Mostrar formulario
btnRegistrar.addEventListener("click", function () {
    formulario.style.display = "block";
});

// Guardar mascota
guardarMascota.addEventListener("click", function () {

    const nombre = document.getElementById("nombre").value.trim();
    const especie = document.getElementById("especie").value.trim();
    const raza = document.getElementById("raza").value.trim();
    const color = document.getElementById("color").value.trim();
    const sexo = document.getElementById("sexo").value.trim();

    // Comprobar que todos los campos estén llenos
    if (
        nombre === "" ||
        especie === "" ||
        raza === "" ||
        color === "" ||
        sexo === ""
    ) {
        alert("Por favor, completa todos los datos.");
        return;
    }

    // Crear código único
    const idMascota = "PET-" + Date.now();

    // Crear información de la mascota
    const mascota = {
        id: idMascota,
        nombre: nombre,
        especie: especie,
        raza: raza,
        color: color,
        sexo: sexo
    };

    // Guardar información en el navegador
    localStorage.setItem(
        "mascotaPETLINK",
        JSON.stringify(mascota)
    );

    // Crear zona para mostrar el resultado
    let zonaQR = document.getElementById("zonaQR");

    if (!zonaQR) {
        zonaQR = document.createElement("div");
        zonaQR.id = "zonaQR";
        zonaQR.style.marginTop = "25px";
        formulario.appendChild(zonaQR);
    }

    // Crear dirección pública del perfil
    const urlPerfil =
        window.location.origin +
        window.location.pathname +
        "?id=" +
        encodeURIComponent(idMascota);

    // Mostrar información de la mascota
    zonaQR.innerHTML = `
        <h2>🐾 Mascota registrada</h2>

        <p>
            <strong>Nombre:</strong> ${nombre}
        </p>

        <p>
            <strong>Código PETLINK:</strong> ${idMascota}
        </p>

        <p>
            <strong>Enlace del perfil:</strong>
        </p>

        <p>
            <a href="${urlPerfil}" target="_blank">
                ${urlPerfil}
            </a>
        </p>

        <div id="codigoQR"></div>
    `;

    // Cargar generador de QR
    const qrScript = document.createElement("script");

    qrScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

    qrScript.onload = function () {

        const codigoQR = document.getElementById("codigoQR");

        codigoQR.innerHTML = "";

        new QRCode(codigoQR, {
            text: urlPerfil,
            width: 200,
            height: 200
        });

    };

    document.head.appendChild(qrScript);

    alert(
        "¡Mascota registrada correctamente! 🐾\n\n" +
        "Código PETLINK: " +
        idMascota
    );
});


// -----------------------------------------
// MOSTRAR PERFIL CUANDO SE ABRE CON ?id=
// -----------------------------------------

const parametros = new URLSearchParams(window.location.search);
const idBuscado = parametros.get("id");

if (idBuscado) {

    const mascotaGuardada =
        localStorage.getItem("mascotaPETLINK");

    if (mascotaGuardada) {

        const mascota = JSON.parse(mascotaGuardada);

        if (mascota.id === idBuscado) {

            mostrarPerfil(mascota);

        } else {

            mostrarMascotaNoEncontrada();

        }

    } else {

        mostrarMascotaNoEncontrada();

    }
}


// Mostrar perfil
function mostrarPerfil(mascota) {

    document.body.innerHTML = `
        <header>
            <h1>🐾 PETLINK</h1>

            <p>
                Perfil de identificación de mascota
            </p>
        </header>

        <main>

            <section>

                <h2>🐶 ${mascota.nombre}</h2>

                <p>
                    <strong>Especie:</strong>
                    ${mascota.especie}
                </p>

                <p>
                    <strong>Raza:</strong>
                    ${mascota.raza}
                </p>

                <p>
                    <strong>Color:</strong>
                    ${mascota.color}
                </p>

                <p>
                    <strong>Sexo:</strong>
                    ${mascota.sexo}
                </p>

                <p>
                    <strong>Código PETLINK:</strong>
                    ${mascota.id}
                </p>

                <hr>

                <h3>🐾 ¿Encontraste esta mascota?</h3>

                <p>
                    Si encontraste a esta mascota,
                    intenta comunicarte con su dueño.
                </p>

                <button onclick="contactarWhatsApp('${mascota.nombre}')">
                    💬 Contactar al dueño
                </button>

            </section>

        </main>

        <footer>
            <p>
                © 2026 PETLINK 🐾
            </p>
        </footer>
    `;
}


// Mascota no encontrada
function mostrarMascotaNoEncontrada() {

    document.body.innerHTML = `
        <main>

            <section>

                <h1>🐾 PETLINK</h1>

                <h2>Mascota no encontrada</h2>

                <p>
                    No pudimos encontrar la información
                    asociada a este código PETLINK.
                </p>

            </section>
        </main>
    `;
}


// Contactar por WhatsApp
function contactarWhatsApp(nombreMascota) {

    const mensaje =
        "Hola, encontré a tu mascota " +
        nombreMascota +
        ". Escaneé su código PETLINK.";

    const enlace =
        "https://wa.me/?text=" +
        encodeURIComponent(mensaje);

    window.open(enlace, "_blank");
}
