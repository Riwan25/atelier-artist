<?php
// This script will update all API files with proper CORS headers
$apiDir = __DIR__ . '/..';

// Define the CORS helper text to insert
$corsHelperCode = <<<'EOT'
// Include CORS helper
require_once '../helpers/cors_helper.php';

// Set CORS headers and handle preflight requests
handleCorsPreflightRequest();

// Set response content type
header('Content-Type: application/json');
EOT;

// Function to recursively find PHP files
function findPhpFiles($dir) {
    $files = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
    
    foreach ($iterator as $file) {
        if ($file->isFile() && $file->getExtension() === 'php') {
            // Skip this script and the cors_helper itself
            if (strpos($file->getPathname(), 'update_cors.php') === false && 
                strpos($file->getPathname(), 'cors_helper.php') === false) {
                $files[] = $file->getPathname();
            }
        }
    }
    
    return $files;
}

// Function to update file with CORS headers
function updateFileWithCorsHeaders($filePath, $corsCode) {
    $content = file_get_contents($filePath);
    
    // Check if file already has the CORS helper
    if (strpos($content, 'require_once \'../helpers/cors_helper.php\'') !== false) {
        echo "File already updated: " . $filePath . "\n";
        return;
    }
    
    // Replace existing CORS headers
    $patterns = [
        '/\/\/ Headers.*?(?=\/\/)/s',
        '/header\([\'"]Access-Control-Allow.*?;(\s*[\r\n]+)/s',
        '/if\s*\(\$_SERVER\[\'REQUEST_METHOD\'\]\s*===\s*\'OPTIONS\'\)\s*{.*?}(\s*[\r\n]+)/s'
    ];
    
    $newContent = $content;
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $newContent)) {
            $newContent = preg_replace($pattern, '', $newContent, 1);
        }
    }
    
    // Insert CORS helper code after the opening PHP tag
    $newContent = preg_replace('/(<\?php)/', "$1\n" . $corsCode, $newContent, 1);
    
    // Write back to the file
    if (file_put_contents($filePath, $newContent)) {
        echo "Updated: " . $filePath . "\n";
    } else {
        echo "Failed to update: " . $filePath . "\n";
    }
}

// Find all PHP files in the API directory
$phpFiles = findPhpFiles($apiDir);

// Update each file
foreach ($phpFiles as $file) {
    updateFileWithCorsHeaders($file, $corsHelperCode);
}

echo "Completed updating " . count($phpFiles) . " files.\n";
