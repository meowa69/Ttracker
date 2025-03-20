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

Route::get('/committees', [AuthController::class, 'getCommittees']);
Route::post('/committees', [AuthController::class, 'addCommittee']);
Route::delete('/committees/{id}', [CommitteeController::class, 'deleteCommittee']);

Route::get('/terms', [AuthController::class, 'getTerms']);
Route::post('/terms', [AuthController::class, 'addTerm']);

Route::get('/committee-members', [AuthController::class, 'getCommitteeMembers']);
Route::post('/committee-members', [AuthController::class, 'addCommitteeMember']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    Route::post('/profiles', [AuthController::class, 'updateProfile']);
    Route::post('/add-record', [AuthController::class, 'addRecord']);

    

});
