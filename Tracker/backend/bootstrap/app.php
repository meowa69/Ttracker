<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Register Sanctum authentication middleware
        $middleware->alias([
            'auth:sanctum' => EnsureFrontendRequestsAreStateful::class,
        ]);

        // Append CORS middleware (Laravel 11 automatically applies CORS settings)
        $middleware->append(HandleCors::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // You can configure custom exception handling here if needed
    })->create();
