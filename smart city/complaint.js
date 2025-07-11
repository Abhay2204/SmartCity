let currentPage = 0;
let hasMore = true;
let currentFilters = {
    location: '',
    category: '',
    sort: 'recent'
};
let selectedComplaintId = null;
const validSorts = ['recent', 'oldest'];
const sortKey = validSorts.includes(sort) ? sort : 'recent'; // fallback default

const sorted = filtered.sort((a, b) => {
    if (sortKey === 'recent') return new Date(b.created_at) - new Date(a.created_at);
    if (sortKey === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    return 0;
});


document.addEventListener('DOMContentLoaded', () => {
    loadComplaints();

    // Allow Enter key to submit comment
    document.getElementById('newComment').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitComment();
        }
    });
});

function applyFilters() {
    currentPage = 0;
    hasMore = true;
    currentFilters.location = document.getElementById('locationFilter').value;
    currentFilters.category = document.getElementById('categoryFilter').value;
   let sortValue = document.getElementById('sortFilter').value;
currentFilters.sort = sortValue.split(':')[0]; // ensures only 'recent' or 'oldest'


    document.getElementById('complaintsContainer').innerHTML = '';
    loadComplaints();
}

function loadMoreComplaints() {
    if (hasMore) {
        currentPage++;
        loadComplaints();
    }
}

async function loadComplaints() {
    try {
        document.querySelector('.loading').style.display = 'inline-block';

        const res = await fetch(`/api/comp2/anonymous?page=${currentPage}&location=${currentFilters.location}&category=${currentFilters.category}&sort=${currentFilters.sort}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Error fetching complaints');

        data.complaints.forEach(complaint => renderComplaintCard(complaint));
        document.getElementById('complaintCount').textContent = data.total;
        hasMore = data.hasMore;

        document.querySelector('.loading').style.display = 'none';
        if (!hasMore) document.getElementById('loadMoreBtn').style.display = 'none';
    } catch (error) {
        console.error('Load complaint error:', error.message);
        alert('Failed to load complaints');
    }
}

function renderComplaintCard(c) {
    const container = document.getElementById('complaintsContainer');

    const card = document.createElement('div');
    card.className = 'card complaint-card mb-3';
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${c.title}</h5>
            <h6 class="card-subtitle text-muted">${capitalize(c.category)} • ${capitalize(c.location)}</h6>
            <p class="card-text mt-2">${c.description}</p>
            <div class="d-flex justify-content-end">
                <button class="btn btn-sm btn-outline-secondary" onclick="showComments('${c._id}', ${c.commentCount})">
                    <i class="fas fa-comments me-1"></i>${c.commentCount || 0} Comments
                </button>
            </div>
        </div>
    `;
    container.appendChild(card);
}

function showComments(complaintId, count) {
    selectedComplaintId = complaintId;
    document.getElementById('commentsContainer').innerHTML = '<p class="text-muted">Loading comments...</p>';
    document.getElementById('newComment').value = '';
    fetch(`/api/comp2/anonymous/${complaintId}/comments`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const container = document.getElementById('commentsContainer');
                container.innerHTML = data.comments.length === 0 ? '<p class="text-muted">No comments yet.</p>' : '';
                data.comments.forEach(comment => {
                    const div = document.createElement('div');
                    div.className = 'border p-2 rounded mb-2';
                    div.textContent = comment.content;
                    container.appendChild(div);
                });
                new bootstrap.Modal(document.getElementById('commentModal')).show();
            } else {
                alert('Failed to load comments');
            }
        });
}

async function submitComment() {
    const content = document.getElementById('newComment').value.trim();
    if (!content) return alert('Comment cannot be empty');
    try {
        const res = await fetch(`/api/comp2/anonymous/${selectedComplaintId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        showComments(selectedComplaintId);
    } catch (err) {
        alert('Failed to add comment');
    }
}

async function submitComplaint() {
    const location = document.getElementById('complaintLocation').value;
    const category = document.getElementById('complaintCategory').value;
    const title = document.getElementById('complaintTitle').value.trim();
    const description = document.getElementById('complaintDescription').value.trim();

    if (!location || !category || !title || !description) {
        return alert('All fields are required');
    }

    try {
        const res = await fetch('/api/comp2/anonymous', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, category, title, description })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        bootstrap.Modal.getInstance(document.getElementById('complaintModal')).hide();
        document.getElementById('complaintForm').reset();
        currentPage = 0;
        document.getElementById('complaintsContainer').innerHTML = '';
        loadComplaints();
    } catch (err) {
        alert('Failed to submit complaint');
    }
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
