document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  load_mailbox('inbox')
 
 
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send Email
  document.querySelector('#send_email').addEventListener('click', () => {
    let test = send_email()
    console.log(test)})
};

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Show all emails
  if (mailbox === 'inbox'){
    inbox_emails()
  } 
  //Show sent emails
  else if(mailbox === 'sent'){
    sent_emails()
  }
  else if (mailbox === 'archive'){
    archived_emails()
  }
};

function one_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      // ... do something else with email ...
      load_mailbox(`${email.subject}`) 
      detail_email(email)
  });
};

function detail_email(email){
  button_archive(email)
  const column_email = document.createElement('div')
  const subject = document.createElement('div')
  column_email.className = 'col info'
  subject.className = 'col subject'
  document.querySelector("#emails-view").appendChild(column_email)
  document.querySelector("#emails-view").appendChild(subject)
  for (let info in email){
    if (info === 'sender'){
      const div_info = document.createElement('div')
        div_info.innerHTML = `<b>${info.charAt(0).toUpperCase() + info.slice(1)}</b>: ${email[info]}`
        div_info.className = 'row'
        column_email.appendChild(div_info) 
    }
    else if (info === 'recipients'){
      const div_info = document.createElement('div')
      div_info.innerHTML = `<b>${info.charAt(0).toUpperCase() + info.slice(1)}</b>: ${email[info]}`
      div_info.className = 'row'
      column_email.appendChild(div_info) 
    } else if( info === 'subject') {
      const div_info = document.createElement('div')
      div_info.innerHTML = `<b>${info.charAt(0).toUpperCase() + info.slice(1)}</b>: ${email[info]}`
      div_info.className = 'row'
      column_email.appendChild(div_info) 
    } else if( info === 'timestamp'){
      const div_info = document.createElement('div')
      div_info.innerHTML= `<b>${info.charAt(0).toUpperCase() + info.slice(1)}</b>: ${email[info]}`
      div_info.className = 'row text-muted'
      column_email.appendChild(div_info)
    } else if (info === 'body'){
      const div_info = document.createElement('div')
      div_info.className = 'row'
      div_info.innerText= `${email[info]}`
      subject.appendChild(div_info)
    }
    else if (info === 'read'){
      email_read(email)
    }
  }
};

function email_archive(email){
  if (email.archived){
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body:JSON.stringify({
        archived:false
      })
    })
    .then(alert('Unarchived'))
    .then(load_mailbox('inbox'))
  } else {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body:JSON.stringify({
        archived:true
      })
    })
    .then(alert('Archived'))
    .then(load_mailbox('inbox'))
  }  
};

function button_archive(email){
  const archive_email = document.createElement('button')
  archive_email.style.marginBottom = '5px'
  if (email.archived){
    archive_email.innerText = 'Unarchive Email'
    archive_email.className = 'btn btn-danger'
  } else {
    archive_email.innerText = 'Archive Email'
    archive_email.className = 'btn btn-info'
  }
  
  archive_email.addEventListener('click', () => {email_archive(email)})
  document.querySelector("#emails-view").appendChild(archive_email) 
};

function see_inbox_emails(emails){
  for (const email of emails){
    const divemail = document.createElement('button')
    divemail.className = 'noread row btn btn-light btn-block emails'
    for (const info in email){
      if (info ==='read'){
        if (email[info])
        divemail.classList.remove('btn-light')
        divemail.classList.add('btn-secondary')
      }
      if (info === 'sender'){
        const div_info = document.createElement('span')
        div_info.innerHTML = `${email[info]}`
        div_info.style.float = 'left'
        div_info.style.fontWeight = 'bold'
        div_info.className = 'col-2'
        divemail.appendChild(div_info)
      } else if (info === 'subject'){
        const div_info = document.createElement('span')
        div_info.innerText = email[info]
        div_info.className = 'col-3'
        divemail.appendChild(div_info)
      } else if (info === 'timestamp'){
        const div_info = document.createElement('span')
        div_info.innerText = email[info]
        div_info.style.float = 'right'
        div_info.className = 'text-muted'
        div_info.className = 'col text-right'
        divemail.appendChild(div_info)
      }
    }
    divemail.addEventListener('click', () => {one_email(email.id)})
    document.querySelector('.col').appendChild(divemail)
  };
};

function inbox_emails(){
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
    // Print emails
    // ... do something else with emails ...
    const column_email = document.createElement('div')
    column_email.className = 'col'
    document.querySelector("#emails-view").appendChild(column_email)
    see_inbox_emails(emails)
  });
};

function sent_emails(){
  fetch('/emails/sent')
  .then(response => response.json())
  .then(emails =>{
    // Print emails 
    console.log(emails)
    const column_email = document.createElement('div')
    column_email.className = 'col'
    document.querySelector("#emails-view").appendChild(column_email)
    see_sent_emails(emails)
  })
};

function see_sent_emails(emails){
  for (const email of emails){
    const divemail = document.createElement('div')
    divemail.className = 'emails row'
    for (const info in email){
      if (info ==='read'){
        if (email[info])
        divemail.classList.add('read')
      }
      if (info === 'recipients'){
        const div_info = document.createElement('div')
        div_info.innerHTML = `<button onclick="one_email(${email.id})" id=${email.id}>${email[info]}</button>`
        div_info.className = 'col-3'
        divemail.appendChild(div_info)
      }else if (info === 'subject'){
        const div_info = document.createElement('div')
        div_info.innerText = email[info]
        div_info.className = 'col-3'
        divemail.appendChild(div_info)
      } else if (info === 'timestamp'){
        const div_info = document.createElement('div')
        div_info.innerText = email[info]
        div_info.className = 'text-muted'
        div_info.className = 'col text-right'
        divemail.appendChild(div_info)
      }
    }
    document.querySelector('.col').appendChild(divemail)
  };
};

function archived_emails(){
  fetch('/emails/archive')
  .then(response => response.json())
  .then(emails =>{
    // Print emails 
    console.log(emails)
    const column_email = document.createElement('div')
    column_email.className = 'col'
    document.querySelector("#emails-view").appendChild(column_email)
    see_archived_emails(emails)
  })
};

function see_archived_emails(emails){
  for (const email of emails){
    const divemail = document.createElement('div')
    divemail.className = 'emails row'
    for (const info in email){
      if (info ==='read'){
        if (email[info])
        divemail.classList.add('read')
      }
      if (info === 'sender'){
        const div_info = document.createElement('div')
        div_info.innerHTML = `<button onclick="one_email(${email.id})" id=${email.id}>${email[info]}</button>`
        div_info.style.fontWeight = 'bold'
        div_info.className = 'col-2'
        divemail.appendChild(div_info)
      } else if (info === 'recipients'){
        const div_info = document.createElement('div')
        div_info.innerText = `To: ${email[info]}`
        div_info.className = 'col-3'
        divemail.appendChild(div_info)
      }else if (info === 'subject'){
        const div_info = document.createElement('div')
        div_info.innerText = email[info]
        div_info.className = 'col-3'
        divemail.appendChild(div_info)
      } else if (info === 'timestamp'){
        const div_info = document.createElement('div')
        div_info.innerText = email[info]
        div_info.className = 'text-muted'
        div_info.className = 'col text-right'
        divemail.appendChild(div_info)
      }
    }
    document.querySelector('.col').appendChild(divemail)
  };
}

function send_email(){
  const c_recipients = document.querySelector('#compose-recipients').value;
  const c_subject = document.querySelector('#compose-subject').value;
  const c_body = document.querySelector('#compose-body').value;
 fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: c_recipients,
        subject: c_subject,
        body: c_body
    })
  })
  .then(response => response.json())
  .then(result => { 
    if (result.message){
      alert(result.message)
    }
    else(alert(result.error))
  });
};

function email_read(email){
  fetch(`/emails/${email.id}`, {
    method:'PUT',
    body: JSON.stringify({
      read:true
    })
  })
}

