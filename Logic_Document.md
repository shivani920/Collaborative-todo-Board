# Logic Document: Smart Assign & Conflict Handling

## Smart Assign Implementation

### Overview
The Smart Assign feature automatically distributes tasks among team members based on their current workload, ensuring fair task distribution and preventing any single user from being overwhelmed.

### Algorithm Logic

#### 1. Workload Calculation
- **Active Tasks Count**: For each user, count tasks with status "todo" or "in-progress"
- **Completed Tasks Exclusion**: Tasks marked as "done" are not counted toward workload
- **Real-time Data**: Uses current database state for accurate calculations

#### 2. Assignment Process
\`\`\`
Step 1: Fetch all registered users from the database
Step 2: Query tasks collection to count active tasks per user
Step 3: Create workload map: {userId: activeTaskCount}
Step 4: Find user with minimum active tasks
Step 5: Handle tie-breaking (first user found with minimum count)
Step 6: Assign task to selected user
Step 7: Log activity and broadcast update via Socket.io
\`\`\`

#### 3. Benefits
- **Load Balancing**: Prevents task concentration on specific users
- **Fairness**: Ensures equitable work distribution
- **Efficiency**: Reduces manual assignment overhead
- **Scalability**: Works effectively as team size grows

### Example Scenario
\`\`\`
Team Members:
- Alice: 3 active tasks
- Bob: 1 active task  
- Charlie: 2 active tasks

New task assignment → Bob (lowest workload)
\`\`\`

## Conflict Handling Implementation

### Overview
The conflict resolution system manages simultaneous edits by multiple users, ensuring data integrity while providing flexible resolution options.

### Detection Mechanism

#### 1. Version-Based Tracking
- **Version Number**: Each task maintains an incrementing version number
- **Update Validation**: Compare client version with database version before updates
- **Conflict Trigger**: Mismatch indicates concurrent modifications

#### 2. Conflict Detection Flow
\`\`\`
User A starts editing Task X (version 5)
User B starts editing Task X (version 5)
User A submits changes → Task X becomes version 6
User B submits changes → Conflict detected (client has version 5, DB has version 6)
\`\`\`

### Resolution Strategies

#### 1. Keep Current Version
- **Action**: Reject incoming changes, maintain database state
- **Use Case**: When database version is more recent or comprehensive
- **Result**: User must refresh and re-apply changes

#### 2. Use Incoming Version
- **Action**: Accept new changes, overwrite database state
- **Use Case**: When incoming changes are more important or complete
- **Result**: Database updated with user's modifications

#### 3. Smart Merge (Automatic)
- **Field-by-Field Analysis**: Compare each task property individually
- **Merge Rules**:
  - **Timestamps**: Use most recent update time
  - **Description**: Combine both descriptions if different
  - **Priority**: Choose higher priority level
  - **Status**: Use incoming status if changed
  - **Assignment**: Preserve most recent assignment

#### 4. Smart Merge Example
\`\`\`
Database Version:
- Title: "Fix login bug"
- Description: "Users can't login"
- Priority: "medium"
- Status: "todo"
- Updated: 2:00 PM

Incoming Version:
- Title: "Fix login bug"
- Description: "Users can't login with Google OAuth"
- Priority: "high"
- Status: "in-progress"
- Updated: 2:05 PM

Merged Result:
- Title: "Fix login bug" (same)
- Description: "Users can't login with Google OAuth" (more detailed)
- Priority: "high" (higher priority chosen)
- Status: "in-progress" (newer status)
- Updated: 2:05 PM (most recent)
\`\`\`

### User Experience

#### 1. Conflict Dialog
- **Clear Options**: Present all three resolution strategies
- **Version Preview**: Show both versions side-by-side
- **Guided Decision**: Explain implications of each choice
- **One-Click Resolution**: Simple interface for quick decisions

#### 2. Automatic Handling
- **Simple Conflicts**: Auto-resolve when changes don't overlap
- **Complex Conflicts**: Require user intervention
- **Background Processing**: Handle conflicts without blocking UI

### Technical Implementation

#### 1. Database Operations
\`\`\`
1. Read current task version from database
2. Compare with client version
3. If versions match: proceed with update
4. If versions differ: trigger conflict resolution
5. Present options to user
6. Apply chosen resolution strategy
7. Increment version number
8. Broadcast changes to all clients
\`\`\`

#### 2. Real-time Communication
- **Socket.io Events**: Broadcast conflicts to all connected users
- **Live Updates**: Show when other users are editing tasks
- **Conflict Notifications**: Alert users about resolution outcomes

### Edge Cases Handled

#### 1. Multiple Simultaneous Conflicts
- **Queue Management**: Process conflicts in order of submission
- **User Notification**: Inform users about pending conflicts
- **State Consistency**: Maintain database integrity throughout

#### 2. Network Issues
- **Retry Logic**: Attempt conflict resolution multiple times
- **Fallback Strategy**: Default to manual resolution if auto-merge fails
- **Data Recovery**: Preserve user changes during network interruptions

#### 3. User Disconnection
- **Pending Changes**: Save incomplete edits temporarily
- **Reconnection Handling**: Restore editing state when user returns
- **Timeout Management**: Clear stale editing sessions

### Performance Considerations

#### 1. Optimization Strategies
- **Minimal Data Transfer**: Send only changed fields
- **Efficient Queries**: Use indexed database operations
- **Caching**: Store frequently accessed user and task data
- **Batch Updates**: Group multiple changes when possible

#### 2. Scalability
- **Horizontal Scaling**: Design supports multiple server instances
- **Database Sharding**: Partition data for large teams
- **Load Balancing**: Distribute conflict resolution processing

This conflict handling system ensures data integrity while maintaining a smooth collaborative experience, allowing teams to work together efficiently without losing important changes or experiencing data corruption.
