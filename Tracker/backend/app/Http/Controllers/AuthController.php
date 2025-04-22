<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Profile;
use App\Models\AddRecord;
use App\Models\Committee;
use App\Models\CommitteeTerm;
use App\Models\CommitteeMember;
use App\Models\EditRecord;
use App\Models\TransmittedRecipient;
use App\Models\DeletionRequest;
use App\Models\History;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;


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

    // Fetch all users with pagination
    public function getUsers(Request $request)
    {
        $perPage = 6; // 6 users per page
        $users = User::select('id', 'name', 'user_name', 'role', 'created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $users->items(),
            'current_page' => $users->currentPage(),
            'total_pages' => $users->lastPage(),
            'total' => $users->total(),
        ], 200);
    }

    // Update user role
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:admin,sub-admin,user',
        ]);

        $user = User::findOrFail($id);
        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => 'User role updated successfully', 'user' => $user], 200);
    }

    // Delete user
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully'], 200);
    }

    // Login User (unchanged for now, but simplified if status isn’t needed)
    public function login(Request $request)
    {
        try {
            $user = User::where('user_name', $request->user_name)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                \Log::error('Invalid credentials for user: ' . $request->user_name);
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

    // Helper function to log actions to histories table
    private function logHistory($username, $document_type, $document_no, $action)
    {
        try {
            $username = $username ?? 'unknown';
            $history = History::create([
                'username' => $username,
                'document_type' => $document_type,
                'document_no' => $document_no,
                'action' => $action,
            ]);
            \Log::info("Logged history: username={$username}, document_type={$document_type}, document_no={$document_no}, action={$action}");
        } catch (\Exception $e) {
            \Log::error("Failed to log history: " . $e->getMessage());
        }
    }

   // Add Record
   public function addRecord(Request $request)
   {
       try {
           \Log::info('Incoming Request:', $request->all());

           $validated = $request->validate([
               'no' => 'required|string|unique:add_record,no',
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
           
           // Log the action
           $this->logHistory(
               Auth::user()->user_name,
               $validated['document_type'],
               $validated['no'],
               'Add Document'
           );

           return response()->json(['message' => 'Record added successfully'], 201);
       } catch (\Exception $e) {
           return response()->json(['error' => $e->getMessage()], 500);
       }
   }

    // Get Records
    public function getRecords()
    {
        try {
            \Log::info('Fetching all records with edit details');
            $records = AddRecord::leftJoin('edit_record', 'add_record.id', '=', 'edit_record.record_id')
                ->with(['editRecord.transmittedRecipients' => function ($query) {
                    $query->select('id', 'edit_record_id', 'name', 'designation_office', 'address');
                }])
                ->select(
                    'add_record.id',
                    'add_record.no',
                    'add_record.document_type',
                    'add_record.date_approved',
                    'add_record.title',
                    'edit_record.committee_sponsor as sponsor',
                    'edit_record.status',
                    'edit_record.vice_mayor_forwarded as vm_forwarded',
                    'edit_record.vice_mayor_received as vm_received',
                    'edit_record.city_mayor_forwarded as cm_forwarded',
                    'edit_record.city_mayor_received as cm_received',
                    'edit_record.date_transmitted',
                    'edit_record.remarks',
                    'edit_record.completed',          
                    'edit_record.completion_date'     
                )
                ->get();

            \Log::info('Records fetched successfully', ['count' => $records->count()]);
            return response()->json($records, 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching records: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

   // Update Record
   public function updateRecord(Request $request, $id)
   {
       try {
           $validated = $request->validate([
               'committee_sponsor' => 'nullable|string',
               'status' => 'nullable|string',
               'vm_forwarded' => 'nullable|date',
               'vm_received' => 'nullable|date',
               'cm_forwarded' => 'nullable|date',
               'cm_received' => 'nullable|date',
               'date_transmitted' => 'nullable|date',
               'remarks' => 'nullable|string',
               'completed' => 'nullable|boolean',
               'completion_date' => 'nullable|date',
               'new_recipients' => 'nullable|array',
               'new_recipients.*.name' => 'required|string',
               'new_recipients.*.designation' => 'nullable|string',
               'new_recipients.*.address' => 'required|string',
               'recipients_to_remove' => 'nullable|array',
               'recipients_to_remove.*' => 'integer|exists:transmitted_recipients,id',
           ]);

           $editRecord = EditRecord::firstOrNew(['record_id' => $id]);

           $editRecord->fill([
               'committee_sponsor' => $validated['committee_sponsor'] ?? $editRecord->committee_sponsor,
               'status' => $validated['status'] ?? $editRecord->status,
               'vice_mayor_forwarded' => $validated['vm_forwarded'] ?? $editRecord->vice_mayor_forwarded,
               'vice_mayor_received' => $validated['vm_received'] ?? $editRecord->vice_mayor_received,
               'city_mayor_forwarded' => $validated['cm_forwarded'] ?? $editRecord->city_mayor_forwarded,
               'city_mayor_received' => $validated['cm_received'] ?? $editRecord->city_mayor_received,
               'date_transmitted' => $validated['date_transmitted'] ?? $editRecord->date_transmitted,
               'remarks' => $validated['remarks'] ?? $editRecord->remarks,
               'completed' => $validated['completed'] ?? $editRecord->completed ?? false,
               'completion_date' => $validated['completion_date'] ?? $editRecord->completion_date,
           ]);

           $editRecord->save();

           // Handle new recipients
           if (isset($validated['new_recipients'])) {
               foreach ($validated['new_recipients'] as $recipient) {
                   $newRecipient = $editRecord->transmittedRecipients()->create([
                       'name' => $recipient['name'],
                       'designation_office' => $recipient['designation'],
                       'address' => $recipient['address'],
                   ]);
                   \Log::info("Added new recipient:", $newRecipient->toArray());
               }
           }

           // Handle recipients to remove
           if (isset($validated['recipients_to_remove']) && !empty($validated['recipients_to_remove'])) {
               $editRecord->transmittedRecipients()
                   ->whereIn('id', $validated['recipients_to_remove'])
                   ->delete();
           }

           // Fetch the original record to get document_type and no
           $record = AddRecord::findOrFail($id);

           // Log the action
           $this->logHistory(
               Auth::user()->user_name,
               $record->document_type,
               $record->no,
               'Update Document'
           );

           // Fetch the updated record with its transmitted recipients
           $updatedRecord = EditRecord::with('transmittedRecipients')->find($editRecord->id);
           $responseData = $updatedRecord->toArray();
           \Log::info("Final response data with transmitted recipients:", $responseData);

           return response()->json(['message' => 'Record updated successfully', 'data' => $responseData], 200);
       } catch (\Exception $e) {
           \Log::error('Update error: ' . $e->getMessage());
           return response()->json(['message' => $e->getMessage()], 500);
       }
   }
    
    // Delete Record
    public function deleteRecord($id)
    {
        try {
            \Log::info("Attempting to delete record with ID: {$id}");

            // Find the record in add_record table
            $record = AddRecord::find($id);
            if (!$record) {
                \Log::warning("Record not found with ID: {$id}");
                return response()->json(['error' => 'Record not found'], 404);
            }

            // Log the action before deletion
            $this->logHistory(
                Auth::user()->user_name,
                $record->document_type,
                $record->no,
                'Delete Document'
            );

            // Delete related edit_record entry if it exists
            $editRecord = EditRecord::where('record_id', $id)->first();
            if ($editRecord) {
                $editRecord->delete();
                \Log::info("Deleted related edit_record for record ID: {$id}");
            }

            // Delete the main record
            $record->delete();
            \Log::info("Successfully deleted record with ID: {$id}");

            return response()->json(['message' => 'Record deleted successfully'], 200);
        } catch (\Exception $e) {
            \Log::error("Error deleting record with ID: {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to delete record: ' . $e->getMessage()], 500);
        }
    }
    
    // Submit Deletion Request
    public function submitDeletionRequest(Request $request)
    {
        try {
            $validated = $request->validate([
                'record_id' => 'required|exists:add_record,id',
                'user_name' => 'required|string',
                'document_type' => 'required|string',
                'number' => 'required|string',
                'title' => 'required|string',
                'reason' => 'required|string',
            ]);

            $deletionRequest = DeletionRequest::create([
                'record_id' => $validated['record_id'],
                'user_name' => $validated['user_name'],
                'document_type' => $validated['document_type'],
                'number' => $validated['number'],
                'title' => $validated['title'],
                'reason' => $validated['reason'],
                'status' => 'Pending',
            ]);

            // Log the action
            $this->logHistory(
                $validated['user_name'],
                $validated['document_type'],
                $validated['number'],
                'Request Delete Document'
            );

            \Log::info('Deletion request submitted:', $deletionRequest->toArray());

            return response()->json(['message' => 'Deletion request submitted successfully', 'data' => $deletionRequest], 201);
        } catch (\Exception $e) {
            \Log::error('Error submitting deletion request: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to submit deletion request: ' . $e->getMessage()], 500);
        }
    }
    

    // Get all deletion requests
    public function getDeletionRequests()
    {
        try {
            $requests = DeletionRequest::with('record')->get();
            return response()->json($requests, 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching deletion requests: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch deletion requests: ' . $e->getMessage()], 500);
        }
    }

    // Handle deletion request (approve/reject)
    public function handleDeletionRequest(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:Approved,Rejected',
            ]);

            $deletionRequest = DeletionRequest::findOrFail($id);

            if ($request->status === 'Approved') {
                // Delete the associated record
                $record = AddRecord::find($deletionRequest->record_id);
                if ($record) {
                    // Delete related edit_record entry
                    EditRecord::where('record_id', $record->id)->delete();
                    $record->delete();
                    \Log::info("Record deleted for deletion request ID: {$id}");
                }
                $deletionRequest->status = 'Approved';
            } else {
                $deletionRequest->status = 'Rejected';
            }

            $deletionRequest->save();

            \Log::info("Deletion request {$id} updated to status: {$request->status}");

            return response()->json(['message' => "Deletion request {$request->status} successfully"], 200);
        } catch (\Exception $e) {
            \Log::error('Error handling deletion request: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to handle deletion request: ' . $e->getMessage()], 500);
        }
    }

    // Get History Logs
    public function getHistory(Request $request)
    {
        try {
            $perPage = $request->query('per_page', 20);
            $page = $request->query('page', 1);
            $category = $request->query('category', 'All');
            $search = $request->query('search', '');
            $filterBy = $request->query('filter_by', 'all');
            $dateFrom = $request->query('date_from', '');
            $dateTo = $request->query('date_to', '');

            $query = History::query();

            // Apply category filter
            if ($category !== 'All') {
                $query->where('action', $category);
            }

            // Apply search filter
            if ($search && $filterBy !== 'all') {
                $query->where($filterBy, 'like', '%' . $search . '%');
            }

            // Apply date range filter
            if ($dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            }
            if ($dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            }

            // Paginate results
            $logs = $query->select('id', 'username', 'document_type', 'document_no', 'action', 'created_at')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            // Transform created_at to timestamp with explicit timezone
            $transformedLogs = $logs->getCollection()->map(function ($log) {
                return [
                    'id' => $log->id,
                    'username' => $log->username,
                    'document_type' => $log->document_type,
                    'document_no' => $log->document_no,
                    'action' => $log->action,
                    'timestamp' => $log->created_at->setTimezone('Asia/Manila')->format('Y-m-d h:i A'),
                ];
            });

            return response()->json([
                'data' => $transformedLogs,
                'current_page' => $logs->currentPage(),
                'total_pages' => $logs->lastPage(),
                'total' => $logs->total(),
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching history logs: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch history logs: ' . $e->getMessage()], 500);
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

    // Delete Term
    public function deleteTerm($id)
    {
        $term = CommitteeTerm::find($id);

        if (!$term) {
            return response()->json(['message' => 'Term not found'], 404);
        }

        $term->delete();

        return response()->json(['message' => 'Term deleted successfully'], 200);
    }


    // Get all committee members
    public function getCommitteeMembers(Request $request)
    {
        $committeeId = $request->query('committee_id');
        $termId = $request->query('term_id');
    
        $query = CommitteeMember::with('committee', 'term');
    
        if ($committeeId) {
            $query->where('committee_id', $committeeId);
        }
    
        if ($termId) {
            $query->where('term_id', $termId);
        }
    
        $members = $query->get();
        return response()->json($members, 200);
    }

    public function deleteCommitteeMembers(Request $request)
    {
        $request->validate([
            'committee_id' => 'required|exists:committees,id',
            'term_id' => 'required|exists:committee_terms,id',
        ]);
    
        CommitteeMember::where('committee_id', $request->committee_id)
            ->where('term_id', $request->term_id)
            ->delete();
    
        return response()->json(['message' => 'Members deleted successfully'], 200);
    }
    
    // Update addCommitteeMember to use committee_name consistently
    public function addCommitteeMember(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'committee_name' => 'required|string|exists:committees,committee_name',
            'term' => 'required|string|exists:committee_terms,term',
            'member_name' => 'required|string',
            'role' => 'required|in:chairman,vice_chairman,member',
        ]);
    
        // Fetch committee and term based on provided names
        $committee = Committee::where('committee_name', $request->committee_name)->first();
        $term = CommitteeTerm::where('term', $request->term)->first();
    
        // Check if committee or term is invalid
        if (!$committee || !$term) {
            return response()->json(['message' => 'Invalid committee or term.'], 400);
        }
    
        $committeeId = $committee->id;
        $termId = $term->id;
        $role = $request->role;
    
        // Check for existing chairman
        $chairmanExists = CommitteeMember::where('committee_id', $committeeId)
            ->where('term_id', $termId)
            ->where('role', 'chairman')
            ->exists();
    
        // Check for existing vice chairman
        $viceChairmanExists = CommitteeMember::where('committee_id', $committeeId)
            ->where('term_id', $termId)
            ->where('role', 'vice_chairman')
            ->exists();
    
        // Count existing regular members
        $memberCount = CommitteeMember::where('committee_id', $committeeId)
            ->where('term_id', $termId)
            ->where('role', 'member')
            ->count();
    
        // Your snippet goes here - validation rules for roles
        if ($role === 'chairman' && $chairmanExists) {
            return response()->json(['message' => 'A chairman already exists for this term.'], 400);
        }
        if ($role === 'vice_chairman' && $viceChairmanExists) {
            return response()->json(['message' => 'A vice chairman already exists for this term.'], 400);
        }
        if ($role === 'member' && $memberCount >= 5) {
            return response()->json(['message' => 'Maximum of 5 members reached.'], 400);
        }
    
        // Create the new committee member
        $member = CommitteeMember::create([
            'committee_id' => $committeeId,
            'term_id' => $termId,
            'member_name' => $request->member_name,
            'role' => $role,
        ]);
    
        return response()->json(['message' => 'Member added successfully.', 'member' => $member], 201);
    }

    // Add multiple committee members in a single request
    public function addCommitteeMembersBatch(Request $request)
    {
        \Log::info("Received batch payload: " . json_encode($request->all()));

        $request->validate([
            'committee_name' => 'required|string|exists:committees,committee_name',
            'term' => 'required|string|exists:committee_terms,term',
            'members' => 'required|array',
            'members.*.member_name' => 'required|string',
            'members.*.role' => 'required|in:chairman,vice_chairman,member',
        ]);

        $committee = Committee::where('committee_name', $request->committee_name)->first();
        $term = CommitteeTerm::where('term', $request->term)->first();

        if (!$committee || !$term) {
            \Log::error("Invalid committee or term: committee_name={$request->committee_name}, term={$request->term}");
            return response()->json(['message' => 'Invalid committee or term.'], 400);
        }

        $committeeId = $committee->id;
        $termId = $term->id;

        // Check constraints for all members at once
        $chairmanCount = 0;
        $viceChairmanCount = 0;
        $memberCount = 0;

        foreach ($request->members as $member) {
            if ($member['role'] === 'chairman') $chairmanCount++;
            if ($member['role'] === 'vice_chairman') $viceChairmanCount++;
            if ($member['role'] === 'member') $memberCount++;
        }

        // Check existing records
        $existingChairman = CommitteeMember::where('committee_id', $committeeId)
            ->where('term_id', $termId)
            ->where('role', 'chairman')
            ->exists();

        $existingViceChairman = CommitteeMember::where('committee_id', $committeeId)
            ->where('term_id', $termId)
            ->where('role', 'vice_chairman')
            ->exists();

        $existingMemberCount = CommitteeMember::where('committee_id', $committeeId)
            ->where('term_id', $termId)
            ->where('role', 'member')
            ->count();

        // Validate constraints
        if ($chairmanCount > 1 || ($chairmanCount > 0 && $existingChairman)) {
            return response()->json(['message' => 'A chairman already exists or multiple chairmen provided.'], 400);
        }
        if ($viceChairmanCount > 1 || ($viceChairmanCount > 0 && $existingViceChairman)) {
            return response()->json(['message' => 'A vice chairman already exists or multiple vice chairmen provided.'], 400);
        }
        if ($memberCount + $existingMemberCount > 5) {
            return response()->json(['message' => 'Maximum of 5 members reached.'], 400);
        }

        // Insert all members in a single transaction
        $results = [];
        DB::beginTransaction();
        try {
            foreach ($request->members as $memberData) {
                $member = new CommitteeMember();
                $member->committee_id = $committeeId;
                $member->term_id = $termId;
                $member->member_name = $memberData['member_name'];
                $member->role = $memberData['role'];
                $member->save();

                $results[] = ['member' => $memberData['member_name'], 'success' => true];
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Failed to save members: " . $e->getMessage());
            return response()->json(['message' => 'Failed to save members.', 'error' => $e->getMessage()], 500);
        }

        \Log::info("Saved members: " . json_encode($results));

        return response()->json(['success' => true, 'message' => 'Members added successfully.', 'results' => $results], 201);
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
