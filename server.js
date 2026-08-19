const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const ROOT = __dirname;

const DATA_DIR = path.join(ROOT, "data");
const UPLOAD_DIR = path.join(ROOT, "uploads");

const VIDEO_DIR = path.join(UPLOAD_DIR, "videos");
const AVATAR_DIR = path.join(UPLOAD_DIR, "avatars");
const BANNER_DIR = path.join(UPLOAD_DIR, "banners");

const USERS_FILE = path.join(DATA_DIR, "users.json");
const VIDEOS_FILE = path.join(DATA_DIR, "videos.json");
const COMMENTS_FILE = path.join(DATA_DIR, "comments.json");

[
    DATA_DIR,
    UPLOAD_DIR,
    VIDEO_DIR,
    AVATAR_DIR,
    BANNER_DIR
].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
});

function ensureJSON(file) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, "[]");
    }
}

ensureJSON(USERS_FILE);
ensureJSON(VIDEOS_FILE);
ensureJSON(COMMENTS_FILE);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(
    path.join(ROOT, "public")
));

app.use("/uploads", express.static(UPLOAD_DIR));


function readJSON(file) {
    try {
        return JSON.parse(
            fs.readFileSync(file, "utf8")
        );
    } catch {
        return [];
    }
}


function writeJSON(file, data) {
    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2)
    );
}


/* =====================================
   USUARIO
===================================== */

function createDefaultUser() {

    const users = readJSON(USERS_FILE);

    if (users.length === 0) {

        users.push({
            id: "user_1",
            name: "Usuario KIV",
            description: "Bienvenido a mi canal KIV.",
            avatar: "",
            banner: "",
            createdAt: new Date().toISOString()
        });

        writeJSON(
            USERS_FILE,
            users
        );
    }
}

createDefaultUser();


/* =====================================
   MULTER
===================================== */

function makeStorage(folder, prefix) {

    return multer.diskStorage({

        destination: (req, file, cb) => {
            cb(null, folder);
        },

        filename: (req, file, cb) => {

            const ext =
                path.extname(file.originalname)
                    .toLowerCase();

            const filename =
                prefix +
                "_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 9) +
                ext;

            cb(null, filename);
        }

    });
}


const videoUpload = multer({

    storage:
        makeStorage(
            VIDEO_DIR,
            "video"
        ),

    limits: {
        fileSize:
            1024 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        if (
            file.mimetype &&
            file.mimetype.startsWith("video/")
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "El archivo debe ser un vídeo."
                )
            );
        }
    }

});


const imageUpload = multer({

    storage:
        makeStorage(
            AVATAR_DIR,
            "image"
        ),

    limits: {
        fileSize:
            25 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        if (
            file.mimetype &&
            file.mimetype.startsWith("image/")
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "El archivo debe ser una imagen."
                )
            );
        }
    }

});


const bannerUpload = multer({

    storage:
        makeStorage(
            BANNER_DIR,
            "banner"
        ),

    limits: {
        fileSize:
            25 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        if (
            file.mimetype &&
            file.mimetype.startsWith("image/")
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "El banner debe ser una imagen."
                )
            );
        }
    }

});


/* =====================================
   PERFIL
===================================== */

app.get("/api/profile", (req, res) => {

    const users =
        readJSON(USERS_FILE);

    res.json(
        users[0] || null
    );
});


app.put(
    "/api/profile",
    (req, res) => {

        const users =
            readJSON(USERS_FILE);

        if (!users[0]) {

            return res.status(404).json({
                error:
                    "Usuario no encontrado."
            });

        }

        const user = users[0];

        if (
            typeof req.body.name ===
            "string"
        ) {

            const name =
                req.body.name.trim();

            if (name.length > 0) {
                user.name =
                    name.substring(0, 50);
            }
        }


        if (
            typeof req.body.description ===
            "string"
        ) {

            user.description =
                req.body.description
                    .trim()
                    .substring(0, 500);

        }


        writeJSON(
            USERS_FILE,
            users
        );


        res.json({
            success: true,
            user
        });

    }
);


/* =====================================
   FOTO DE PERFIL
===================================== */

app.post(
    "/api/profile/avatar",
    (req, res) => {

        imageUpload.single(
            "avatar"
        )(req, res, error => {

            if (error) {

                return res.status(400).json({
                    error:
                        error.message
                });

            }


            if (!req.file) {

                return res.status(400).json({
                    error:
                        "No se seleccionó una imagen."
                });

            }


            const users =
                readJSON(USERS_FILE);

            const user =
                users[0];


            if (!user) {

                return res.status(404).json({
                    error:
                        "Usuario no encontrado."
                });

            }


            user.avatar =
                "/uploads/avatars/" +
                req.file.filename;


            writeJSON(
                USERS_FILE,
                users
            );


            res.json({
                success: true,
                user
            });

        });

    }
);


/* =====================================
   BANNER
===================================== */

app.post(
    "/api/profile/banner",
    (req, res) => {

        bannerUpload.single(
            "banner"
        )(req, res, error => {

            if (error) {

                return res.status(400).json({
                    error:
                        error.message
                });

            }


            if (!req.file) {

                return res.status(400).json({
                    error:
                        "No se seleccionó una imagen."
                });

            }


            const users =
                readJSON(USERS_FILE);

            const user =
                users[0];


            if (!user) {

                return res.status(404).json({
                    error:
                        "Usuario no encontrado."
                });

            }


            user.banner =
                "/uploads/banners/" +
                req.file.filename;


            writeJSON(
                USERS_FILE,
                users
            );


            res.json({
                success: true,
                user
            });

        });

    }
);


/* =====================================
   VÍDEOS
===================================== */

app.get(
    "/api/videos",
    (req, res) => {

        const videos =
            readJSON(VIDEOS_FILE);

        res.json(
            videos
                .slice()
                .reverse()
        );

    }
);


app.get(
    "/api/videos/:id",
    (req, res) => {

        const videos =
            readJSON(VIDEOS_FILE);

        const video =
            videos.find(
                item =>
                    item.id ===
                    req.params.id
            );


        if (!video) {

            return res.status(404).json({
                error:
                    "Vídeo no encontrado."
            });

        }


        res.json(video);

    }
);


/* =====================================
   SUBIR VÍDEO
===================================== */

app.post(
    "/api/videos",
    (req, res) => {

        videoUpload.single(
            "video"
        )(req, res, error => {

            if (error) {

                return res.status(400).json({
                    error:
                        error.message
                });

            }


            if (!req.file) {

                return res.status(400).json({
                    error:
                        "Selecciona un vídeo."
                });

            }


            const title =
                String(
                    req.body.title || ""
                )
                .trim()
                .substring(0, 150);


            const description =
                String(
                    req.body.description || ""
                )
                .trim()
                .substring(0, 2000);


            if (!title) {

                fs.unlinkSync(
                    req.file.path
                );

                return res.status(400).json({
                    error:
                        "El vídeo necesita un título."
                });

            }


            const users =
                readJSON(USERS_FILE);

            const user =
                users[0];


            const videos =
                readJSON(VIDEOS_FILE);


            const video = {

                id:
                    "video_" +
                    Date.now(),

                title,

                description,

                url:
                    "/uploads/videos/" +
                    req.file.filename,

                author: {

                    id:
                        user.id,

                    name:
                        user.name,

                    avatar:
                        user.avatar

                },

                likes: 0,

                views: 0,

                createdAt:
                    new Date().toISOString()

            };


            videos.push(video);


            writeJSON(
                VIDEOS_FILE,
                videos
            );


            res.json({
                success: true,
                video
            });

        });

    }
);


/* =====================================
   LIKE
===================================== */

app.post(
    "/api/videos/:id/like",
    (req, res) => {

        const videos =
            readJSON(VIDEOS_FILE);

        const video =
            videos.find(
                item =>
                    item.id ===
                    req.params.id
            );


        if (!video) {

            return res.status(404).json({
                error:
                    "Vídeo no encontrado."
            });

        }


        video.likes =
            Number(video.likes || 0) + 1;


        writeJSON(
            VIDEOS_FILE,
            videos
        );


        res.json({
            success: true,
            likes: video.likes
        });

    }
);


/* =====================================
   COMENTARIOS
===================================== */

app.get(
    "/api/videos/:id/comments",
    (req, res) => {

        const comments =
            readJSON(COMMENTS_FILE);


        const result =
            comments
                .filter(
                    comment =>
                        comment.videoId ===
                        req.params.id
                )
                .reverse();


        res.json(result);

    }
);


app.post(
    "/api/videos/:id/comments",
    (req, res) => {

        const text =
            String(
                req.body.text || ""
            )
            .trim();


        if (!text) {

            return res.status(400).json({
                error:
                    "Escribe un comentario."
            });

        }


        if (text.length > 500) {

            return res.status(400).json({
                error:
                    "El comentario es demasiado largo."
            });

        }


        const videos =
            readJSON(VIDEOS_FILE);


        const video =
            videos.find(
                item =>
                    item.id ===
                    req.params.id
            );


        if (!video) {

            return res.status(404).json({
                error:
                    "Vídeo no encontrado."
            });

        }


        const users =
            readJSON(USERS_FILE);

        const user =
            users[0];


        const comments =
            readJSON(COMMENTS_FILE);


        const comment = {

            id:
                "comment_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 8),

            videoId:
                req.params.id,

            userId:
                user.id,

            userName:
                user.name,

            userAvatar:
                user.avatar,

            text,

            createdAt:
                new Date().toISOString()

        };


        comments.push(comment);


        writeJSON(
            COMMENTS_FILE,
            comments
        );


        res.json({
            success: true,
            comment
        });

    }
);


/* =====================================
   BUSCADOR
===================================== */

app.get(
    "/api/search",
    (req, res) => {

        const q =
            String(
                req.query.q || ""
            )
            .trim()
            .toLowerCase();


        if (!q) {

            return res.json({
                videos: [],
                channels: []
            });

        }


        const videos =
            readJSON(VIDEOS_FILE);

        const users =
            readJSON(USERS_FILE);


        const foundVideos =
            videos.filter(video => {

                return (

                    String(
                        video.title || ""
                    )
                    .toLowerCase()
                    .includes(q)

                    ||

                    String(
                        video.description || ""
                    )
                    .toLowerCase()
                    .includes(q)

                    ||

                    String(
                        video.author?.name || ""
                    )
                    .toLowerCase()
                    .includes(q)

                );

            });


        const foundChannels =
            users.filter(user => {

                return String(
                    user.name || ""
                )
                .toLowerCase()
                .includes(q);

            });


        res.json({

            videos:
                foundVideos.reverse(),

            channels:
                foundChannels

        });

    }
);


/* =====================================
   ERRORES
===================================== */

app.use(
    (error, req, res, next) => {

        console.error(error);

        res.status(500).json({
            error:
                error.message ||
                "Error interno del servidor."
        });

    }
);


/* =====================================
   INICIAR
===================================== */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");
        console.log(
            "================================"
        );
        console.log(
            "             KIV"
        );
        console.log(
            "================================"
        );
        console.log(
            `http://localhost:${PORT}`
        );
        console.log("");

    }
);