const btnRegistrar = document.getElementById("btnRegistrar");
const formulario = document.getElementById("formulario");
const guardarMascota = document.getElementById("guardarMascota");

// Mostrar formulario
btnRegistrar.addEventListener("click", function () {

    formulario.style.display = "block";

});

// Guardar mascota
guardarMascota.addEventListener("click", function () {

    const nombre = document.getElementById("nombre").value;
    const especie = document.getElementById("especie").value;
    const raza = document.getElementById("raza").value;
    const color = document.getElementById("color").value;
    const sexo = document.getElementById("sexo").value;

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

    // Crear un código único para la mascota
    const idMascota = "PET-" + Date.now();

    // Crear objeto de mascota
    const mascota = {
        id: idMascota,
        nombre: nombre,
        especie: especie,
        raza: raza,
        color: color,
        sexo: sexo
    };

    // Guardar la mascota en el navegador
    localStorage.setItem(
        "mascotaPETLINK",
        JSON.stringify(mascota)
    );

    // Crear espacio para mostrar el QR
    let zonaQR = document.getElementById("zonaQR");

    if (!zonaQR) {

        zonaQR = document.createElement("div");

        zonaQR.id = "zonaQR";

        zonaQR.style.marginTop = "25px";

        formulario.appendChild(zonaQR);

    }

    // Mostrar información de la mascota
    zonaQR.innerHTML = `
        <h2>🐾 Mascota registrada</h2>

        <p><strong>Nombre:</strong> ${nombre}</p>

        <p><strong>Código PETLINK:</strong> ${idMascota}</p>

        <div id="codigoQR"></div>
    `;

    // Cargar generador de QR
    const qrScript = document.createElement("script");

    qrScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

    qrScript.onload = function () {

        const codigoQR = document.getElementById("codigoQR");

        new QRCode(codigoQR, {
            text: idMascota,
            width: 200,
            height: 200
        });

    };

    document.head.appendChild(qrScript);

    alert(
        "¡Mascota registrada correctamente! 🐾\n\n" +
        "Código PETLINK: " + idMascota
    );

});