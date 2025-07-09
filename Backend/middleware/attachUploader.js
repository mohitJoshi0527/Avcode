import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { s3 } from '../config/aws.js';

// Define allowed MIME types for documents and code files
const allowedMimeTypes = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'application/javascript',
  'text/javascript',
  'application/x-javascript',
  'application/ecmascript',
  'text/ecmascript',
  'application/x-typescript',
  'text/x-typescript',
  'text/x-python',
  'application/x-python-code',
  'text/x-java-source',
  'application/java',
  'application/x-java-class',
  'text/x-csrc',
  'text/x-c++src',
  'text/x-c',
  'text/x-c++',
  'text/x-chdr',
  'text/x-c++hdr',
  'text/x-csharp',
  'application/x-csharp',
  'text/x-go',
  'application/x-go',
  'application/x-httpd-php',
  'application/php',
  'text/x-php',
  'application/x-ruby',
  'text/x-ruby',
  'application/x-sh',
  'application/x-shellscript',
  'text/x-shellscript',
  'text/x-swift',
  'text/x-kotlin',
  'text/x-rustsrc',
  'text/x-r-source',
  'text/x-scala',
  'text/x-haskell',
  'application/vnd.dart',
  'text/x-dart',
  'text/x-lua'
];

// Define allowed file extensions as fallback
const allowedExtensions = [
  '.pdf', '.zip', '.txt',
  '.js', '.ts', '.jsx', '.tsx',
  '.py', '.java', '.c', '.cpp', '.h', '.cs', '.go', '.php', '.rb', '.sh',
  '.swift', '.kt', '.rs', '.r', '.scala', '.hs', '.dart', '.lua'
];

// Multer S3 storage configuration
const attachmentUploader = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileName = `attachments/${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB limit
  fileFilter: (req, file, cb) => {
    // Check MIME type and extension
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);
    const isExtAllowed = allowedExtensions.includes(ext);

    if (isMimeAllowed || isExtAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or code files are allowed!'), false);
    }
  },
});

export default attachmentUploader;
