<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']); 

Route::post('/register', [AuthController::class, 'register']);
Route::get('/users', [AuthController::class, 'getUsers']);
Route::patch('/users/{id}/role', [AuthController::class, 'updateRole']);
Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);

Route::post('/check-username', [AuthController::class, 'checkUsername']);
Route::post('/change-password', [AuthController::class, 'changePassword']);

Route::get('/get-record', [AuthController::class, 'getRecords']);
Route::delete('/delete-record/{id}', [AuthController::class, 'deleteRecord']);
Route::put('/update-record/{id}', [AuthController::class, 'updateRecord']);

Route::get('/committees', [AuthController::class, 'getCommittees']);
Route::post('/committees', [AuthController::class, 'addCommittee']);
Route::delete('/committees/{id}', [AuthController::class, 'deleteCommittee']);

Route::get('/terms', [AuthController::class, 'getTerms']);
Route::post('/terms', [AuthController::class, 'addTerm']);
Route::delete('/terms/{id}', [AuthController::class, 'deleteTerm']);

Route::get('/committee-members', [AuthController::class, 'getCommitteeMembers']);
Route::delete('/committee-members', [AuthController::class, 'deleteCommitteeMembers']);
Route::post('/committee-members', [AuthController::class, 'addCommitteeMember']);
Route::post('/committee-members/batch', [AuthController::class, 'addCommitteeMembersBatch']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    Route::post('/profiles', [AuthController::class, 'updateProfile']);
    Route::post('/add-record', [AuthController::class, 'addRecord']);
});