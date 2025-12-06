# Implementation Guide for Share & Per-User History

## ISSUE 1: Share Button - Make Reports Publicly Accessible

### Backend Changes Needed:

**File: `backend/controllers/controller.js`**

1. **Update `getAllFiles` function** (line 19-27):
```javascript
// Get all files (filtered by user)
exports.getAllFiles = async (req, res) => {
    try {
        // Get userId from request header or query
        const userId = req.query.userId || req.headers['x-user-id'] || null;
        
        // Filter by userId (null for guest users)
        const query = userId && userId !== 'null' && userId !== 'guest' ? { userId } : { userId: null };
        const sequences = await Sequence.find(query).sort({ timestamp: -1 });
        res.status(200).json(sequences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```

2. **Update `postFasta` function** (around line 120-180):
Add `userId` when creating new sequence:
```javascript
// Get userId from request
const userId = req.body.userId || req.headers['x-user-id'] || null;

const newSequence = new Sequence({
    filename: filename || 'unknown.fasta',
    header,
    sequence,
    length,
    gc_percent,
    nucleotide_counts,
    orf_detected,
    interpretation,
    userId: userId && userId !== 'null' && userId !== 'guest' ? userId : null  // Add this line
});
```

3. **Update `deleteById` function** (around line 215-222):
Add userId check:
```javascript
exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId || req.headers['x-user-id'] || null;
        
        const sequence = await Sequence.findById(id);
        if (!sequence) {
            return res.status(404).json({ message: 'Sequence not found' });
        }
        
        // Check if user owns this sequence
        if (userId && sequence.userId && sequence.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Not allowed to delete this file' });
        }
        
        await Sequence.findByIdAndDelete(id);
        res.status(200).json({ message: 'Fasta deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```

**File: `backend/database/Sequence.js`**

Add userId field (already done):
```javascript
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null  // null for guest users
}
```

---

## Frontend Changes Needed:

**File: `frontend/src/App.jsx`**

1. **Update `fetchUploads` function** to send userId:
```javascript
const fetchUploads = async () => {
    try {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const userId = user?.id || user?._id || null;
        
        const url = userId ? `/api/fasta?userId=${userId}` : '/api/fasta';
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const formattedData = data.map(item => ({
                ...item,
                id: item._id
            }));
            setUploads(formattedData);
        }
    } catch (error) {
        console.error('Failed to fetch uploads', error);
    }
};
```

2. **Update `handleUpload` function** to send userId:
```javascript
const handleUpload = async (fasta, filename) => {
    setIsProcessing(true);
    try {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const userId = user?.id || user?._id || null;
        
        const response = await fetch('/api/fasta', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-user-id': userId || ''
            },
            body: JSON.stringify({ fasta, filename, userId }),
        });
        
        // ... rest of the code
    } catch (error) {
        console.error("Failed to upload file", error);
        alert("Failed to upload file");
    } finally {
        setIsProcessing(false);
    }
};
```

3. **Update `handleDelete` function** for guest vs registered users:
```javascript
const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sequence from the view?")) return;
    
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    // Guest users: UI-only deletion
    if (!user || user.role === 'guest' || user.email === 'guest') {
        setUploads(prev => prev.filter(item => item.id !== id));
        return;
    }
    
    // Registered users: Delete from database
    try {
        const userId = user.id || user._id;
        await fetch(`/api/fasta/${id}?userId=${userId}`, {
            method: 'DELETE',
            headers: { 'x-user-id': userId }
        });
        setUploads(prev => prev.filter(item => item.id !== id));
    } catch (error) {
        console.error('Failed to delete', error);
        // Fallback to UI-only deletion
        setUploads(prev => prev.filter(item => item.id !== id));
    }
};
```

---

## Summary of Changes:

### Backend:
1. ✅ Added `userId` field to Sequence model
2. ⏳ Filter `getAllFiles` by userId
3. ⏳ Add userId when uploading (postFasta)
4. ⏳ Check userId ownership when deleting

### Frontend:
1. ⏳ Send userId in fetchUploads
2. ⏳ Send userId in handleUpload
3. ⏳ Handle delete differently for guest vs registered users

### Result:
- Each user sees only their own uploads
- Guest users see empty list from server (use localStorage)
- Deletion works per-user
- Shared links work publicly (no auth required for viewing reports)

---

## Note:
The controller.js file keeps getting corrupted during edits. Please manually apply these changes or let me know if you want me to rewrite the entire file.
