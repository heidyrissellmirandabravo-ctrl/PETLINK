const btnRegistrar = document.getElementById("btnRegistrar");
const formulario = document.getElementById("formulario");
const guardarMascota = document.getElementById("guardarMascota");


// -----------------------------------------
// MOSTRAR FORMULARIO
// -----------------------------------------

btnRegistrar.addEventListener("click", function () {

    formulario.style.display = "block";

});


// -----------------------------------------
// REGISTRAR MASCOTA EN FIREBASE
// -----------------------------------------

guardarMascota.addEventListener("click", async function () {

    const nombre =
        document.getElementById("nombre").value.trim();

    const especie =
        document.getElementById("especie").value.trim();

    const raza =
        document.getElementById("raza").value.trim();

    const color =
        document.getElementById("color").value.trim();

    const sexo =
        document.getElementById("sexo").value.trim();

    const foto =
        document.getElementById("foto").files[0];


    // -----------------------------------------
    // COMPROBAR DATOS
    // -----------------------------------------

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


    // -----------------------------------------
    // COMPROBAR FOTO
    // -----------------------------------------

    if (!foto) {

        alert("Por favor, selecciona una foto de la mascota.");

        return;

    }


    // -----------------------------------------
    // COMPROBAR TIPO DE FOTO
    // -----------------------------------------

    if (!foto.type.startsWith("image/")) {

        alert("El archivo seleccionado debe ser una imagen.");

        return;

    }


    // -----------------------------------------
    // COMPROBAR TAMAÑO
    // Máximo 5 MB
    // -----------------------------------------

    if (foto.size > 5 * 1024 * 1024) {

        alert("La foto no debe superar los 5 MB.");

        return;

    }


    // -----------------------------------------
    // CREAR ID DE MASCOTA
    // -----------------------------------------

    const idMascota =
        "PET-" + Date.now();


    try {

        // -----------------------------------------
        // SUBIR FOTO A FIREBASE STORAGE
        // -----------------------------------------

        const referenciaFoto =
            storage
                .ref()
                .child(
                    "mascotas/" +
                    idMascota +
                    "/" +
                    foto.name
                );


        await referenciaFoto.put(foto);


        // -----------------------------------------
        // OBTENER URL DE LA FOTO
        // -----------------------------------------

        const urlFoto =
            await referenciaFoto.getDownloadURL();


        // -----------------------------------------
        // CREAR DATOS DE LA MASCOTA
        // -----------------------------------------

        const mascota = {

            id: idMascota,

            nombre: nombre,

            especie: especie,

            raza: raza,

            color: color,

            sexo: sexo,

            foto: urlFoto

        };


        // -----------------------------------------
        // GUARDAR EN FIRESTORE
        // -----------------------------------------

        await db
            .collection("mascotas")
            .doc(idMascota)
            .set(mascota);


        // -----------------------------------------
        // CREAR LINK DEL PERFIL
        // -----------------------------------------

        const urlPerfil =
            window.location.origin +
            window.location.pathname +
            "?id=" +
            encodeURIComponent(idMascota);


        // -----------------------------------------
        // CREAR ZONA DEL QR
        // -----------------------------------------

        let zonaQR =
            document.getElementById("zonaQR");


        if (!zonaQR) {

            zonaQR =
                document.createElement("div");

            zonaQR.id = "zonaQR";

            zonaQR.style.marginTop = "25px";

            formulario.appendChild(zonaQR);

        }


        // -----------------------------------------
        // MOSTRAR RESULTADO
        // -----------------------------------------

        zonaQR.innerHTML = `

            <h2>🐾 Mascota registrada</h2>

            <p>
                <strong>Nombre:</strong>
                ${nombre}
            </p>

            <p>
                <strong>Código PETLINK:</strong>
                ${idMascota}
            </p>

            <p>
                <strong>Foto:</strong>
            </p>

            <img
                src="${urlFoto}"
                alt="Foto de ${nombre}"
                style="
                    width: 220px;
                    max-width: 100%;
                    border-radius: 12px;
                    display: block;
                    margin: 10px auto;
                "
            >

            <p>
                <strong>Enlace del perfil:</strong>
            </p>

            <p>

                <a
                    href="${urlPerfil}"
                    target="_blank"
                >
                    ${urlPerfil}
                </a>

            </p>

            <div id="codigoQR"></div>

        `;


        // -----------------------------------------
        // CARGAR GENERADOR QR
        // -----------------------------------------

        const qrScript =
            document.createElement("script");


        qrScript.src =
            "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";


        qrScript.onload = function () {

            const codigoQR =
                document.getElementById("codigoQR");


            codigoQR.innerHTML = "";


            new QRCode(codigoQR, {

                text: urlPerfil,

                width: 200,

                height: 200

            });

        };


        document.head.appendChild(qrScript);


        // -----------------------------------------
        // MENSAJE DE ÉXITO
        // -----------------------------------------

        alert(
            "¡Mascota registrada correctamente! 🐾\n\n" +
            "Código PETLINK: " +
            idMascota
        );


    } catch (error) {

        console.error(error);

        alert(
            "ERROR AL GUARDAR LA MASCOTA:\n\n" +
            error.code +
            "\n\n" +
            error.message
        );

    }

});


// -----------------------------------------
// BUSCAR MASCOTA DESDE EL QR
// -----------------------------------------

const parametros =
    new URLSearchParams(
        window.location.search
    );


const idBuscado =
    parametros.get("id");


if (idBuscado) {

    buscarMascota(idBuscado);

}


// -----------------------------------------
// BUSCAR MASCOTA EN FIREBASE
// -----------------------------------------

async function buscarMascota(id) {

    try {

        const documento =
            await db
                .collection("mascotas")
                .doc(id)
                .get();


        if (documento.exists) {

            const mascota =
                documento.data();


            mostrarPerfil(mascota);

        } else {

            mostrarMascotaNoEncontrada();

        }


    } catch (error) {

        console.error(error);

        mostrarMascotaNoEncontrada();

    }

}


// -----------------------------------------
// MOSTRAR PERFIL
// -----------------------------------------

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

                ${
                    mascota.foto
                    ?
                    `
                    <img
                        src="${mascota.foto}"
                        alt="Foto de ${mascota.nombre}"
                        style="
                            width: 250px;
                            max-width: 100%;
                            border-radius: 15px;
                            display: block;
                            margin: 20px auto;
                        "
                    >
                    `
                    :
                    ""
                }


                <h2>
                    🐶 ${mascota.nombre}
                </h2>


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


                <h3>
                    🐾 ¿Encontraste esta mascota?
                </h3>


                <p>

                    Si encontraste a esta mascota,
                    puedes comunicarte con su dueño.

                </p>


                <button
                    onclick="contactarWhatsApp('${mascota.nombre}')"
                >

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


// -----------------------------------------
// MASCOTA NO ENCONTRADA
// -----------------------------------------

function mostrarMascotaNoEncontrada() {

    document.body.innerHTML = `

        <main>

            <section>

                <h1>🐾 PETLINK</h1>

                <h2>
                    Mascota no encontrada
                </h2>


                <p>

                    No pudimos encontrar la información
                    asociada a este código PETLINK.

                </p>

            </section>

        </main>

    `;

}


// -----------------------------------------
// CONTACTAR POR WHATSAPP
// -----------------------------------------

function contactarWhatsApp(nombreMascota) {

    const mensaje =

        "Hola, encontré a tu mascota " +
        nombreMascota +
        ". Escaneé su código PETLINK.";


    const enlace =

        "https://wa.me/?text=" +
        encodeURIComponent(mensaje);


    window.open(
        enlace,
        "_blank"
    );

}
