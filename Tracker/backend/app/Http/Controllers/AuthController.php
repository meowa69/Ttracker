<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Profile;
use App\Models\AddRecord;
use App\Models\Committee;
use App\Models\CommitteeTerm;
use App\Models\CommitteeMember;
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

    // Add Record
    public function addRecord(Request $request)
    {
        
        try {

            \Log::info('Incoming Request:', $request->all());

            $validated = $request->validate([
                'no' => 'required|string|unique:add_record,no', // Table name should match DB
                'document_type' => 'required|string',
                'date_approved' => 'required|date',
                'title' => 'required|string',
            ]);
            
            $record = new AddRecord();
            $record->no = $validated['no'];                 
            $record->document_type = $validated['document_type'];
            $record->date_approved = $validated['date_approved'];
            $record->title = $validated['title'];
            $record->save();
            
            return response()->json(['message' => 'Record added successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Get Records
    public function getRecords()
    {
        try {
            $record = AddRecord::all();
            return response()->json($record, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Get all committees
    public function getCommittees()
    {
        return response()->json(Committee::all(), 200);
    }

    // Add a new committee
    public function addCommittee(Request $request)
    {
        $request->validate([
            'committee_name' => 'required|string|unique:committees,committee_name',
        ]);

        $committee = Committee::create(['committee_name' => $request->committee_name]);

        return response()->json(['message' => 'Committee added successfully', 'committee' => $committee], 201);
    }

    // Get all terms
    public function getTerms()
    {
        $existingTerms = CommitteeTerm::orderBy('id', 'asc')->get();
    
        // If database is empty, generate terms dynamically
        if ($existingTerms->isEmpty()) {
            for ($i = 1; $i <= 20; $i++) { // Start from 1 to 20
                $suffix = $this->getOrdinalSuffix($i);
                $termText = "{$i}{$suffix} CITY COUNCIL";
                CommitteeTerm::create(['term' => $termText]);
            }
            $existingTerms = CommitteeTerm::orderBy('id', 'asc')->get(); // Fetch in ascending order
        }
    
        return response()->json($existingTerms, 200);
    }
    
    // Function to get ordinal suffix
    private function getOrdinalSuffix($num)
    {
        if (in_array($num, [11, 12, 13])) return "TH"; // Handle special cases
        $lastDigit = $num % 10;
        if ($lastDigit === 1) return "ST";
        if ($lastDigit === 2) return "ND";
        if ($lastDigit === 3) return "RD";
        return "TH";
    }

    // Add a new term
    public function addTerm(Request $request)
    {
        $request->validate([
            'term' => 'required|string|unique:committee_terms,term',
        ]);

        $term = CommitteeTerm::create(['term' => $request->term]);

        return response()->json(['message' => 'Term added successfully', 'term' => $term], 201);
    }


    // Get all committee members
    public function getCommitteeMembers()
    {
        $members = CommitteeMember::with('committee', 'term')->get();
        return response()->json($members, 200);
    }

    // Add a new committee member
    public function addCommitteeMember(Request $request)
    {
        $request->validate([
            'committee' => 'required|string|exists:committees,committee_name',
            'term' => 'required|string|exists:committee_terms,term',
            'member_name' => 'required|string',
            'role' => 'required|in:chairman,vice_chairman,member',
        ]);

        // Fetch the correct IDs
        $committee = Committee::where('committee_name', $request->committee)->first();
        $term = CommitteeTerm::where('term', $request->term)->first();

        if (!$committee || !$term) {
            return response()->json(['message' => 'Invalid committee or term.'], 400);
        }

        $committeeId = $committee->id;
        $termId = $term->id;
        $role = $request->role;

        // Check constraints
        $chairmanExists = CommitteeMember::where('committee_id', $committeeId)
            ->where('term_id', $termId)
            ->where('role', 'chairman')
            ->exists();

        if ($role === 'chairman' && $chairmanExists) {
            return response()->json(['message' => 'A chairman already exists for this term.'], 400);
        }

        $viceChairmanExists = CommitteeMember::where('committee_id', $committeeId)
            ->where('term_id', $termId)
            ->where('role', 'vice_chairman')
            ->exists();

        if ($role === 'vice_chairman' && $viceChairmanExists) {
            return response()->json(['message' => 'A vice chairman already exists for this term.'], 400);
        }

        $memberCount = CommitteeMember::where('committee_id', $committeeId)
            ->where('term_id', $termId)
            ->where('role', 'member')
            ->count();

        if ($role === 'member' && $memberCount >= 5) {
            return response()->json(['message' => 'Maximum of 5 members reached.'], 400);
        }

        // Insert member using IDs
        $member = CommitteeMember::create([
            'committee_id' => $committeeId,
            'term_id' => $termId,
            'member_name' => $request->member_name,
            'role' => $role,
        ]);

        return response()->json(['message' => 'Member added successfully.', 'member' => $member], 201);
    }

    // Delete a committee
    public function deleteCommittee($id)
    {
        $committee = Committee::find($id);

        if (!$committee) {
            return response()->json(['message' => 'Committee not found'], 404);
        }

        try {
            // Delete related committee members first
            CommitteeMember::where('committee_id', $id)->delete();

            // Now delete the committee
            $committee->delete();

            return response()->json(['message' => 'Committee deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete committee'], 500);
        }
    }
    
}
