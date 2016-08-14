<?php
$dirIterator = new RecursiveDirectoryIterator('addon');
$iterator = new RecursiveIteratorIterator($dirIterator, RecursiveIteratorIterator::SELF_FIRST);

foreach ($iterator as $file) {
    echo $file, "\n";
}