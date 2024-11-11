<?php
require_once 'conexion.php';

header('Content-Type: application/json');

// Obtener todos los productos
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM productos");
        $productos = $stmt->fetchAll();
        echo json_encode($productos);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Agregar nuevo producto
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'addProduct') {
    try {
        $stmt = $pdo->prepare("INSERT INTO productos (nombre, cantidad, precioUnitario) VALUES (?, ?, ?)");
        $stmt->execute([
            $_POST['nombre'],
            $_POST['cantidad'],
            $_POST['precio']
        ]);
        
        $id = $pdo->lastInsertId();
        echo json_encode([
            'success' => true,
            'id' => $id,
            'message' => 'Producto agregado correctamente'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Eliminar producto
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'deleteProduct') {
    try {
        $ids = $_POST['ids'];
        $placeholders = str_repeat('?,', count($ids) - 1) . '?';
        $stmt = $pdo->prepare("DELETE FROM productos WHERE id IN ($placeholders)");
        $stmt->execute($ids);
        
        echo json_encode([
            'success' => true,
            'message' => 'Productos eliminados correctamente'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}