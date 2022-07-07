const AWS = require('aws-sdk')
const multer = require('fastify-multer')
const multerS3 = require('multer-s3')

const s3 = new AWS.S3({
    endpoint: "sfo2.digitaloceanspaces.com",
    credentials: {
        accessKeyId: "MRDOZUQOT2BAGJ2ZH37W",
        secretAccessKey: "KrWFGEe81ymaYMthIUXXBZ/sfW4cYSz9fWWMYA/KJp8"
    }
});

const upload = multer({
    storage: multerS3({
        s3,
        bucket: "cdnvelta",
        acl: 'public-read',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
            const mime = file.mimetype.split('/')
            const fullName = 'urbk-us-blog/' + Date.now().toString() + '.' + mime[1]
            cb(null, fullName);
        },
        fileFilter: function(req, file, cb) {
            const filetypes = 'jpeg|jpg|png';
            if (!file.originalname.match(filetypes)) {
                return cb(new Error('Only image files are allowed!'));
            }
            cb(null, true)
        }
    })
}).single('file')

module.exports = {
    upload,
    multer
}