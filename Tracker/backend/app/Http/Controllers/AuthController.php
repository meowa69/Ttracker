<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    // Register a New User
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'user_name' => 'required|string|max:255|unique:users',
            'role' => 'required|in:admin,sub-admin,user',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'user_name' => $request->user_name,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    // Login User
    public function login(Request $request)
    {
        try {
            $user = User::where('user_name', $request->user_name)->first();

            if (!$user) {
                \Log::error('User not found: ' . $request->user_name);
                return response()->json(['message' => 'Invalid username or password'], 401);
            }

            if (!Hash::check($request->password, $user->password)) {
                \Log::error('Invalid password for user: ' . $request->user_name);
                return response()->json(['message' => 'Invalid username or password'], 401);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'token' => $token
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Check if Username Exists
    public function checkUsername(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
        ]);

        $exists = User::where('user_name', $request->username)->exists();

        return response()->json(['exists' => $exists]);
    }

    // Change Password
    public function changePassword(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'newPassword' => 'required|string|min:6',
        ]);

        $user = User::where('user_name', $request->username)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->password = Hash::make($request->newPassword);
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    // Update Profile
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'profile_picture_url' => 'nullable|string', // Add validation for avatar URL
        ]);

        $profile = Profile::updateOrCreate(
            ['user_id' => $user->id],
            ['name' => $request->input('name')]
        );

        if ($request->hasFile('profile_picture')) {
            if ($profile->profile_picture) {
                Storage::delete(str_replace('/storage/', 'public/', $profile->profile_picture));
            }

            $filePath = $request->file('profile_picture')->store('profile_pictures', 'public');
            $profile->profile_picture = '/storage/' . $filePath;
        } elseif ($request->has('profile_picture_url')) {
            // If an avatar URL is provided, save it directly
            $profile->profile_picture = $request->input('profile_picture_url');
        }

        $user->name = $request->input('name');
        $user->save();
        $profile->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'name' => $profile->name,
                'profile_picture' => $profile->profile_picture ? url($profile->profile_picture) : $request->input('profile_picture_url'),
            ],
        ]);
        
    }
}
