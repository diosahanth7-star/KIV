const $ = id =>
    document.getElementById(id);


let user = null;
let currentVideo = null;


/* =====================================
   ELEMENTOS
===================================== */

const homePage =
    $("homePage");

const profilePage =
    $("profilePage");

const searchPage =
    $("searchPage");

const watchPage =
    $("watchPage");


/* =====================================
   PERFIL
===================================== */

async function loadProfile() {

    const response =
        await fetch(
            "/api/profile"
        );

    user =
        await response.json();

    renderProfile();

}


function renderProfile() {

    if (!user) return;


    $("profileName")
        .textContent =
        user.name;


    $("profileDescription")
        .textContent =
        user.description ||
        "Sin descripción.";


    $("nameInput")
        .value =
        user.name;


    $("descriptionInput")
        .value =
        user.description || "";


    const profileAvatar =
        $("profileAvatar");

    const headerAvatar =
        $("profileButton");


    if (user.avatar) {

        profileAvatar.innerHTML = `
            <img
                src="${user.avatar}"
                alt="Avatar"
            >
        `;

        headerAvatar.innerHTML = `
            <img
                src="${user.avatar}"
                alt="Avatar"
            >
        `;

    } else {

        profileAvatar.innerHTML =
            "👤";

        headerAvatar.innerHTML =
            "👤";

    }


    const banner =
        $("profileBanner");


    if (user.banner) {

        banner.style.backgroundImage =
            `url("${user.banner}")`;

    } else {

        banner.style.backgroundImage =
            "";

    }

}


/* =====================================
   INICIO
===================================== */

async function loadVideos() {

    const response =
        await fetch(
            "/api/videos"
        );

    const videos =
        await response.json();

    renderVideos(videos);

}


function renderVideos(videos) {

    const grid =
        $("videoGrid");

    grid.innerHTML = "";


    if (!videos.length) {

        grid.innerHTML = `

            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:80px 20px;
                color:#666;
            ">

                <div style="
                    font-size:50px;
                ">
                    🎬
                </div>

                <h2 style="
                    color:#ddd;
                    margin-top:12px;
                ">
                    Todavía no hay vídeos
                </h2>

                <p style="
                    margin-top:8px;
                ">
                    Pulsa + para subir el primero.
                </p>

            </div>

        `;

        return;

    }


    videos.forEach(
        video => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "videoCard";


            card.innerHTML = `

                <video
                    preload="metadata"
                    src="${video.url}"
                ></video>

                <div class="videoInfo">

                    <div class="videoTitle">
                        ${escapeHTML(
                            video.title
                        )}
                    </div>

                    <div class="channel">
                        ${escapeHTML(
                            video.author?.name ||
                            "Usuario KIV"
                        )}
                    </div>

                    <div class="description">
                        ${escapeHTML(
                            video.description || ""
                        )}
                    </div>

                </div>

            `;


            card.addEventListener(
                "click",
                event => {

                    if (
                        event.target.tagName ===
                        "VIDEO"
                    ) {

                        event.preventDefault();

                    }

                    openVideo(
                        video.id
                    );

                }
            );


            grid.appendChild(
                card
            );

        }
    );

}


/* =====================================
   NAVEGACIÓN
===================================== */

function hidePages() {

    homePage.classList.add(
        "hidden"
    );

    profilePage.classList.add(
        "hidden"
    );

    searchPage.classList.add(
        "hidden"
    );

    watchPage.classList.add(
        "hidden"
    );

}


function showHome() {

    hidePages();

    homePage.classList.remove(
        "hidden"
    );

}


$("profileButton")
    .addEventListener(
        "click",
        () => {

            hidePages();

            profilePage.classList.remove(
                "hidden"
            );

        }
    );


$("backButton")
    .addEventListener(
        "click",
        () => {

            showHome();

            loadVideos();

        }
    );


/* =====================================
   MODAL PERFIL
===================================== */

$("editProfileButton")
    .addEventListener(
        "click",
        () => {

            $("profileModal")
                .classList
                .remove("hidden");

        }
    );


$("closeProfile")
    .addEventListener(
        "click",
        () => {

            $("profileModal")
                .classList
                .add("hidden");

        }
    );


$("saveProfile")
    .addEventListener(
        "click",
        saveProfile
    );


async function saveProfile() {

    const status =
        $("profileStatus");


    const name =
        $("nameInput")
            .value
            .trim();


    const description =
        $("descriptionInput")
            .value
            .trim();


    if (!name) {

        status.textContent =
            "Escribe un nombre.";

        return;

    }


    status.textContent =
        "Guardando...";


    try {

        const response =
            await fetch(
                "/api/profile",
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            name,
                            description
                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "No se pudo guardar."
            );

        }


        user =
            data.user;


        const avatarFile =
            $("avatarInput")
                .files[0];


        const bannerFile =
            $("bannerInput")
                .files[0];


        if (avatarFile) {

            const form =
                new FormData();

            form.append(
                "avatar",
                avatarFile
            );


            const avatarResponse =
                await fetch(
                    "/api/profile/avatar",
                    {
                        method: "POST",
                        body: form
                    }
                );


            const avatarData =
                await avatarResponse.json();


            if (!avatarResponse.ok) {

                throw new Error(
                    avatarData.error
                );

            }


            user =
                avatarData.user;

        }


        if (bannerFile) {

            const form =
                new FormData();

            form.append(
                "banner",
                bannerFile
            );


            const bannerResponse =
                await fetch(
                    "/api/profile/banner",
                    {
                        method: "POST",
                        body: form
                    }
                );


            const bannerData =
                await bannerResponse.json();


            if (!bannerResponse.ok) {

                throw new Error(
                    bannerData.error
                );

            }


            user =
                bannerData.user;

        }


        renderProfile();


        status.textContent =
            "✓ Canal actualizado";


        $("avatarInput").value =
            "";

        $("bannerInput").value =
            "";


        setTimeout(
            () => {

                $("profileModal")
                    .classList
                    .add("hidden");

                status.textContent =
                    "";

            },
            800
        );


    } catch (error) {

        console.error(error);

        status.textContent =
            "❌ " +
            error.message;

    }

}


/* =====================================
   SUBIR VÍDEO
===================================== */

$("uploadButton")
    .addEventListener(
        "click",
        () => {

            $("uploadModal")
                .classList
                .remove("hidden");

        }
    );


$("closeUpload")
    .addEventListener(
        "click",
        () => {

            $("uploadModal")
                .classList
                .add("hidden");

        }
    );


$("publishVideo")
    .addEventListener(
        "click",
        uploadVideo
    );


async function uploadVideo() {

    const file =
        $("videoInput")
            .files[0];


    const title =
        $("videoTitle")
            .value
            .trim();


    const description =
        $("videoDescription")
            .value
            .trim();


    const status =
        $("uploadStatus");


    if (!file) {

        status.textContent =
            "Selecciona un vídeo.";

        return;

    }


    if (!title) {

        status.textContent =
            "Escribe un título.";

        return;

    }


    const form =
        new FormData();


    form.append(
        "video",
        file
    );


    form.append(
        "title",
        title
    );


    form.append(
        "description",
        description
    );


    status.textContent =
        "Subiendo vídeo...";


    $("publishVideo")
        .disabled = true;


    try {

        const response =
            await fetch(
                "/api/videos",
                {
                    method: "POST",
                    body: form
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error
            );

        }


        status.textContent =
            "✓ Vídeo publicado";


        $("videoInput").value =
            "";

        $("videoTitle").value =
            "";

        $("videoDescription").value =
            "";


        loadVideos();


        setTimeout(
            () => {

                $("uploadModal")
                    .classList
                    .add("hidden");

                status.textContent =
                    "";

            },
            800
        );


    } catch (error) {

        console.error(error);

        status.textContent =
            "❌ " +
            error.message;

    } finally {

        $("publishVideo")
            .disabled = false;

    }

}


/* =====================================
   PÁGINA DEL VÍDEO
===================================== */

async function openVideo(id) {

    hidePages();

    watchPage.classList.remove(
        "hidden"
    );


    try {

        const response =
            await fetch(
                `/api/videos/${id}`
            );


        const video =
            await response.json();


        if (!response.ok) {

            throw new Error(
                video.error
            );

        }


        currentVideo =
            video;


        renderWatch(video);

        loadComments(id);

    } catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


function renderWatch(video) {

    const player =
        $("watchPlayer");


    player.innerHTML = `

        <video
            controls
            autoplay
            playsinline
            src="${video.url}"
        ></video>

    `;


    $("watchTitle")
        .textContent =
        video.title;


    $("watchChannelName")
        .textContent =
        video.author?.name ||
        "Usuario KIV";


    $("likeCount")
        .textContent =
        video.likes || 0;


    $("watchDescription")
        .textContent =
        video.description ||
        "Sin descripción.";


    const avatar =
        $("watchAvatar");


    if (
        video.author &&
        video.author.avatar
    ) {

        avatar.innerHTML = `
            <img
                src="${video.author.avatar}"
                alt="Avatar"
            >
        `;

    } else {

        avatar.innerHTML =
            "👤";

    }

}


/* =====================================
   LIKE
===================================== */

$("likeButton")
    .addEventListener(
        "click",
        async () => {

            if (!currentVideo) {
                return;
            }


            const response =
                await fetch(
                    `/api/videos/${currentVideo.id}/like`,
                    {
                        method: "POST"
                    }
                );


            const data =
                await response.json();


            if (data.success) {

                $("likeCount")
                    .textContent =
                    data.likes;

            }

        }
    );


/* =====================================
   COMENTARIOS
===================================== */

async function loadComments(id) {

    const list =
        $("commentsList");


    list.innerHTML =
        `<p style="color:#666">
            Cargando comentarios...
        </p>`;


    try {

        const response =
            await fetch(
                `/api/videos/${id}/comments`
            );


        const comments =
            await response.json();


        renderComments(
            comments
        );

    } catch (error) {

        console.error(error);

        list.innerHTML =
            `<p style="color:#666">
                No se pudieron cargar.
            </p>`;

    }

}


function renderComments(comments) {

    const list =
        $("commentsList");


    list.innerHTML = "";


    if (!comments.length) {

        list.innerHTML =
            `<p style="
                color:#666;
                margin-top:25px;
            ">
                Sé el primero en comentar. 💬
            </p>`;

        return;

    }


    comments.forEach(
        comment => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "comment";


            const avatar =
                comment.userAvatar
                ?
                `<img
                    src="${comment.userAvatar}"
                    alt=""
                >`
                :
                "👤";


            const date =
                new Date(
                    comment.createdAt
                );


            item.innerHTML = `

                <div class="commentAvatar">

                    ${avatar}

                </div>


                <div class="commentText">

                    <div>

                        <span class="commentName">

                            ${escapeHTML(
                                comment.userName
                            )}

                        </span>

                        <span class="commentDate">

                            ${formatDate(
                                date
                            )}

                        </span>

                    </div>


                    <p>

                        ${escapeHTML(
                            comment.text
                        )}

                    </p>

                </div>

            `;


            list.appendChild(
                item
            );

        }
    );

}


$("commentForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!currentVideo) {
                return;
            }


            const input =
                $("commentInput");


            const text =
                input.value.trim();


            if (!text) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `/api/videos/${currentVideo.id}/comments`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({
                                    text
                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error
                    );

                }


                input.value =
                    "";


                loadComments(
                    currentVideo.id
                );


            } catch (error) {

                alert(
                    error.message
                );

            }

        }
    );


/* =====================================
   BUSCADOR
===================================== */

$("searchButton")
    .addEventListener(
        "click",
        search
    );


$("searchInput")
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                search();

            }

        }
    );


async function search() {

    const q =
        $("searchInput")
            .value
            .trim();


    if (!q) {

        showHome();

        return;

    }


    try {

        const response =
            await fetch(
                `/api/search?q=${encodeURIComponent(q)}`
            );


        const data =
            await response.json();


        hidePages();

        searchPage.classList.remove(
            "hidden"
        );


        renderSearch(
            data
        );

    } catch (error) {

        console.error(error);

    }

}


function renderSearch(data) {

    const container =
        $("searchResults");


    container.innerHTML =
        "";


    if (
        !data.channels.length &&
        !data.videos.length
    ) {

        container.innerHTML = `
            <p style="
                color:#666;
                margin-top:30px;
            ">
                No encontramos resultados.
            </p>
        `;

        return;

    }


    if (data.channels.length) {

        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            "Canales";


        container.appendChild(
            title
        );


        data.channels.forEach(
            channel => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "channelResult";


                const avatar 