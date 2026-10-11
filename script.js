const btnRegistrar = document.getElementById("btnRegistrar");
const formulario = document.getElementById("formulario");
const guardarMascota = document.getElementById("guardarMascota");
const inicio = document.getElementById("inicio");
const btnBuscarMascota = document.getElementById("btnBuscarMascota");
const zonaBusqueda = document.getElementById("zonaBusqueda");
const formBusqueda = document.getElementById("formBusqueda");
const buscarNombre = document.getElementById("buscarNombre");
const resultadosBusqueda = document.getElementById("resultadosBusqueda");
const mensajeBusqueda = document.getElementById("mensajeBusqueda");
const volverInicio = document.getElementById("volverInicio");
const volverDesdeRegistro = document.getElementById("volverDesdeRegistro");

// Comprobar que Firebase esté disponible
if (typeof db === "undefined") {
    console.error("Firebase no está inicializado. Revisa index.html.");
}

// Cargar la biblioteca QR una sola vez
let promesaCargaQR = null;

function cargarBibliotecaQR() {
    if (typeof QRCode !== "undefined") {
        return Promise.resolve();
    }

    if (promesaCargaQR) {
        return promesaCargaQR;
    }

    promesaCargaQR = new Promise((resolve, reject) => {
        const script = document.createElement("script");

        script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

        script.onload = () => {
            if (typeof QRCode !== "undefined") {
                resolve();
            } else {
                promesaCargaQR = null;
                reject(new Error("No se pudo iniciar el generador QR."));
            }
        };

        script.onerror = () => {
            promesaCargaQR = null;
            reject(new Error("No se pudo cargar la biblioteca QR."));
        };

        document.head.appendChild(script);
    });

    return promesaCargaQR;
}

// Generar el QR correspondiente a una mascota
async function generarCodigoQR(contenedor, url, tamano = 200) {
    contenedor.innerHTML = "";

    try {
        await cargarBibliotecaQR();

        contenedor.innerHTML = "";

        new QRCode(contenedor, {
            text: url,
            width: tamano,
            height: tamano,
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error("Error al generar el QR:", error);

        crearElemento(
            "p",
            "No se pudo cargar el QR. Comprueba tu conexión e inténtalo nuevamente.",
            contenedor
        );
    }
}

// Crear el enlace del perfil de una mascota
function obtenerURLPerfil(idMascota) {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("id", idMascota);
    return url.href;
}

// Imprimir el QR de una mascota
async function imprimirCodigoQR(contenedorQR, idMascota, nombreMascota) {
    try {
        await cargarBibliotecaQR();

        let canvas = contenedorQR.querySelector("canvas");

        if (!canvas) {
            const imagenQR = contenedorQR.querySelector("img");

            if (imagenQR && imagenQR.complete) {
                const canvasTemporal = document.createElement("canvas");
                canvasTemporal.width = imagenQR.naturalWidth;
                canvasTemporal.height = imagenQR.naturalHeight;

                const contexto = canvasTemporal.getContext("2d");
                contexto.drawImage(imagenQR, 0, 0);

                canvas = canvasTemporal;
            }
        }

        if (!canvas) {
            alert("Espera a que aparezca el QR antes de imprimirlo.");
            return;
        }

        const imagenImprimible = canvas.toDataURL("image/png");
        const ventana = window.open("", "_blank");

        if (!ventana) {
            alert(
                "El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes e inténtalo de nuevo."
            );
            return;
        }

        ventana.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>QR PETLINK - ${escaparHTML(nombreMascota)}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 30px;
                        color: #222;
                    }

                    h1 {
                        margin-bottom: 8px;
                    }

                    img {
                        width: 260px;
                        height: 260px;
                        max-width: 90%;
                        image-rendering: pixelated;
                    }

                    .codigo {
                        font-weight: bold;
                        margin-top: 12px;
                    }

                    @media print {
                        body {
                            padding: 10px;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>PETLINK</h1>
                <h2>${escaparHTML(nombreMascota)}</h2>
                <p>Escanea este código para consultar el perfil de la mascota.</p>
                <img src="${imagenImprimible}" alt="Código QR de PETLINK">
                <p class="codigo">Código: ${escaparHTML(idMascota)}</p>
                <script>
                    window.onload = function () {
                        setTimeout(function () {
                            window.print();
                        }, 300);
                    };
                <\/script>
            </body>
            </html>
        `);

        ventana.document.close();
    } catch (error) {
        console.error(error);
        alert("No se pudo preparar el QR para imprimir.");
    }
}

// Evitar interpretar como HTML los datos de texto
function escaparHTML(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}

// Navegación de la página principal
btnRegistrar.addEventListener("click", function () {
    inicio.hidden = true;
    zonaBusqueda.hidden = true;
    zonaBusqueda.style.display = "none";
    formulario.hidden = false;
    formulario.style.display = "block";
});

btnBuscarMascota.addEventListener("click", function () {
    formulario.hidden = true;
    formulario.style.display = "none";

    zonaBusqueda.hidden = false;
    zonaBusqueda.style.display = "block";

    mensajeBusqueda.hidden = true;
    resultadosBusqueda.innerHTML = "";

    buscarNombre.focus();
});

volverInicio.addEventListener("click", function () {
    zonaBusqueda.hidden = true;
    zonaBusqueda.style.display = "none";

    resultadosBusqueda.innerHTML = "";
    mensajeBusqueda.hidden = true;
    buscarNombre.value = "";

    formulario.hidden = true;
    formulario.style.display = "none";
    inicio.hidden = false;
});

volverDesdeRegistro.addEventListener("click", function () {
    formulario.hidden = true;
    formulario.style.display = "none";
    inicio.hidden = false;
});

// Comprimir fotografías para guardarlas en Firebase
function comprimirFoto(archivo) {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();

        lector.onload = function (evento) {
            const imagen = new Image();

            imagen.onload = function () {
                const canvas = document.createElement("canvas");
                const maximo = 800;

                let ancho = imagen.width;
                let alto = imagen.height;

                const escala = Math.min(
                    1,
                    maximo / Math.max(ancho, alto)
                );

                ancho = Math.round(ancho * escala);
                alto = Math.round(alto * escala);

                canvas.width = ancho;
                canvas.height = alto;

                const contexto = canvas.getContext("2d");

                if (!contexto) {
                    reject(new Error("No se pudo procesar la fotografía."));
                    return;
                }

                contexto.drawImage(imagen, 0, 0, ancho, alto);
                resolve(canvas.toDataURL("image/jpeg", 0.7));
            };

            imagen.onerror = function () {
                reject(new Error("No se pudo procesar la imagen."));
            };

            imagen.src = evento.target.result;
        };

        lector.onerror = function () {
            reject(new Error("No se pudo leer la fotografía."));
        };

        lector.readAsDataURL(archivo);
    });
}

// Validar y leer fotografía
async function obtenerFoto(archivo) {
    if (!archivo) return null;

    if (!archivo.type.startsWith("image/")) {
        throw new Error("El archivo debe ser una imagen.");
    }

    if (archivo.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no debe superar los 5 MB.");
    }

    return await comprimirFoto(archivo);
}

// Registrar mascota
guardarMascota.addEventListener("click", async function () {
    const valor = id => document.getElementById(id).value.trim();

    const nombre = valor("nombre");
    const especie = valor("especie");
    const raza = valor("raza");
    const color = valor("color");
    const sexo = valor("sexo");
    const whatsapp = valor("whatsapp");
    const clave = valor("clave");
    const estado = document.getElementById("estado").value;
    const archivo = document.getElementById("foto").files[0];

    if (!nombre || !especie || !raza || !color || !sexo) {
        alert("Completa todos los datos de la mascota.");
        return;
    }

    if (!/^[0-9]{8,15}$/.test(whatsapp)) {
        alert(
            "Ingresa el WhatsApp con código de país, solo números y entre 8 y 15 dígitos."
        );
        return;
    }

    if (clave.length < 4) {
        alert("La clave privada debe tener al menos 4 caracteres.");
        return;
    }

    if (!archivo) {
        alert("Selecciona una fotografía de la mascota.");
        return;
    }

    try {
        guardarMascota.disabled = true;
        guardarMascota.textContent = "Guardando mascota...";

        const foto = await obtenerFoto(archivo);
        const id = "PET-" + Date.now();

        const mascota = {
            id,
            nombre,
            especie,
            raza,
            color,
            sexo,
            estado,
            whatsapp,
            foto,
            clave
        };

        await db.collection("mascotas").doc(id).set(mascota);

        const urlPerfil = obtenerURLPerfil(id);

        let zonaQR = document.getElementById("zonaQR");

        if (!zonaQR) {
            zonaQR = document.createElement("div");
            zonaQR.id = "zonaQR";
            formulario.appendChild(zonaQR);
        }

        zonaQR.innerHTML = "";

        crearElemento("h2", "🐾 ¡Mascota registrada!", zonaQR);
        crearElemento("p", "Código PETLINK: " + id, zonaQR);

        const enlace = document.createElement("a");
        enlace.href = urlPerfil;
        enlace.textContent = "Abrir perfil de la mascota";
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        zonaQR.appendChild(enlace);

        const espacioQR = document.createElement("div");
        espacioQR.style.marginTop = "15px";
        zonaQR.appendChild(espacioQR);

        await generarCodigoQR(espacioQR, urlPerfil, 200);

        const botonImprimir = crearBoton(
            "🖨️ Imprimir código QR",
            function () {
                imprimirCodigoQR(espacioQR, id, nombre);
            },
            zonaQR
        );

        botonImprimir.style.marginTop = "12px";

        alert("¡Mascota registrada correctamente!\nCódigo: " + id);
    } catch (error) {
        console.error(error);
        alert("No se pudo registrar la mascota: " + error.message);
    } finally {
        guardarMascota.disabled = false;
        guardarMascota.textContent = "Guardar mascota";
    }
});

// BUSCADOR DE MASCOTAS EN FIREBASE
formBusqueda.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nombreBuscado = buscarNombre.value.trim();

    if (!nombreBuscado) {
        mostrarMensajeBusqueda("Escribe el nombre de una mascota.");
        return;
    }

    resultadosBusqueda.innerHTML = "";
    mostrarMensajeBusqueda("Buscando mascotas...");

    const botonBuscar = document.getElementById("ejecutarBusqueda");
    botonBuscar.disabled = true;
    botonBuscar.textContent = "Buscando...";

    try {
        const consulta = await db.collection("mascotas").get();

        const normalizar = texto =>
            String(texto || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLocaleLowerCase("es");

        const termino = normalizar(nombreBuscado);

        const coincidencias = consulta.docs
            .map(documento => ({
                ...documento.data(),
                id: documento.data().id || documento.id
            }))
            .filter(mascota => normalizar(mascota.nombre) === termino);

        if (coincidencias.length === 0) {
            mostrarMensajeBusqueda(
                "No encontramos mascotas con ese nombre. Revisa la escritura e inténtalo de nuevo."
            );
            return;
        }

        mensajeBusqueda.hidden = true;

        const encabezado = document.createElement("h3");
        encabezado.textContent =
            coincidencias.length === 1
                ? "Encontramos 1 mascota"
                : "Encontramos " + coincidencias.length + " mascotas";

        resultadosBusqueda.appendChild(encabezado);

        const indicacion = document.createElement("p");
        indicacion.textContent =
            "Revisa las fotografías y los datos para identificar a la mascota correcta.";
        resultadosBusqueda.appendChild(indicacion);

        // Mostrar una tarjeta por cada mascota encontrada
        for (const mascota of coincidencias) {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-mascota";

            if (mascota.foto) {
                const foto = document.createElement("img");
                foto.src = mascota.foto;
                foto.alt = "Fotografía de " + (mascota.nombre || "la mascota");
                foto.loading = "lazy";
                tarjeta.appendChild(foto);
            } else {
                crearElemento(
                    "p",
                    "Esta mascota no tiene una fotografía disponible.",
                    tarjeta
                );
            }

            crearElemento("h3", mascota.nombre || "Sin nombre", tarjeta);

            crearElemento(
                "p",
                "Especie: " + (mascota.especie || "No indicada"),
                tarjeta
            );

            crearElemento(
                "p",
                "Raza: " + (mascota.raza || "No indicada"),
                tarjeta
            );

            crearElemento(
                "p",
                "Color: " + (mascota.color || "No indicado"),
                tarjeta
            );

            crearElemento(
                "p",
                "Sexo: " + (mascota.sexo || "No indicado"),
                tarjeta
            );

            const estado = mascota.estado || "En casa";

            const estadoElemento = crearElemento(
                "p",
                "Estado: " + estado,
                tarjeta
            );

            if (estado === "Perdida") {
                estadoElemento.style.cssText =
                    "background:#b71c1c;color:white;padding:10px;border-radius:8px;font-weight:bold;";
            } else if (estado === "Encontrada") {
                estadoElemento.style.cssText =
                    "background:#fff3cd;color:#664d03;padding:10px;border-radius:8px;font-weight:bold;";
            }

            // NUEVO: mostrar el QR original de esta mascota en el resultado
            crearElemento("h4", "Código QR de esta mascota", tarjeta);

            const contenedorQR = document.createElement("div");
            contenedorQR.className = "qr-mascota";
            contenedorQR.style.cssText =
                "background:white;padding:12px;margin:10px auto;text-align:center;width:max-content;max-width:100%;border-radius:8px;";

            tarjeta.appendChild(contenedorQR);

            const urlPerfil = obtenerURLPerfil(mascota.id);

            await generarCodigoQR(contenedorQR, urlPerfil, 180);

            const botonImprimirQR = crearBoton(
                "🖨️ Imprimir QR",
                function () {
                    imprimirCodigoQR(
                        contenedorQR,
                        mascota.id,
                        mascota.nombre || "Mascota"
                    );
                },
                tarjeta
            );

            botonImprimirQR.style.marginBottom = "12px";

            crearElemento(
                "p",
                "Código PETLINK: " + mascota.id,
                tarjeta
            );

            crearBoton(
                "Ver perfil de esta mascota",
                function () {
                    window.location.href = obtenerURLPerfil(mascota.id);
                },
                tarjeta
            );

            resultadosBusqueda.appendChild(tarjeta);
        }

    } catch (error) {
        console.error(error);

        mostrarMensajeBusqueda(
            "Ocurrió un problema al buscar en Firebase. Comprueba tu conexión e inténtalo otra vez."
        );
    } finally {
        botonBuscar.disabled = false;
        botonBuscar.textContent = "Buscar mascotas";
    }
});

function mostrarMensajeBusqueda(texto) {
    mensajeBusqueda.textContent = texto;
    mensajeBusqueda.hidden = false;
}

// Detectar si se abrió un perfil mediante su QR
const parametros = new URLSearchParams(window.location.search);
const idBuscado = parametros.get("id");

if (idBuscado) {
    buscarMascota(idBuscado);
}

// Crear elementos de texto de forma segura
function crearElemento(etiqueta, texto, padre) {
    const elemento = document.createElement(etiqueta);
    elemento.textContent = texto;
    padre.appendChild(elemento);
    return elemento;
}

function crearBoton(texto, funcion, padre) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.addEventListener("click", funcion);
    padre.appendChild(boton);
    return boton;
}

// Mostrar perfil público de la mascota
function mostrarPerfil(mascota) {
    document.body.innerHTML = "";

    const cabecera = document.createElement("header");
    crearElemento("h1", "🐾 PETLINK", cabecera);
    crearElemento("p", "Perfil de identificación de mascota", cabecera);
    document.body.appendChild(cabecera);

    const principal = document.createElement("main");
    const tarjeta = document.createElement("section");

    if (mascota.foto) {
        const foto = document.createElement("img");
        foto.src = mascota.foto;
        foto.alt = "Fotografía de " + (mascota.nombre || "la mascota");
        foto.style.cssText =
            "width:250px;max-width:100%;border-radius:15px;display:block;margin:20px auto;";
        tarjeta.appendChild(foto);
    }

    crearElemento("h2", "🐾 " + (mascota.nombre || "Mascota"), tarjeta);
    crearElemento("p", "Especie: " + (mascota.especie || "No indicada"), tarjeta);
    crearElemento("p", "Raza: " + (mascota.raza || "No indicada"), tarjeta);
    crearElemento("p", "Color: " + (mascota.color || "No indicado"), tarjeta);
    crearElemento("p", "Sexo: " + (mascota.sexo || "No indicado"), tarjeta);

    const estado = mascota.estado || "En casa";
    const estadoTexto = crearElemento("h3", "Estado: " + estado, tarjeta);

    if (estado === "Perdida") {
        estadoTexto.style.cssText =
            "background:#b71c1c;color:white;padding:12px;border-radius:8px;";
    } else if (estado === "Encontrada") {
        estadoTexto.style.cssText =
            "background:#fff3cd;color:#664d03;padding:12px;border-radius:8px;";
    }

    crearElemento("p", "Código PETLINK: " + mascota.id, tarjeta);
    crearElemento("hr", "", tarjeta);
    crearElemento("h3", "¿Encontraste esta mascota?", tarjeta);

    crearElemento(
        "p",
        "Puedes comunicarte con su propietario para coordinar la devolución.",
        tarjeta
    );

    crearBoton(
        "💬 Contactar al dueño por WhatsApp",
        function () {
            contactarWhatsApp(mascota.whatsapp, mascota.nombre);
        },
        tarjeta
    );

    crearElemento("hr", "", tarjeta);
    crearElemento("h3", "🔐 Administración del propietario", tarjeta);

    crearBoton(
        "Administrar mascota",
        function () {
            abrirAdministracion(mascota.id);
        },
        tarjeta
    );

    crearBoton(
        "Volver a PETLINK",
        function () {
            const url = new URL(window.location.href);
            url.search = "";
            window.location.href = url.href;
        },
        tarjeta
    );

    principal.appendChild(tarjeta);
    document.body.appendChild(principal);

    const pie = document.createElement("footer");
    crearElemento("p", "© 2026 PETLINK 🐾", pie);
    document.body.appendChild(pie);
}

// Abrir perfil desde Firebase
async function buscarMascota(id) {
    try {
        const documento = await db.collection("mascotas").doc(id).get();

        if (documento.exists) {
            const mascota = documento.data();
            mascota.id = mascota.id || documento.id;
            mostrarPerfil(mascota);
        } else {
            mostrarMascotaNoEncontrada();
        }
    } catch (error) {
        console.error(error);
        mostrarMascotaNoEncontrada();
    }
}

// Acceso del propietario
function abrirAdministracion(idMascota) {
    const clave = prompt("Ingresa tu clave privada:");

    if (clave === null || !clave.trim()) return;

    verificarClave(idMascota, clave.trim());
}

async function verificarClave(idMascota, claveIngresada) {
    try {
        const documento = await db.collection("mascotas").doc(idMascota).get();

        if (!documento.exists) {
            alert("No se encontró la mascota.");
            return;
        }

        const mascota = documento.data();
        mascota.id = mascota.id || documento.id;

        if (mascota.clave !== claveIngresada) {
            alert("Clave incorrecta.");
            return;
        }

        abrirPanelPropietario(mascota);
    } catch (error) {
        console.error(error);
        alert("No se pudo verificar la clave.");
    }
}

// Panel de administración del propietario
function abrirPanelPropietario(mascota) {
    document.body.innerHTML = "";

    const cabecera = document.createElement("header");
    crearElemento("h1", "🐾 PETLINK", cabecera);
    crearElemento("p", "Administración del propietario", cabecera);
    document.body.appendChild(cabecera);

    const principal = document.createElement("main");
    const tarjeta = document.createElement("section");

    crearElemento("h2", "Administrar a " + mascota.nombre, tarjeta);
    crearElemento("p", "Código PETLINK: " + mascota.id, tarjeta);

    crearElemento(
        "p",
        "El código QR y el identificador se conservarán.",
        tarjeta
    );

    const formularioEdicion = document.createElement("form");
    formularioEdicion.id = "editarMascotaForm";

    crearElemento("h3", "✏️ Datos de la mascota", formularioEdicion);

    function campo(etiqueta, id, valor, tipo = "text") {
        crearElemento("label", etiqueta, formularioEdicion).htmlFor = id;

        const input = document.createElement("input");
        input.id = id;
        input.type = tipo;
        input.value = valor || "";
        input.required = true;
        input.style.cssText =
            "width:100%;box-sizing:border-box;padding:10px;margin:6px 0 12px;";

        formularioEdicion.appendChild(input);
        return input;
    }

    campo("Nombre", "editarNombre", mascota.nombre);
    campo("Especie", "editarEspecie", mascota.especie);
    campo("Raza", "editarRaza", mascota.raza);
    campo("Color", "editarColor", mascota.color);

    crearElemento("label", "Sexo", formularioEdicion).htmlFor = "editarSexo";

    const sexo = document.createElement("select");
    sexo.id = "editarSexo";
    sexo.required = true;
    sexo.style.cssText = "width:100%;padding:10px;margin:6px 0 12px;";

    ["Macho", "Hembra"].forEach(opcion => {
        const elemento = document.createElement("option");
        elemento.value = opcion;
        elemento.textContent = opcion;
        sexo.appendChild(elemento);
    });

    sexo.value = mascota.sexo || "Macho";
    formularioEdicion.appendChild(sexo);

    campo(
        "WhatsApp con código de país, solo números",
        "editarWhatsApp",
        mascota.whatsapp,
        "tel"
    );

    crearElemento("label", "Estado", formularioEdicion).htmlFor = "editarEstado";

    const estado = document.createElement("select");
    estado.id = "editarEstado";
    estado.style.cssText = "width:100%;padding:10px;margin:6px 0 12px;";

    ["En casa", "Perdida", "Encontrada"].forEach(opcion => {
        const elemento = document.createElement("option");
        elemento.value = opcion;
        elemento.textContent = opcion;
        estado.appendChild(elemento);
    });

    estado.value = mascota.estado || "En casa";
    formularioEdicion.appendChild(estado);

    crearElemento(
        "label",
        "Cambiar fotografía (opcional)",
        formularioEdicion
    ).htmlFor = "editarFoto";

    const foto = document.createElement("input");
    foto.id = "editarFoto";
    foto.type = "file";
    foto.accept = "image/*";
    foto.style.cssText = "display:block;margin:10px 0;";
    formularioEdicion.appendChild(foto);

    if (mascota.foto) {
        crearElemento("p", "Fotografía actual:", formularioEdicion);

        const fotoActual = document.createElement("img");
        fotoActual.src = mascota.foto;
        fotoActual.alt = "Fotografía actual de la mascota";
        fotoActual.style.cssText =
            "width:150px;max-width:100%;border-radius:12px;";

        formularioEdicion.appendChild(fotoActual);
    }

    crearElemento("hr", "", formularioEdicion);
    crearElemento("h3", "🔐 Cambiar clave privada (opcional)", formularioEdicion);

    crearElemento(
        "p",
        "Si no quieres cambiar la clave, deja los tres campos vacíos.",
        formularioEdicion
    );

    function campoClave(etiqueta, id, placeholder, autocomplete) {
        const input = document.createElement("input");
        input.id = id;
        input.type = "password";
        input.placeholder = placeholder;
        input.autocomplete = autocomplete;
        input.setAttribute("aria-label", etiqueta);
        input.style.cssText =
            "width:100%;box-sizing:border-box;padding:10px;margin:6px 0 12px;";

        formularioEdicion.appendChild(input);
        return input;
    }

    const claveActual = campoClave(
        "Clave actual",
        "claveActual",
        "Clave actual",
        "current-password"
    );

    const claveNueva = campoClave(
        "Nueva clave",
        "claveNueva",
        "Nueva clave (mínimo 4 caracteres)",
        "new-password"
    );

    const confirmarClave = campoClave(
        "Confirmar nueva clave",
        "confirmarClave",
        "Repite la nueva clave",
        "new-password"
    );

    const guardar = document.createElement("button");
    guardar.type = "submit";
    guardar.textContent = "💾 Guardar todos los cambios";
    guardar.style.cssText = "width:100%;padding:12px;margin-top:15px;";
    formularioEdicion.appendChild(guardar);

    formularioEdicion.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const nombre = document.getElementById("editarNombre").value.trim();
        const especie = document.getElementById("editarEspecie").value.trim();
        const raza = document.getElementById("editarRaza").value.trim();
        const color = document.getElementById("editarColor").value.trim();
        const whatsapp = document.getElementById("editarWhatsApp").value.trim();

        if (!nombre || !especie || !raza || !color || !sexo.value) {
            alert("Completa todos los datos de la mascota.");
            return;
        }

        if (!/^[0-9]{8,15}$/.test(whatsapp)) {
            alert(
                "El WhatsApp debe tener entre 8 y 15 dígitos, incluyendo el código de país."
            );
            return;
        }

        const actual = claveActual.value;
        const nueva = claveNueva.value;
        const confirmacion = confirmarClave.value;

        const intentaCambiarClave =
            actual !== "" || nueva !== "" || confirmacion !== "";

        if (intentaCambiarClave) {
            if (!actual || !nueva || !confirmacion) {
                alert("Para cambiar la clave, completa los tres campos.");
                return;
            }

            if (actual !== mascota.clave) {
                alert("La clave actual es incorrecta. No se guardó ningún cambio.");
                return;
            }

            if (nueva.length < 4) {
                alert("La nueva clave debe tener al menos 4 caracteres.");
                return;
            }

            if (nueva !== confirmacion) {
                alert("Las nuevas claves no coinciden. No se guardó ningún cambio.");
                return;
            }

            if (nueva === actual) {
                alert("La nueva clave debe ser diferente de la actual.");
                return;
            }
        }

        try {
            guardar.disabled = true;
            guardar.textContent = "Guardando todos los cambios...";

            const cambios = {
                nombre,
                especie,
                raza,
                color,
                sexo: sexo.value,
                whatsapp,
                estado: estado.value
            };

            if (foto.files[0]) {
                cambios.foto = await obtenerFoto(foto.files[0]);
            }

            if (intentaCambiarClave) {
                cambios.clave = nueva;
            }

            await db.collection("mascotas").doc(mascota.id).update(cambios);

            const documentoActualizado = await db.collection("mascotas")
                .doc(mascota.id)
                .get();

            if (!documentoActualizado.exists) {
                alert("No se pudo volver a cargar el panel.");
                return;
            }

            const mascotaActualizada = documentoActualizado.data();
            mascotaActualizada.id =
                mascotaActualizada.id || documentoActualizado.id;

            alert(
                intentaCambiarClave
                    ? "¡Datos y clave actualizados correctamente!"
                    : "¡Datos actualizados correctamente! La clave se mantuvo sin cambios."
            );

            abrirPanelPropietario(mascotaActualizada);
        } catch (error) {
            console.error(error);
            alert("No se pudieron guardar los cambios: " + error.message);
        } finally {
            guardar.disabled = false;
            guardar.textContent = "💾 Guardar todos los cambios";
        }
    });

    tarjeta.appendChild(formularioEdicion);
    principal.appendChild(tarjeta);
    document.body.appendChild(principal);

    const pie = document.createElement("footer");
    crearElemento("p", "© 2026 PETLINK 🐾", pie);
    document.body.appendChild(pie);
}

// Contacto por WhatsApp
function contactarWhatsApp(numero, nombreMascota) {
    if (!numero) {
        alert("El propietario no ha registrado un número de WhatsApp.");
        return;
    }

    const mensaje =
        "Hola, encontré a tu mascota " + nombreMascota +
        ". Escaneé su código PETLINK. ¿Podemos coordinar para reunirnos?";

    const enlace =
        "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje);

    window.open(enlace, "_blank", "noopener,noreferrer");
}

// Mascota no encontrada
function mostrarMascotaNoEncontrada() {
    document.body.innerHTML = "";

    const principal = document.createElement("main");
    const tarjeta = document.createElement("section");

    crearElemento("h1", "🐾 PETLINK", tarjeta);
    crearElemento("h2", "Mascota no encontrada", tarjeta);

    crearElemento(
        "p",
        "No encontramos información asociada a este código PETLINK.",
        tarjeta
    );

    crearBoton(
        "Volver a PETLINK",
        function () {
            const url = new URL(window.location.href);
            url.search = "";
            window.location.href = url.href;
        },
        tarjeta
    );

    principal.appendChild(tarjeta);
    document.body.appendChild(principal);
}
