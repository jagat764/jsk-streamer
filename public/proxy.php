<?php
if (!isset($_GET['url'])) {
  http_response_code(400);
  exit('Missing URL.');
}

$url = $_GET['url'];
$type = $_GET['type'] ?? 'video';

$headers = [
  "Referer: https://redgifs.com/",
  "User-Agent: Mozilla/5.0"
];

$context = stream_context_create([
  "http" => [
    "header" => implode("\r\n", $headers)
  ]
]);

if ($type === 'thumbnail') {
  header("Content-Type: image/jpeg");
} else {
  header("Content-Type: video/mp4");
}

readfile($url, false, $context);
