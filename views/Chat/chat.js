const token = localStorage.getItem('token');
const u_name = localStorage.getItem('username')
const username = u_name.replace(/"/g, '');
const userid = localStorage.getItem('userid')
let g_msgs;
let grp = 'common';
var users = [];
var groups = [];
var uniqueUsers


////////// For Displaying Groups creating page //////////
function toggleList(sectionId) {
    var Myname = document.getElementById('user-container')
    Myname.style.display = "none"
    var myDiv = document.getElementById("common-container");
    var listSection = document.getElementById(sectionId);
    myDiv.style.display = "none"

    if (listSection.style.display === 'none') {
        listSection.style.display = "none"
        listSection.style.display = "block"
    } else {
        listSection.style.display = "block"
    }

    // If showing the user list, dynamically generate checkboxes for users
    if (sectionId === 'userListSection') {
        displayUserCheckboxes();
    }
}

// JavaScript function to display checkboxes for users
function displayUserCheckboxes() {
    var userListForm = document.getElementById('userListForm');
    userListForm.innerHTML = ""; // Clear existing content

    for (var i = 0; i < users.length; i++) {
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'users';
        checkbox.value = users[i];
        checkbox.id = 'user' + i;
        if (users[i] == username) {
            checkbox.checked = true; // Set it to be checked by default
            checkbox.disabled = true
        }
        var label = document.createElement('label');
        label.htmlFor = 'user' + i;
        label.appendChild(document.createTextNode(users[i]));

        userListForm.appendChild(checkbox);
        userListForm.appendChild(label);
        userListForm.appendChild(document.createElement('br'));
    }
}

// JavaScript function to select/deselect all users
function selectAllUsers() {
    var checkboxes = document.getElementsByName('users');
    var selectAllCheckbox = document.getElementById('selectAll');

    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = selectAllCheckbox.checked;
    }
}

// JavaScript function to create a group
function createGroup() {
    var groupName = prompt('Enter group name:');
    if (groupName) {
        var selectedUsers = [];
        var checkboxes = document.getElementsByName('users');

        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                selectedUsers.push(checkboxes[i].value);
            }
        }

        // Display the created group as a clickable link in the group list
        var groupList = document.getElementById('menu-bar');
        var groupLink = document.createElement('a');
        groupLink.href = '#?group=' + encodeURIComponent(
            groupName); // Link to chat page with group name parameter
        groupLink.appendChild(document.createTextNode(groupName));
        groupList.appendChild(groupLink);
        groupLink.onclick = toggleVisibility
        // Store group information

        const group = {
            name: groupName,
            users: selectedUsers
        }
        groups.push(group);
        console.log(group)
        axios.post('/chat/createGroup', {
            group: group,
            you: username
        }, {
            headers: {
                "Authorization": token
            }
        })
            .then(response => {
                alert("Group created successfully")
            })
            .catch(err => {
                console.log(err)
            })
        location.reload();
        // Clear the form
        document.getElementById('createGroupForm').reset();
    }
}


////////// For displaying the Groups //////////
async function toggleVisibility(e) {
    try {
        console.log(e.target.textContent)
        localStorage.setItem('g_id', e.target.value)
        var Myname = document.getElementById('user-container')
        Myname.style.display = "none"
        var listSection = document.getElementById('userListSection');
        var myDiv = document.getElementById("common-container");
        listSection.style.display = 'none'

        if (myDiv.style.display === 'none') {
            myDiv.style.display = "none"
            myDiv.style.display = "block"
        } else {
            myDiv.style.display = "block"
        }

        document.getElementById('GMembers').style.display = "none"
        document.getElementById('newUsers').style.display = "none"

        grp = e.target.textContent
        grpId = e.target.value
        document.getElementById('name').innerHTML = `Group : ${e.target.textContent}`
        if (e.target.textContent) {
            g_name = `${e.target.textContent}_msgs`
        }
        if (e.target.textContent == 'common') {
            document.getElementById('Button-container').style.display = 'none';
            document.getElementById('deleteGroup').hidden = true
        }
        else {
            document.getElementById('Button-container').style.display = 'block';

            document.getElementById('deleteGroup').hidden = false
        }
        console.log("Group:", e.target.textContent);
        localStorage.setItem('g_name', e.target.textContent)
        await groupUsers(e.target.value);
        loadMsgs(e.target.value);
        console.log("mani")
        console.log('hello')
    } catch {
        console.log("error forund in executing  function")
    }

}


////////// For getting all groups from Backend //////////
function getGroups() {
    axios.get('/chat/getGroups', {
        headers: {
            "Authorization": token
        }
    })
        .then(response => {
            console.log(response)
            response.data.groups.forEach(element => {
                groups.push({
                    name: element.groupName,
                    users: element.members
                })
                var groupList = document.getElementById('menu-bar')
                var groupLi = document.createElement('li')
                var groupLink = document.createElement('a');
                groupLink.href = '#?group=' + encodeURIComponent(
                    element.groupName); // Link to chat page with group name parameter
                groupLink.onclick = toggleVisibility
                groupLink.value = element.id
                groupLink.appendChild(document.createTextNode(element.groupName));
                groupLi.appendChild(groupLink);
                groupList.appendChild(groupLi)



            });

        })
}

////////// For Updating the newly Sent Messages ////////// 
function updatemsgs() {
    return new Promise((resolve, reject) => {

        const L_msgs = JSON.parse(localStorage.getItem(`${grp}_msgs`))
        let maxId = Math.max(...L_msgs.map(msg => msg.id)) ?? 0;
        axios.get(`/chat/getLatestMsgs/${maxId}?grp=${grp}`, {
            headers: {
                "Authorization": token
            }
        })
            .then(response => {
                const newmsgs = response.data.messages;
                if (newmsgs.length) {
                    newmsgs.forEach(element => {
                        if (!document.getElementById(`message-${element.id}`)) {
                            addNewMessage(element);
                        }
                    })
                    L_msgs.push(...newmsgs)
                    if (L_msgs.length >= 10) {
                        L_msgs.splice(0, L_msgs.length - 10)
                    }
                    console.log(grp)
                    localStorage.setItem(`${grp}_msgs`, JSON.stringify(L_msgs));
                    scrollToBottom()
                }
                resolve(1)
            }).catch(err => {
                console.log(err);
                reject(0)
            })
    })

}

////////// For sending Messages //////////
function sendMessage(e) {
    console.log(token)
    e.preventDefault();
    const form = new FormData(e.target);
    const newmessage = form.get("message"); // Fix typo here
    console.log(newmessage);
    axios.post('/chat/sendMessage', {
        grp,
        newmessage
    }, {
        headers: {
            "Authorization": token
        }
    })
        .then(response => {
            console.log(response.data.messages)
            e.target.reset()
            addNewMessage(response.data.messages)
            // setTimeout(scrollToBottom, 100);
            scrollToBottom()
            updateChat();
        })
        .catch(error => {
            alert(error.response.status + ' error :' + error.response.data.message)
            console.error('Error in sending message:', error);
        });
}

////////// For Scrolling to the bottom automatically //////////
function scrollToBottom() {
    const messagesContainer = document.getElementById('messages');
    const lastMessage = messagesContainer.lastElementChild;

    if (lastMessage) {
        lastMessage.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });
    }
}

////////// For Displaying Messages //////////
function addNewMessage(msg) {
    const parentElement = document.getElementById('messages');
    const newRow = document.createElement('tr');

    if (msg.name == username) {
        newRow.setAttribute('id', `message-${msg.id}`)
        newRow.setAttribute('class', `yourmsg`)
        newRow.innerHTML = `<td>You : ${msg.message}</td>`;
    } else {
        newRow.setAttribute('id', `message-${msg.id}`)
        newRow.innerHTML = `<td>${msg.name} : ${msg.message}</td>`;
    }

    parentElement.appendChild(newRow);
}

////////// For storing and getting messages from the LocalStorage ////////// 
function loadMsgs(grpid) {
    return new Promise((resolve, reject) => {
        const messages = JSON.parse(localStorage.getItem(`${grp}_msgs`))
        console.log(messages)
        if (messages) {
            const len = messages.length
            console.log(messages)
            if (messages.length >= 10) {
                messages.splice(0, len - 10)
            }
            messages.forEach(element => {
                if (!document.getElementById(`message-${element.id}`)) {
                    addNewMessage(element);
                }
            })
            resolve(1)
        } else {
            const L_msgs = []
            axios.get(`/chat/getMessages/${grpid}`, {
                headers: {
                    "Authorization": token
                }
            })
                .then(response => {
                    const oldmsgs = response.data.messages;
                    console.log(oldmsgs)
                    L_msgs.push(...oldmsgs);
                    if (L_msgs.length >= 10) {
                        L_msgs.splice(0, L_msgs.length - 10)
                    }
                    localStorage.setItem(`${grp}_msgs`, JSON.stringify(L_msgs));
                    L_msgs.forEach(element => {
                        addNewMessage(element);
                    })
                    resolve(1)
                }).catch(err => {
                    console.log(err.response);
                    reject(0)
                })
        }
    })

}

////////// For Gettting All Users From Backend //////////
function getUsers() {
    return new Promise((resolve, reject) => {
        axios.get(`/chat/getUsers`, {
            headers: {
                "Authorization": token
            }
        })
            .then(response => {
                console.log(response)
                users = []
                response.data.users.forEach(ele => {
                    users.push(ele.name)
                })
                resolve(1)
            })
            .catch(err => {
                alert(err.response.status + ' error :' + err.response.data.message)
                document.body.innerHTML += `<div style="color:red;">${err} <div>`;
                reject(0)
            })
    })

}

////////// For Gettting Group Users From Backend //////////
function groupUsers(grp) {
    return new Promise((resolve, reject) => {
        axios.get(`/chat/getGroupUsers/${grpId}`, {
            headers: {
                "Authorization": token
            }
        })
            .then(response => {
                console.log(response)
                const parentElement = document.getElementById('messages');
                parentElement.innerHTML = ''
                response.data.users.forEach(ele => {
                    const parentElement = document.getElementById('messages');
                    const newRow = document.createElement('tr');
                    newRow.setAttribute('id', `user-${ele.id}`)
                    newRow.setAttribute('class', 'usersjoined')
                    if (response.data.you == ele.name) {
                        newRow.innerHTML = `<td>You joined</td>`;
                    } else {
                        newRow.innerHTML = `<td> ${ele.name} joined</td>`;
                    }
                    parentElement.appendChild(newRow);
                })
                resolve(1)
            })
            .catch(err => {
                alert(err.response.status + ' error :' + err.response.data.message)
                document.body.innerHTML += `<div style="color:red;">${err} <div>`;
                reject(0)
            })
    })

}

//////////For Displaying The Users present in Group //////////
function displayUsers() {
    document.getElementById('newUsers').style.display = "none"
    var userListForm = document.getElementById('GMembers');
    userListForm.innerHTML = ''
    console.log(userListForm.style.display)
    userListForm.style.display = (userListForm.style.display === "block") ? "none" : "block";

    axios.get(`/chat/showMembers/${grp}`, {
        headers: {
            "Authorization": token
        }
    }).then((member) => {
        console.log(member.data.users)
        console.log(member.data.adminUsers)
        const members = member.data.users
        console.log(members)
        console.log(userid)
        const target = member.data.adminUsers.find(obj => obj.userId === Number(userid));
        for (var i = 0; i < member.data.users.length; i++) {
            console.log(member.data.users[i].id)
            const targetObject = member.data.adminUsers.find(obj => obj.userId === member.data.users[i].id);
            console.log(target)

            var list = document.createElement('li');
            list.name = 'members';
            list.value = member.data.users[i].name;
            list.id = 'member' + i;
            list.textContent = (member.data.users[i].name == username) ? "You" : member.data.users[i].name
            if (!targetObject.admin && target.admin) {
                var adminButton = document.createElement('button')
                adminButton.textContent = 'Make Admin'
                adminButton.value = member.data.users[i].name
                adminButton.id = member.data.users[i].id
                adminButton.onclick = function (e) {
                    console.log(e.target)
                    makeAdmin(e.target)
                }

                var removeButton = document.createElement('button')
                removeButton.textContent = 'Remove User'
                removeButton.value = member.data.users[i].name
                removeButton.id = member.data.users[i].id
                removeButton.onclick = function (e) {
                    removeUser(e.target)
                }
                list.appendChild(adminButton)
                list.appendChild(removeButton)
            }
            else if (targetObject.admin && target.admin) {
                var adminButton = document.createElement('p')
                adminButton.innerHTML = `<i>  admin</i>`
                adminButton.style.display = 'inline'
                adminButton.style.fontSize = `0.7rem`
                list.appendChild(adminButton)

                if (member.data.users[i].name == username) {
                    userListForm.appendChild(list);
                    userListForm.appendChild(document.createElement('br'));
                    continue
                }
                var removeadminButton = document.createElement('button')
                removeadminButton.textContent = 'Remove Admin'
                removeadminButton.value = member.data.users[i].name
                removeadminButton.id = member.data.users[i].id
                removeadminButton.onclick = function (e) {
                    console.log(e.target)
                    removeAdmin(e.target)
                }
                list.appendChild(removeadminButton)
            }
            else if (targetObject.admin) {
                var adminButton = document.createElement('p')
                adminButton.innerHTML = `<i>  admin</i>`
                adminButton.style.display = 'inline'
                adminButton.style.fontSize = `0.7rem`
                list.appendChild(adminButton)
            }

            userListForm.appendChild(list);
            userListForm.appendChild(document.createElement('br'));
        }
    }).catch(err => {
        console.log(err)
    })

}

////////// For making , removing user from admin  //////////
function makeAdmin(e) {
    console.log(e.value)
    axios.patch(`/chat/makeAdminUser/${e.id}`, {
        grp: grp
    }, { headers: { 'Authorization': token } }).then((response) => {
        alert(response.data.message)
        document.getElementById('GMembers').style.display = "none"
    }).catch(err => {
        document.getElementById('errorMessage').textContent = err.response.data.message
        showPopup()
        console.log(err)
    })
}

function removeAdmin(e) {
    console.log(e.value)
    axios.patch(`/chat/removeAdminUser/${e.id}`, {
        grp: grp
    }, { headers: { 'Authorization': token } }).then((response) => {
        alert(response.data.message)
        document.getElementById('GMembers').style.display = "none"
    }).catch(err => {
        document.getElementById('errorMessage').textContent = err.response.data.message
        showPopup()
        console.log(err)
    })
}

////////// For removing user from Group //////////
function removeUser(e) {
    console.log(e.value)
    let index = groups.findIndex(obj => obj.name === grp);
    groups[index].users = groups[index].users.filter(user => user !== e.value);
    const group = groups[index]
    console.log(group)
    axios.patch(`/chat/removeGroupUser/${e.id}`, {
        grp: group
    }, { headers: { 'Authorization': token } }).then((response) => {
        console.log(response.data)
        document.getElementById('GMembers').style.display = "none"
        alert(response.data.message)
    }).catch(err => {
        document.getElementById('errorMessage').textContent = err.response.data.message
        showPopup()
        console.log(err)
    })
}

////////// For adding User to a Group //////////
function addMembers() {
    document.getElementById('GMembers').style.display = "none"
    console.log(grp)
    axios.get(`/chat/getGroupUsers/${grpId}`, {
        headers: {
            "Authorization": token
        }
    }).then((response) => {
        document.getElementById('newUsers').style.display = (document.getElementById('newUsers').style.display === 'none') ? 'block' : 'none'
        var userListForm = document.getElementById('addUser');
        userListForm.innerHTML = "";
        const gUsers = []
        response.data.users.forEach(ele => {
            gUsers.push(ele.name)
        })
        console.log(gUsers)
        console.log(users)
        uniqueUsers = users.filter(element => !gUsers.includes(element));
        console.log(uniqueUsers)
        for (var i = 0; i < uniqueUsers.length; i++) {

            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'uniqueUsers';
            checkbox.value = uniqueUsers[i];
            checkbox.id = 'uniqueUsers' + i;

            var label = document.createElement('label');
            label.htmlFor = 'uniqueUsers' + i;
            label.appendChild(document.createTextNode(uniqueUsers[i]));

            userListForm.appendChild(checkbox);
            userListForm.appendChild(label);
            userListForm.appendChild(document.createElement('br'));
        }
    }).catch(err => { console.log(err) })

}

function addToGroup() {
    var selectedUsers = [];
    var checkboxes = document.getElementsByName('uniqueUsers');

    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            selectedUsers.push(checkboxes[i].value);
        }
    }

    // Store group information
    let index = groups.findIndex(obj => obj.name === grp);
    console.log(selectedUsers)
    groups[index].users = groups[index].users.concat(selectedUsers);
    const group = groups[index]
    console.log(group)
    axios.patch('/chat/updateGroup', {
        group: group,
        selected: selectedUsers
    }, {
        headers: {
            "Authorization": token
        }
    }).then((response) => {
        alert(response.data.message)
        document.getElementById('newUsers').style.display = "none"
    }).catch(err => {
        console.log(err.response.data.message)
    })
}

////////// For filtering users in search //////////
function filterUsers() {
    const searchInput = document.getElementById('userSearch').value.toLowerCase();
    const addUserDiv = document.getElementById('addUser');
    addUserDiv.innerHTML = ""; // Clear existing content

    const filteredUsers = uniqueUsers.filter(user => user.toLowerCase().includes(searchInput));

    // Dynamically add checkboxes for filtered users
    filteredUsers.forEach(user => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'users';
        checkbox.value = user;
        checkbox.id = `user-${user}`;

        const label = document.createElement('label');
        label.htmlFor = `user-${user}`;
        label.appendChild(document.createTextNode(user));

        addUserDiv.appendChild(checkbox);
        addUserDiv.appendChild(label);
        addUserDiv.appendChild(document.createElement('br'));
    });
}

function filterAllUsers() {
    const searchInput = document.getElementById('allUserSearch').value.toLowerCase();
    const addUserDiv = document.getElementById('userListForm');
    addUserDiv.innerHTML = ""; // Clear existing content

    const filteredUsers = users.filter(user => user.toLowerCase().includes(searchInput));

    // Dynamically add checkboxes for filtered users
    filteredUsers.forEach(user => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'users';
        checkbox.value = user;
        checkbox.id = `user-${user}`;

        const label = document.createElement('label');
        label.htmlFor = `user-${user}`;
        label.appendChild(document.createTextNode(user));

        addUserDiv.appendChild(checkbox);
        addUserDiv.appendChild(label);
        addUserDiv.appendChild(document.createElement('br'));
    });
}


///////// Leave Group //////////
function leaveGroup() {
    const groupId = localStorage.getItem('g_id')
    let index = groups.findIndex(obj => obj.name === grp);
    groups[index].users = groups[index].users.filter(user => user !== username);
    const group = groups[index]
    console.log(group)
    axios.patch(`/chat/leaveGroup/${groupId}?userid=${userid}`, { grp: group }, {
        headers: {
            "Authorization": token
        }
    }).then((response) => {
        document.getElementById('errorMessage').textContent = response.data.message
        showPopup()
        console.log(response.data)
        location.reload();
    }).catch(err => {
        console.log(err.response.data)
        document.getElementById('errorMessage').textContent = err.response.data.message
        showPopup()
    })
}

////////// Delete Group //////////
function deleteGroup() {
    const groupId = localStorage.getItem('g_id')
    let index = groups.findIndex(obj => obj.name === grp);
    groups[index].users = groups[index].users.filter(user => user !== username);
    const group = groups[index]
    console.log(group)
    axios.delete(`/chat/deleteGroup/${groupId}?userid=${userid}`, {
        headers: {
            "Authorization": token
        }
    }).then((response) => {
        document.getElementById('errorMessage').textContent = response.data.message
        showPopup()
        console.log(response.data.message)
        location.reload();
    }).catch(err => {
        console.log(err.response)
        document.getElementById('errorMessage').textContent = err.response.data.message
        showPopup()
    })
}


////////// Updating Chats  with setInterval //////////
function updateChat() {
    // Call the getMessages function periodically
    setInterval(() => {
        updatemsgs();
    }, 1000);
}

////////// Loading the page //////////
window.onload = async () => {
    document.getElementById('username').innerHTML =
        `<strong>Hi, ${username}</strong>.<br> Welcome To Group Chat`
    document.getElementById('user').innerHTML =
        `<strong>Hi, ${username}</strong>`
    try {
        getGroups()
        await getUsers();

    } catch {
        throw new Error("something went wrong while loading the page")
    }

}

////////// For showing errors in popup //////////
function showPopup() {
    var popup = document.getElementById('popup');
    popup.style.display = 'block';
}
function closePopup() {
    document.getElementById('errorMessage').textContent = ''
    var popup = document.getElementById('popup');
    popup.style.display = 'none';
}


////////// For Getting messages from backend //////////
function getMessages() {
    console.log(token);
    axios.get(`/chat/getMessages/${grp}`, {
        headers: {
            "Authorization": token
        }
    })
        .then(response => {
            response.data.messages.forEach(element => {
                if (!document.getElementById(`message-${element.id}`)) {
                    addNewMessage(element);
                }
            })
            scrollToBottom()
        })
        .catch(error => {
            alert(error.response.status + ' error :' + error.response.data.message)
            console.error('Error in getting messages:', error);
        });
}
