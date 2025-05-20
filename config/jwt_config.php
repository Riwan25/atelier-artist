<?php
// JWT Configuration
define('JWT_SECRET', 'your_super_secure_jwt_secret_key'); // Change this to a secure random key in production
define('JWT_ALGORITHM', 'HS256'); // Algorithm used for signing tokens
define('JWT_ISSUER', 'atelier-artist-api');
define('JWT_AUDIENCE', 'atelier-artist-webapp');
define('JWT_EXPIRY', 86400); // 24 hours in seconds
