<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::post('/check-username', [AuthController::class, 'checkUsername']);
Route::post('/change-password', [AuthController::class, 'changePassword']);

Route::get('/get-record', [AuthController::class, 'getRecords']);
Route::delete('/delete-record/{id}', [AuthController::class, 'deleteRecord']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    Route::post('/profiles', [AuthController::class, 'updateProfile']);
    Route::post('/add-record', [AuthController::class, 'addRecord']);

    

});
