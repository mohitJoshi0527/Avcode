import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3 } from '../config/aws.js';

const allowedMimeTypes = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'application/javascript',
  'text/javascript',
  'text/x-python',
  'text/x-java-source',
  'application/x-python-code',
  'text/x-csrc',
  'text/x-c++src',
];

const attachmentUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `attachments/${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter: function (req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or code files are allowed!'), false);
    }
  },
});

export default attachmentUploader;

