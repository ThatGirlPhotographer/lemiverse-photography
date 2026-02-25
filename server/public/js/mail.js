/**
 * Client-Side Integration for Lemiverse Mail
 * Designed to work with existing HTML structure using Data Attributes
 */

const api = {
    async fetchInbox() {
        const res = await fetch('/mail/list?folder=inbox');
        return await res.json();
    },
    async fetchEmail(id) {
        const res = await fetch(`/mail/email/${id}`);
        return await res.json();
    },
    async sendEmail(payload) {
        const res = await fetch('/mail/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    },
    async replyEmail(payload) {
        const res = await fetch('/mail/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    },
    async toggleStar(id) {
        const res = await fetch(`/mail/star/${id}`, { method: 'POST' });
        return await res.json();
    },
    async trashEmail(id) {
        const res = await fetch(`/mail/trash/${id}`, { method: 'POST' });
        return await res.json();
    }
};

// UI Rendering Helpers
function renderEmailList(emails) {
    const container = document.getElementById('email-list-container');
    if (!container) return;

    if (emails.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-gray-500">No messages found.</div>';
        return;
    }

    container.innerHTML = emails.map(email => `
        <div onclick="handleOpenMail('${email.id}')" 
             class="flex h-10 px-2 items-center text-sm border-b border-gray-100 hover:shadow-md cursor-pointer group hover:z-20 relative ${email.isRead ? 'bg-gray-50' : 'bg-white font-bold'}">
            <div class="flex text-gray-400 h-full items-center font-semibold w-1/5 py-1 pl-2 gap-3">
                <input type="checkbox" class="w-4 h-4 group-hover:block hidden" onclick="event.stopPropagation()">
                <i onclick="handleStar(event, '${email.id}')" class="${email.isStarred ? 'fa-solid text-yellow-400' : 'fa-regular group-hover:block hidden'} fa-star hover:text-yellow-400"></i>
                <span class="text-black ml-1 truncate">${email.sender}</span>
            </div>
            <div class="flex items-center py-1 px-2 w-[70%] h-full justify-between">
                <div class="flex w-[98%] overflow-hidden text-ellipsis whitespace-nowrap text-gray-600">
                    <span class="text-black ${email.isRead ? '' : 'font-bold'} mr-1">${email.subject}</span> - ${email.body.substring(0, 60)}...
                </div>
            </div>
            <div class="flex items-center py-1 px-2 w-[10%] h-full text-black justify-end ml-[10px] text-xs">
                ${new Date(email.dateCreated).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
            </div>
        </div>
    `).join('');
}

// Event Handlers
async function handleOpenMail(id) {
    const email = await api.fetchEmail(id);
    
    document.getElementById('read-subject').innerText = email.subject;
    document.getElementById('read-sender').innerText = email.sender;
    document.getElementById('read-email').innerText = `<${email.sender}>`; // In real app, separate email field
    document.getElementById('read-body').innerText = email.body;
    document.getElementById('read-date').innerText = new Date(email.dateCreated).toLocaleString();
    
    // Store current ID for reply
    document.getElementById('read-view').setAttribute('data-current-id', email.id);

    // Call UI Transition (Existing function name)
    openMailUI(); 
}

async function handleSend() {
    const to = document.querySelector('input[placeholder="Recipients"]').value;
    const subject = document.querySelector('input[placeholder="Subject"]').value;
    const body = document.querySelector('textarea').value;

    if(to && subject) {
        await api.sendEmail({ to, subject, body });
        toggleCompose(); // Close modal
        window.location.reload(); // Refresh list
    }
}

async function handleReply() {
    const id = document.getElementById('read-view').getAttribute('data-current-id');
    const body = document.querySelector('#reply-box textarea').value;
    
    if(body) {
        await api.replyEmail({ originalEmailId: id, body });
        document.querySelector('#reply-box textarea').value = ''; // Clear
        alert('Reply Sent');
    }
}

async function handleStar(e, id) {
    e.stopPropagation();
    await api.toggleStar(id);
    window.location.reload(); // Simple refresh to show state
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    // If we are on the main page, render list from server-injected data or fetch
    // For this implementation, we use the server-rendered list in app.ejs
    // But we attach the handlers here.
    
    // Attach Send Listener
    const sendBtn = document.querySelector('#compose-modal button.bg-[#0b57d0]');
    if(sendBtn) sendBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop default form sub
        handleSend();
    });

    // Attach Reply Listener
    const replyBtn = document.querySelector('#reply-box button.bg-[#0b57d0]');
    if(replyBtn) replyBtn.addEventListener('click', () => {
        handleReply();
    });
});